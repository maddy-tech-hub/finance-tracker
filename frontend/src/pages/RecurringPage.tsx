import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FiEdit2, FiPauseCircle, FiPlayCircle, FiTrash2, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Card } from "components/common/Card";
import { PageHeader } from "components/common/PageHeader";
import { EmptyState, LoadingState } from "components/feedback/States";
import { useAccounts, useCategories, useRecurring } from "hooks/useFinanceQueries";
import { recurringService } from "services/financeServices";
import type { RecurringItem } from "types/api";
import { getApiErrorMessage } from "utils/apiError";
import { formatCurrency, formatDate } from "utils/format";

const freqLabel: Record<number, string> = {
  1: "Daily",
  2: "Weekly",
  3: "Monthly",
  4: "Yearly"
};

const today = new Date().toISOString().slice(0, 10);
const toDateInput = (value: string) => String(value).slice(0, 10);

export const RecurringPage = () => {
  const recurring = useRecurring();
  const accounts = useAccounts();
  const categories = useCategories();
  const qc = useQueryClient();
  const [txType, setTxType] = useState(2);
  const [editingItem, setEditingItem] = useState<RecurringItem | null>(null);
  const [editType, setEditType] = useState(2);
  const [editAccountId, setEditAccountId] = useState("");
  const [editDestinationAccountId, setEditDestinationAccountId] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editFrequency, setEditFrequency] = useState(3);
  const [editAmount, setEditAmount] = useState("");
  const [editNextRunDate, setEditNextRunDate] = useState(today);
  const [editNote, setEditNote] = useState("");
  const [editPaused, setEditPaused] = useState(false);

  const refreshRecurringImpact = () => {
    qc.invalidateQueries({ queryKey: ["recurring"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
    qc.invalidateQueries({ queryKey: ["transactions"] });
    qc.invalidateQueries({ queryKey: ["accounts"] });
    qc.invalidateQueries({ queryKey: ["budgets"] });
    qc.invalidateQueries({ queryKey: ["report-category"] });
    qc.invalidateQueries({ queryKey: ["report-income-expense"] });
    qc.invalidateQueries({ queryKey: ["report-balance-trend"] });
    qc.invalidateQueries({ queryKey: ["v2-insights"] });
    qc.invalidateQueries({ queryKey: ["v2-trends"] });
    qc.invalidateQueries({ queryKey: ["v2-health-score"] });
    qc.invalidateQueries({ queryKey: ["v2-forecast-month"] });
    qc.invalidateQueries({ queryKey: ["v2-forecast-daily"] });
  };

  const createRecurring = useMutation({
    mutationFn: recurringService.create,
    onSuccess: () => {
      toast.success("Recurring transaction saved");
      refreshRecurringImpact();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Unable to save recurring item"))
  });

  const updateRecurring = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { accountId: string; destinationAccountId?: string; categoryId?: string; type: number; frequency: number; amount: number; startDate: string; nextRunDate: string; endDate?: string; note?: string; isPaused: boolean } }) =>
      recurringService.update(id, payload),
    onSuccess: () => {
      toast.success("Recurring item updated");
      setEditingItem(null);
      refreshRecurringImpact();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Unable to update recurring item"))
  });

  const deleteRecurring = useMutation({
    mutationFn: recurringService.remove,
    onSuccess: () => {
      toast.success("Recurring item deleted");
      refreshRecurringImpact();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Unable to delete recurring item"))
  });

  const categoryOptions = useMemo(() => {
    const all = categories.data ?? [];
    const byType = all.filter((c) => Number(c.type) === txType);
    return byType.length > 0 ? byType : all;
  }, [categories.data, txType]);

  const editCategoryOptions = useMemo(() => {
    const all = categories.data ?? [];
    const byType = all.filter((c) => Number(c.type) === editType);
    return byType.length > 0 ? byType : all;
  }, [categories.data, editType]);

  const isTransfer = txType === 3;
  const accountOptions = accounts.data ?? [];
  const hasAccounts = accountOptions.length > 0;
  const hasCategoriesForType = categoryOptions.length > 0;
  const canSubmit = hasAccounts && (isTransfer || hasCategoriesForType);
  const showSetupHint = !canSubmit;

  return (
    <div className="page-grid">
      <PageHeader title="Recurring" subtitle="Keep recurring bills and subscriptions visible before they hit your balance." />
      <Card title="Schedule recurring payment" subtitle="Daily, weekly, monthly, or yearly automation">
        {showSetupHint ? (
          <div className="recurring-setup-hint" role="status" aria-live="polite">
            <p>
              {!hasAccounts && !isTransfer && !hasCategoriesForType
                ? "Add at least one account and one category to start recurring automation."
                : !hasAccounts
                  ? "Add at least one account to start recurring automation."
                  : "Add a category for the selected transaction type to continue."}
            </p>
            <div className="recurring-setup-actions">
              {!hasAccounts ? (
                <Link className="ghost-btn recurring-setup-action" to="/accounts">
                  Go to accounts
                </Link>
              ) : null}
              {!isTransfer && !hasCategoriesForType ? (
                <Link className="ghost-btn recurring-setup-action" to="/settings">
                  Go to category settings
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}
        {canSubmit ? (
          <form
            className="row-form recurring-create-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!canSubmit) {
                toast.error("Add at least one account and category first.");
                return;
              }

              const form = new FormData(e.currentTarget as HTMLFormElement);
              const nextRunDate = String(form.get("nextRunDate") || "");
              const accountId = String(form.get("accountId") || "");
              const destinationAccountId = String(form.get("destinationAccountId") || "");
              const categoryId = String(form.get("categoryId") || "");

              createRecurring.mutate({
                accountId,
                destinationAccountId: isTransfer && destinationAccountId ? destinationAccountId : undefined,
                categoryId: !isTransfer && categoryId ? categoryId : undefined,
                type: Number(form.get("type")),
                frequency: Number(form.get("frequency")),
                amount: Number(form.get("amount")),
                startDate: nextRunDate,
                nextRunDate,
                endDate: String(form.get("endDate") || "") || undefined,
                note: String(form.get("note") || ""),
                isPaused: false
              });
              (e.currentTarget as HTMLFormElement).reset();
              setTxType(2);
            }}
          >
            <label className="field recurring-field recurring-from">
              <span>From account</span>
              <select name="accountId" required>
                {accountOptions.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </label>

            {isTransfer ? (
              <label className="field recurring-field recurring-category">
                <span>To account</span>
                <select name="destinationAccountId" required disabled={accountOptions.length < 2}>
                  <option value="">{accountOptions.length < 2 ? "Add one more account" : "Select destination account"}</option>
                  {accountOptions.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </label>
            ) : (
              <label className="field recurring-field recurring-category">
                <span>Category</span>
                <select name="categoryId" required disabled={categoryOptions.length === 0}>
                  {categoryOptions.length === 0 ? <option value="">No categories available</option> : categoryOptions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
            )}

            <label className="field recurring-field recurring-type">
              <span>Transaction type</span>
              <select name="type" value={txType} onChange={(e) => setTxType(Number(e.target.value))}>
                <option value={1}>Income</option>
                <option value={2}>Expense</option>
                <option value={3}>Transfer</option>
              </select>
            </label>

            <label className="field recurring-field recurring-frequency">
              <span>Repeat every</span>
              <select name="frequency">
                <option value={1}>Daily</option>
                <option value={2}>Weekly</option>
                <option value={3}>Monthly</option>
                <option value={4}>Yearly</option>
              </select>
            </label>

            <label className="field recurring-field recurring-amount">
              <span>Amount</span>
              <input name="amount" type="number" min="0.01" step="0.01" placeholder="Amount" required />
            </label>
            <label className="field recurring-field recurring-date">
              <span>First run date</span>
              <input name="nextRunDate" type="date" defaultValue={today} required />
            </label>
            <label className="field recurring-field recurring-note-field">
              <span>Description (optional)</span>
              <input name="note" placeholder="Label (e.g., Netflix, Rent)" />
            </label>

            <button className="primary-btn recurring-submit-btn" type="submit" disabled={createRecurring.isPending || !canSubmit}>
              {createRecurring.isPending ? "Saving..." : "Save"}
            </button>
          </form>
        ) : null}
      </Card>

      <Card title="Upcoming recurring items" subtitle="Prioritized by next due date">
        {recurring.isLoading ? <LoadingState text="Loading recurring schedule..." /> : null}
        {!recurring.isLoading && !(recurring.data?.length) ? (
          <EmptyState text="No recurring items yet" hint="Add rent, subscriptions, EMIs, or salary credits to forecast upcoming cash flow." />
        ) : null}

        {recurring.data?.length ? (
          <div className="table-wrap">
            <table className="table recurring-table">
              <thead><tr><th>Amount</th><th>Type</th><th>Frequency</th><th>Next due</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {recurring.data.map((r) => (
                  <tr key={r.id}>
                    <td className="strong-cell">{formatCurrency(r.amount)}</td>
                    <td>{r.type === 1 ? "Income" : r.type === 2 ? "Expense" : "Transfer"}</td>
                    <td>{freqLabel[r.frequency] ?? "Custom"}</td>
                    <td>{formatDate(r.nextRunDate)}</td>
                    <td><span className={`chip ${r.isPaused ? "chip-transfer" : "chip-income"}`}>{r.isPaused ? "Paused" : "Active"}</span></td>
                    <td>
                      <div className="card-icon-actions recurring-row-actions">
                        <button
                          className="icon-plain-btn"
                          type="button"
                          title="Edit"
                          aria-label="Edit recurring item"
                          onClick={() => {
                            setEditingItem(r);
                            setEditType(r.type);
                            setEditAccountId(r.accountId);
                            setEditDestinationAccountId(r.destinationAccountId ?? "");
                            setEditCategoryId(r.categoryId ?? "");
                            setEditFrequency(r.frequency);
                            setEditAmount(String(r.amount));
                            setEditNextRunDate(toDateInput(r.nextRunDate));
                            setEditNote(r.note ?? "");
                            setEditPaused(r.isPaused);
                          }}
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          className="icon-plain-btn"
                          type="button"
                          title={r.isPaused ? "Resume" : "Pause"}
                          aria-label={r.isPaused ? "Resume recurring item" : "Pause recurring item"}
                          onClick={() =>
                            updateRecurring.mutate({
                              id: r.id,
                              payload: {
                                accountId: r.accountId,
                                destinationAccountId: r.destinationAccountId,
                                categoryId: r.categoryId,
                                type: r.type,
                                frequency: r.frequency,
                                amount: r.amount,
                                startDate: toDateInput(r.nextRunDate),
                                nextRunDate: toDateInput(r.nextRunDate),
                                note: r.note,
                                isPaused: !r.isPaused
                              }
                            })
                          }
                        >
                          {r.isPaused ? <FiPlayCircle /> : <FiPauseCircle />}
                        </button>
                        <button className="icon-plain-btn danger" type="button" title="Delete" aria-label="Delete recurring item" onClick={() => deleteRecurring.mutate(r.id)}>
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </Card>

      {editingItem ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Edit recurring item">
          <section className="modal-card">
            <div className="modal-head">
              <div>
                <h3>Edit Recurring Item</h3>
                <p>Update schedule and amount, then save.</p>
              </div>
              <button className="ghost-btn icon-btn" type="button" onClick={() => setEditingItem(null)} aria-label="Close">
                <FiX />
              </button>
            </div>

            <form
              className="quick-form"
              onSubmit={(e) => {
                e.preventDefault();
                updateRecurring.mutate({
                  id: editingItem.id,
                  payload: {
                    accountId: editAccountId,
                    destinationAccountId: editType === 3 && editDestinationAccountId ? editDestinationAccountId : undefined,
                    categoryId: editType !== 3 && editCategoryId ? editCategoryId : undefined,
                    type: editType,
                    frequency: editFrequency,
                    amount: Number(editAmount),
                    startDate: editNextRunDate,
                    nextRunDate: editNextRunDate,
                    note: editNote || undefined,
                    isPaused: editPaused
                  }
                });
              }}
            >
              <label>
                Account
                <select value={editAccountId} onChange={(e) => setEditAccountId(e.target.value)} required>
                  {accounts.data?.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </label>
              {editType === 3 ? (
                <label>
                  Destination account
                  <select value={editDestinationAccountId} onChange={(e) => setEditDestinationAccountId(e.target.value)} required>
                    <option value="">Select destination account</option>
                    {accounts.data?.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </label>
              ) : (
                <label>
                  Category
                  <select value={editCategoryId} onChange={(e) => setEditCategoryId(e.target.value)} required>
                    {editCategoryOptions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </label>
              )}
              <label>
                Type
                <select value={editType} onChange={(e) => setEditType(Number(e.target.value))}>
                  <option value={1}>Income</option>
                  <option value={2}>Expense</option>
                  <option value={3}>Transfer</option>
                </select>
              </label>
              <label>
                Frequency
                <select value={editFrequency} onChange={(e) => setEditFrequency(Number(e.target.value))}>
                  <option value={1}>Daily</option>
                  <option value={2}>Weekly</option>
                  <option value={3}>Monthly</option>
                  <option value={4}>Yearly</option>
                </select>
              </label>
              <label>
                Amount
                <input type="number" min="0.01" step="0.01" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} required />
              </label>
              <label>
                Next run date
                <input type="date" value={editNextRunDate} onChange={(e) => setEditNextRunDate(e.target.value)} required />
              </label>
              <label className="wide">
                Note
                <input value={editNote} onChange={(e) => setEditNote(e.target.value)} placeholder="Optional note" />
              </label>
              <label>
                Is paused
                <select value={editPaused ? "1" : "0"} onChange={(e) => setEditPaused(e.target.value === "1")}>
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </label>
              <button className="primary-btn wide" type="submit" disabled={updateRecurring.isPending}>
                {updateRecurring.isPending ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
};
