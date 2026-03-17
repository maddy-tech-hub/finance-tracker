import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Card } from "components/common/Card";
import { PageHeader } from "components/common/PageHeader";
import { EmptyState, LoadingState } from "components/feedback/States";
import { useAccounts, useCategories, useRecurring } from "hooks/useFinanceQueries";
import { recurringService } from "services/financeServices";
import { formatCurrency, formatDate } from "utils/format";

const freqLabel: Record<number, string> = {
  1: "Daily",
  2: "Weekly",
  3: "Monthly",
  4: "Yearly"
};

export const RecurringPage = () => {
  const recurring = useRecurring();
  const accounts = useAccounts();
  const categories = useCategories();
  const qc = useQueryClient();

  const createRecurring = useMutation({
    mutationFn: recurringService.create,
    onSuccess: () => {
      toast.success("Recurring transaction saved");
      qc.invalidateQueries({ queryKey: ["recurring"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: () => toast.error("Unable to save recurring item")
  });

  const expenseCategories = categories.data?.filter((c) => c.type === 2) ?? [];

  return (
    <div className="page-grid">
      <PageHeader title="Recurring" subtitle="Keep recurring bills and subscriptions visible before they hit your balance." />
      <Card title="Schedule recurring payment" subtitle="Daily, weekly, monthly, or yearly automation">
        <form className="row-form" onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget as HTMLFormElement);
          createRecurring.mutate({
            accountId: String(form.get("accountId")),
            categoryId: String(form.get("categoryId")),
            destinationAccountId: undefined,
            type: Number(form.get("type")),
            frequency: Number(form.get("frequency")),
            amount: Number(form.get("amount")),
            nextRunDate: String(form.get("nextRunDate")),
            startDate: String(form.get("nextRunDate")),
            endDate: undefined,
            note: String(form.get("note") || ""),
            isPaused: false
          });
          (e.currentTarget as HTMLFormElement).reset();
        }}>
          <select name="accountId" required>{accounts.data?.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
          <select name="categoryId" required>{expenseCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          <select name="type"><option value={1}>Income</option><option value={2}>Expense</option></select>
          <select name="frequency"><option value={1}>Daily</option><option value={2}>Weekly</option><option value={3}>Monthly</option><option value={4}>Yearly</option></select>
          <input name="amount" type="number" min="0.01" step="0.01" placeholder="Amount" required />
          <input name="nextRunDate" type="date" required />
          <input name="note" placeholder="Label (e.g., Netflix, Rent)" />
          <button className="primary-btn" type="submit" disabled={createRecurring.isPending || expenseCategories.length === 0}>
            {createRecurring.isPending ? "Saving..." : "Save"}
          </button>
        </form>
      </Card>

      <Card title="Upcoming recurring items" subtitle="Prioritized by next due date">
        {recurring.isLoading ? <LoadingState text="Loading recurring schedule..." /> : null}
        {!recurring.isLoading && !(recurring.data?.length) ? (
          <EmptyState text="No recurring items yet" hint="Add rent, subscriptions, EMIs, or salary credits to forecast upcoming cash flow." />
        ) : null}

        {recurring.data?.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Amount</th><th>Type</th><th>Frequency</th><th>Next due</th><th>Status</th></tr></thead>
              <tbody>
                {recurring.data.map((r) => (
                  <tr key={r.id}>
                    <td className="strong-cell">{formatCurrency(r.amount)}</td>
                    <td>{r.type === 1 ? "Income" : r.type === 2 ? "Expense" : "Transfer"}</td>
                    <td>{freqLabel[r.frequency] ?? "Custom"}</td>
                    <td>{formatDate(r.nextRunDate)}</td>
                    <td><span className={`chip ${r.isPaused ? "chip-transfer" : "chip-income"}`}>{r.isPaused ? "Paused" : "Active"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </Card>
    </div>
  );
};
