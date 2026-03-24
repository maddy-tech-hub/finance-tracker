import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuthStore } from "store/authStore";
import { Card } from "components/common/Card";
import { PageHeader } from "components/common/PageHeader";
import { EmptyState } from "components/feedback/States";
import { useCategories } from "hooks/useFinanceQueries";
import { categoryService } from "services/financeServices";
import type { Category } from "types/api";
import { getApiErrorMessage } from "utils/apiError";

const ICON_OPTIONS = [
  "tag",
  "wallet",
  "briefcase",
  "gift",
  "shopping-bag",
  "home",
  "car",
  "bolt",
  "film",
  "heart",
  "book-open",
  "plane",
  "repeat",
  "trending-up",
  "package",
  "rotate-ccw",
  "laptop",
  "circle"
];

const iconLabel = (key: string) => key.replaceAll("-", " ").replace(/\b\w/g, (m) => m.toUpperCase());

export const SettingsPage = () => {
  const logout = useAuthStore((s) => s.logout);
  const categories = useCategories();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState(2);
  const [editColor, setEditColor] = useState("#2563EB");
  const [editIcon, setEditIcon] = useState("tag");

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["categories"] });
    qc.invalidateQueries({ queryKey: ["transactions"] });
    qc.invalidateQueries({ queryKey: ["budgets"] });
    qc.invalidateQueries({ queryKey: ["v2-rules"] });
    qc.invalidateQueries({ queryKey: ["v2-trends"] });
  };

  const createCategory = useMutation({
    mutationFn: categoryService.create,
    onSuccess: () => {
      toast.success("Category added");
      invalidate();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Unable to add category"))
  });

  const updateCategory = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Omit<Category, "id" | "isDefault"> }) => categoryService.update(id, payload),
    onSuccess: () => {
      toast.success("Category updated");
      setEditing(null);
      invalidate();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Unable to update category"))
  });

  const deleteCategory = useMutation({
    mutationFn: categoryService.remove,
    onSuccess: () => {
      toast.success("Category deleted");
      invalidate();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Unable to delete category"))
  });

  return (
    <div className="page-grid">
      <PageHeader title="Settings" subtitle="Profile, security and category configuration" />
      <Card title="Add category" subtitle="Create custom income or expense categories">
        <p className="form-intro">Define reusable categories used across transactions, budgets, reports, and rules.</p>
        <form className="row-form labeled-form settings-create-form" onSubmit={(e) => {
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
          <label className="field">
            <span>Category name</span>
            <input name="name" placeholder="e.g. Groceries" required />
          </label>
          <label className="field">
            <span>Type</span>
            <select name="type">
              <option value={1}>Income</option>
              <option value={2}>Expense</option>
            </select>
          </label>
          <label className="field">
            <span>Color</span>
            <input name="colorHex" type="color" defaultValue="#2563EB" required />
          </label>
          <label className="field">
            <span>Icon key</span>
            <select name="icon" defaultValue="tag">
              {ICON_OPTIONS.map((icon) => (
                <option key={icon} value={icon}>{iconLabel(icon)}</option>
              ))}
            </select>
          </label>
          <button className="primary-btn settings-create-submit" type="submit" disabled={createCategory.isPending}>{createCategory.isPending ? "Adding..." : "Add Category"}</button>
        </form>
      </Card>
      <Card title="Category list" subtitle="Default and custom categories currently available">
        {!categories.data?.length ? (
          <EmptyState text="No categories available" hint="Create at least one category to classify transactions and budgets." />
        ) : (
          <div className="table-wrap">
            <table className="table settings-category-table">
              <thead>
                <tr><th>Name</th><th>Type</th><th>Default</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {categories.data.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <span className="category-name-cell">
                        <span className="category-color-dot" style={{ backgroundColor: c.colorHex }} />
                        {c.name}
                      </span>
                    </td>
                    <td>{c.type === 1 ? "Income" : "Expense"}</td>
                    <td>{c.isDefault ? "System" : "Custom"}</td>
                    <td>
                      <div className="card-icon-actions">
                        <button
                          className="icon-plain-btn"
                          type="button"
                          aria-label="Edit category"
                          onClick={() => {
                            setEditing(c);
                            setEditName(c.name);
                            setEditType(c.type);
                            setEditColor(c.colorHex);
                            setEditIcon(c.icon);
                          }}
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          className="icon-plain-btn danger"
                          type="button"
                          aria-label="Delete category"
                          title={c.isDefault ? "Default categories cannot be deleted" : "Delete category"}
                          disabled={c.isDefault}
                          onClick={() => {
                            if (!window.confirm(`Delete category "${c.name}"?`)) return;
                            deleteCategory.mutate(c.id);
                          }}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <Card title="Security">
        <p>Session management and password reset are enabled through secure auth APIs.</p>
        <button className="danger-btn" onClick={logout}>Log out</button>
      </Card>

      {editing ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Edit category">
          <section className="modal-card">
            <div className="modal-head">
              <div>
                <h3>Edit Category</h3>
                <p>Update category details without changing V1 behavior.</p>
              </div>
              <button className="ghost-btn icon-btn" type="button" onClick={() => setEditing(null)} aria-label="Close">
                <FiX />
              </button>
            </div>

            <form className="quick-form" onSubmit={(e) => {
              e.preventDefault();
              updateCategory.mutate({
                id: editing.id,
                payload: {
                  name: editName,
                  type: editType,
                  colorHex: editColor,
                  icon: editIcon
                }
              });
            }}>
              <label>
                Name
                <input value={editName} onChange={(e) => setEditName(e.target.value)} required />
              </label>
              <label>
                Type
                <select value={editType} onChange={(e) => setEditType(Number(e.target.value))}>
                  <option value={1}>Income</option>
                  <option value={2}>Expense</option>
                </select>
              </label>
              <label>
                Color
                <input type="color" value={editColor} onChange={(e) => setEditColor(e.target.value)} required />
              </label>
              <label>
                Icon
                <select value={editIcon} onChange={(e) => setEditIcon(e.target.value)}>
                  {!ICON_OPTIONS.includes(editIcon) ? <option value={editIcon}>{iconLabel(editIcon)}</option> : null}
                  {ICON_OPTIONS.map((icon) => (
                    <option key={icon} value={icon}>{iconLabel(icon)}</option>
                  ))}
                </select>
              </label>
              <button className="primary-btn wide" type="submit" disabled={updateCategory.isPending}>
                {updateCategory.isPending ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
};
