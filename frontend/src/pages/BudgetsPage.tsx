import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Card } from "components/common/Card";
import { PageHeader } from "components/common/PageHeader";
import { EmptyState, LoadingState } from "components/feedback/States";
import { useBudgets, useCategories } from "hooks/useFinanceQueries";
import { budgetService } from "services/financeServices";
import { getApiErrorMessage } from "utils/apiError";
import { formatCurrency } from "utils/format";

const getStatusTone = (level: string) => {
  if (level === "Critical" || level === "Exceeded") return "chip-expense";
  if (level === "Warning") return "chip-transfer";
  return "chip-income";
};

export const BudgetsPage = () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const budgets = useBudgets(month, year);
  const categories = useCategories();
  const qc = useQueryClient();

  const createBudget = useMutation({
    mutationFn: budgetService.create,
    onSuccess: () => {
      toast.success("Budget saved");
      qc.invalidateQueries({ queryKey: ["budgets"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Unable to save budget"))
  });

  const expenseCategories = categories.data?.filter((c) => Number(c.type) === 2) ?? [];

  return (
    <div className="page-grid">
      <PageHeader title="Budgets" subtitle="Set spending guardrails and stay in control before month-end surprises." />

      <Card title="Create monthly budget" subtitle="One budget per expense category for this month">
        <form className="row-form" onSubmit={(e) => {
          e.preventDefault();
          if (expenseCategories.length === 0) {
            toast.error("Create at least one expense category first.");
            return;
          }

          const form = new FormData(e.currentTarget as HTMLFormElement);
          createBudget.mutate({ categoryId: String(form.get("categoryId") || ""), month, year, amount: Number(form.get("amount") || 0) });
          (e.currentTarget as HTMLFormElement).reset();
        }}>
          <select name="categoryId" required>
            {expenseCategories.length === 0 ? <option value="">No expense categories</option> : null}
            {expenseCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input name="amount" type="number" min="0.01" step="0.01" placeholder="Monthly limit" required />
          <button className="primary-btn" type="submit" disabled={createBudget.isPending || expenseCategories.length === 0}>
            {createBudget.isPending ? "Saving..." : "Save Budget"}
          </button>
        </form>
      </Card>

      <Card title="Current month progress" subtitle="Visualized utilization helps you react early">
        {budgets.isLoading ? <LoadingState text="Loading budget progress..." /> : null}
        {!budgets.isLoading && !(budgets.data?.length) ? (
          <EmptyState text="No budgets set for this month" hint="Create 2-3 budgets to unlock utilization tracking and alerts." />
        ) : null}

        {budgets.data?.length ? (
          <div className="budget-grid">
            {budgets.data.map((b) => (
              <div key={b.id} className="budget-item">
                <div className="goal-top">
                  <strong>{b.categoryName}</strong>
                  <span>{b.utilizationPercent}%</span>
                </div>
                <div className="progress-track">
                  <div style={{ width: `${Math.min(b.utilizationPercent, 100)}%` }} />
                </div>
                <div className="budget-meta">
                  <small>{formatCurrency(b.actualSpend)} spent of {formatCurrency(b.amount)}</small>
                  <span className={`chip ${getStatusTone(b.alertLevel)}`}>{b.alertLevel}</span>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </Card>
    </div>
  );
};
