import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuthStore } from "store/authStore";
import { Card } from "components/common/Card";
import { PageHeader } from "components/common/PageHeader";
import { useCategories } from "hooks/useFinanceQueries";
import { categoryService } from "services/financeServices";
import { getApiErrorMessage } from "utils/apiError";

export const SettingsPage = () => {
  const logout = useAuthStore((s) => s.logout);
  const categories = useCategories();
  const qc = useQueryClient();

  const createCategory = useMutation({
    mutationFn: categoryService.create,
    onSuccess: () => {
      toast.success("Category added");
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Unable to add category"))
  });

  return (
    <div className="page-grid">
      <PageHeader title="Settings" subtitle="Profile, security and category configuration" />
      <Card title="Category management">
        <form className="row-form" onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget as HTMLFormElement);
          createCategory.mutate({
            name: String(form.get("name") || ""),
            type: Number(form.get("type") || 2),
            colorHex: String(form.get("colorHex") || "#2563EB"),
            icon: String(form.get("icon") || "tag")
          });
          (e.currentTarget as HTMLFormElement).reset();
        }}>
          <input name="name" placeholder="Category name" required />
          <select name="type"><option value={1}>Income</option><option value={2}>Expense</option></select>
          <input name="colorHex" defaultValue="#2563EB" required />
          <input name="icon" defaultValue="tag" required />
          <button className="primary-btn" type="submit" disabled={createCategory.isPending}>{createCategory.isPending ? "Adding..." : "Add Category"}</button>
        </form>
        <table className="table"><thead><tr><th>Name</th><th>Type</th><th>Default</th></tr></thead><tbody>
          {categories.data?.map((c) => <tr key={c.id}><td>{c.name}</td><td>{c.type === 1 ? "Income" : "Expense"}</td><td>{c.isDefault ? "Yes" : "No"}</td></tr>)}
        </tbody></table>
      </Card>
      <Card title="Security">
        <p>Session management and password reset are enabled through secure auth APIs.</p>
        <button className="danger-btn" onClick={logout}>Log out</button>
      </Card>
    </div>
  );
};
