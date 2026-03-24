import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import { Card } from "components/common/Card";
import { PageHeader } from "components/common/PageHeader";
import { EmptyState, LoadingState } from "components/feedback/States";
import { useBudgets, useCategories } from "hooks/useFinanceQueries";
import { budgetService } from "services/financeServices";
import type { Budget } from "types/api";
import { getApiErrorMessage } from "utils/apiError";
import { formatCurrency } from "utils/format";

const getStatusTone = (level: string) => {
  if (level === "Critical" || level === "Exceeded") return "chip-expense";
  if (level === "Warning") return "chip-transfer";
  return "chip-income";
};

const monthLabel = (month: number, year: number) =>
  new Date(year, month - 1, 1).toLocaleString(undefined, { month: "long", year: "numeric" });

const monthOptions = Array.from({ length: 12 }, (_, index) => ({
  value: index + 1,
  label: new Date(2000, index, 1).toLocaleString(undefined, { month: "long" })
}));

export const BudgetsPage = () => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const budgets = useBudgets(currentMonth, currentYear);
  const categories = useCategories();
  const qc = useQueryClient();
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editMonth, setEditMonth] = useState(String(currentMonth));
  const [editYear, setEditYear] = useState(String(currentYear));
  const defaultUpcomingMonth = new Date(currentYear, currentMonth, 1).getMonth() + 1;
  const defaultUpcomingYear = new Date(currentYear, currentMonth, 1).getFullYear();
  const [upcomingBaseMonth, setUpcomingBaseMonth] = useState(defaultUpcomingMonth);
  const [upcomingBaseYear, setUpcomingBaseYear] = useState(defaultUpcomingYear);

  const createBudget = useMutation({
    mutationFn: budgetService.create,
    onSuccess: () => {
      toast.success("Budget saved");
      qc.invalidateQueries({ queryKey: ["budgets"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Unable to save budget"))
  });

  const updateBudget = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { categoryId: string; month: number; year: number; amount: number } }) =>
      budgetService.update(id, payload),
    onSuccess: (_data, variables) => {
      const movedToDifferentMonth = variables.payload.month !== currentMonth || variables.payload.year !== currentYear;
      toast.success(movedToDifferentMonth ? `Budget updated and moved to ${monthLabel(variables.payload.month, variables.payload.year)}` : "Budget updated");
      setEditingBudget(null);
      qc.invalidateQueries({ queryKey: ["budgets"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Unable to update budget"))
  });

  const deleteBudget = useMutation({
    mutationFn: budgetService.remove,
    onSuccess: () => {
      toast.success("Budget deleted");
      qc.invalidateQueries({ queryKey: ["budgets"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Unable to delete budget"))
  });

  const expenseCategories = categories.data?.filter((c) => Number(c.type) === 2) ?? [];
  const nextMonth = new Date(upcomingBaseYear, upcomingBaseMonth - 1, 1);
  const monthAfterNext = new Date(upcomingBaseYear, upcomingBaseMonth, 1);
  const upcomingTargets = [
    { month: nextMonth.getMonth() + 1, year: nextMonth.getFullYear() },
    { month: monthAfterNext.getMonth() + 1, year: monthAfterNext.getFullYear() }
  ];
  const upcomingBudgets = useBudgets(upcomingTargets[0].month, upcomingTargets[0].year);
  const laterBudgets = useBudgets(upcomingTargets[1].month, upcomingTargets[1].year);
  const upcomingSections = [
    { key: `${upcomingTargets[0].month}-${upcomingTargets[0].year}`, month: upcomingTargets[0].month, year: upcomingTargets[0].year, data: upcomingBudgets.data, isLoading: upcomingBudgets.isLoading },
    { key: `${upcomingTargets[1].month}-${upcomingTargets[1].year}`, month: upcomingTargets[1].month, year: upcomingTargets[1].year, data: laterBudgets.data, isLoading: laterBudgets.isLoading }
  ];

  return (
    <div className="page-grid">
      <PageHeader title="Budgets" subtitle="Set spending guardrails and stay in control before month-end surprises." />

      <Card title="Create monthly budget" subtitle="One budget per expense category for any month">
        <p className="budget-create-hint">
          Pick an expense category, set a monthly cap, then choose the month and year this budget should apply to.
        </p>
        <form className="row-form budget-create-form" onSubmit={(e) => {
          e.preventDefault();
          if (expenseCategories.length === 0) {
            toast.error("Create at least one expense category first.");
            return;
          }

          const form = new FormData(e.currentTarget as HTMLFormElement);
          createBudget.mutate({
            categoryId: String(form.get("categoryId") || ""),
            month: Number(form.get("month") || currentMonth),
            year: Number(form.get("year") || currentYear),
            amount: Number(form.get("amount") || 0)
          });
        }}>
          <label className="field">
            <span>Category</span>
            <select name="categoryId" required>
              {expenseCategories.length === 0 ? <option value="">No expense categories</option> : null}
              {expenseCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>

          <label className="field">
            <span>Monthly limit</span>
            <input name="amount" type="number" min="0.01" step="0.01" placeholder="e.g. 12000" required />
          </label>

          <label className="field">
            <span>Month</span>
            <select name="month" defaultValue={String(currentMonth)} required>
              {monthOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Year</span>
            <input name="year" type="number" min="2000" max="2100" defaultValue={currentYear} required />
          </label>

          <button className="primary-btn budget-create-submit" type="submit" disabled={createBudget.isPending || expenseCategories.length === 0}>
            {createBudget.isPending ? "Saving..." : "Save Budget"}
          </button>
        </form>
      </Card>

      <Card title={`Budget progress: ${monthLabel(currentMonth, currentYear)}`} subtitle="Visualized utilization helps you react early">
        {budgets.isLoading ? <LoadingState text="Loading budget progress..." /> : null}
        {!budgets.isLoading && !(budgets.data?.length) ? (
          <EmptyState text="No budgets set for current month" hint="Create 2-3 budgets to unlock utilization tracking and alerts." />
        ) : null}

        {budgets.data?.length ? (
          <div className="budget-grid">
            {budgets.data.map((b) => (
              <div key={b.id} className="budget-item">
                <div className="goal-top">
                  <strong>{b.categoryName}</strong>
                  <div className="card-icon-actions">
                    <button
                      className="icon-plain-btn"
                      type="button"
                      title="Edit budget"
                      aria-label="Edit budget"
                      onClick={() => {
                        setEditingBudget(b);
                        setEditCategoryId(b.categoryId);
                        setEditAmount(String(b.amount));
                        setEditMonth(String(b.month));
                        setEditYear(String(b.year));
                      }}
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className="icon-plain-btn danger"
                      type="button"
                      title="Delete budget"
                      aria-label="Delete budget"
                      disabled={deleteBudget.isPending}
                      onClick={() => {
                        if (!window.confirm(`Delete budget for ${b.categoryName}?`)) return;
                        deleteBudget.mutate(b.id);
                      }}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
                <div className="progress-track">
                  <div style={{ width: `${Math.min(b.utilizationPercent, 100)}%` }} />
                </div>
                <div className="budget-meta">
                  <small>{b.utilizationPercent}% used</small>
                  <small>{formatCurrency(b.actualSpend)} spent of {formatCurrency(b.amount)}</small>
                  <span className={`chip ${getStatusTone(b.alertLevel)}`}>{b.alertLevel}</span>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </Card>

      <Card
        title="Upcoming budgets"
        subtitle="Next 2 months preview so planned budgets never get lost"
        action={
          <form className="budget-filter" onSubmit={(e) => e.preventDefault()}>
            <label className="budget-filter-field">
              <span>Month</span>
              <select
                aria-label="Upcoming start month"
                title="Upcoming start month"
                value={upcomingBaseMonth}
                onChange={(e) => setUpcomingBaseMonth(Number(e.target.value))}
              >
                {monthOptions.map((option) => (
                  <option key={`upcoming-${option.value}`} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label className="budget-filter-field">
              <span>Year</span>
              <input
                aria-label="Upcoming start year"
                title="Upcoming start year"
                type="number"
                min="2000"
                max="2100"
                value={upcomingBaseYear}
                onChange={(e) => {
                  const nextYear = Number(e.target.value);
                  if (!Number.isFinite(nextYear)) return;
                  setUpcomingBaseYear(nextYear);
                }}
              />
            </label>
          </form>
        }
      >
        {upcomingSections.map((section) => (
          <div key={section.key} style={{ marginBottom: 12 }}>
            <div className="goal-top" style={{ marginBottom: 8 }}>
              <strong>{monthLabel(section.month, section.year)}</strong>
              <small style={{ color: "var(--muted)" }}>{section.data?.length ?? 0} budgets</small>
            </div>
            {section.isLoading ? <LoadingState text="Loading..." /> : null}
            {!section.isLoading && !(section.data?.length) ? <small style={{ color: "var(--muted)" }}>No budgets planned</small> : null}
            {section.data?.length ? (
              <div className="budget-grid">
                {section.data.map((b) => (
                  <div key={`${section.key}-${b.id}`} className="budget-item">
                    <div className="goal-top">
                      <strong>{b.categoryName}</strong>
                      <span className={`chip ${getStatusTone(b.alertLevel)}`}>{b.alertLevel}</span>
                    </div>
                    <div className="budget-meta">
                      <small>Limit: {formatCurrency(b.amount)}</small>
                      <small>Used: {b.utilizationPercent}%</small>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </Card>

      {editingBudget ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Edit budget">
          <section className="modal-card">
            <div className="modal-head">
              <div>
                <h3>Edit Budget</h3>
                <p>Adjust limit, category, and month-year for this budget.</p>
              </div>
              <button className="ghost-btn icon-btn" type="button" onClick={() => setEditingBudget(null)} aria-label="Close">
                <FiX />
              </button>
            </div>

            <form
              className="quick-form"
              onSubmit={(e) => {
                e.preventDefault();
                updateBudget.mutate({
                  id: editingBudget.id,
                  payload: {
                    categoryId: editCategoryId,
                    amount: Number(editAmount),
                    month: Number(editMonth),
                    year: Number(editYear)
                  }
                });
              }}
            >
              <label>
                Category
                <select value={editCategoryId} onChange={(e) => setEditCategoryId(e.target.value)} required>
                  {expenseCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
              <label>
                Amount
                <input type="number" min="0.01" step="0.01" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} required />
              </label>
              <label>
                Month
                <input type="number" min="1" max="12" value={editMonth} onChange={(e) => setEditMonth(e.target.value)} required />
              </label>
              <label>
                Year
                <input type="number" min="2000" max="2100" value={editYear} onChange={(e) => setEditYear(e.target.value)} required />
              </label>
              <button className="primary-btn wide" type="submit" disabled={updateBudget.isPending}>
                {updateBudget.isPending ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
};
