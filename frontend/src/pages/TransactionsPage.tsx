import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Card } from "components/common/Card";
import { PageHeader } from "components/common/PageHeader";
import { EmptyState } from "components/feedback/States";
import { useAccounts, useCategories, useTransactions } from "hooks/useFinanceQueries";
import { transactionService } from "services/financeServices";
import type { Transaction } from "types/api";
import { getApiErrorMessage } from "utils/apiError";
import { formatCurrency, formatDate } from "utils/format";

const today = new Date().toISOString().slice(0, 10);

export const TransactionsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [from, setFrom] = useState(searchParams.get("from") ?? "");
  const [to, setTo] = useState(searchParams.get("to") ?? "");
  const [accountFilter, setAccountFilter] = useState(searchParams.get("accountId") ?? "");
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("categoryId") ?? "");
  const [txType, setTxType] = useState(2);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDate, setEditDate] = useState(today);
  const [editNote, setEditNote] = useState("");
  const [editType, setEditType] = useState(2);
  const [editAccountId, setEditAccountId] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");

  const accounts = useAccounts();
  const categories = useCategories();
  const qc = useQueryClient();

  const queryParams = useMemo(() => {
    const params: Record<string, string | number> = {};
    if (search.trim()) params.search = search.trim();
    if (from) params.from = from;
    if (to) params.to = to;
    if (accountFilter) params.accountId = accountFilter;
    if (categoryFilter) params.categoryId = categoryFilter;
    return params;
  }, [search, from, to, accountFilter, categoryFilter]);

  const transactions = useTransactions(Object.keys(queryParams).length > 0 ? queryParams : undefined);

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

  const canSubmit = (accounts.data?.length ?? 0) > 0 && categoryOptions.length > 0;
  const hasAccounts = (accounts.data?.length ?? 0) > 0;
  const hasCategories = categoryOptions.length > 0;
  const hasActiveFilters = Boolean(search.trim() || from || to || accountFilter || categoryFilter);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["transactions"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
    qc.invalidateQueries({ queryKey: ["budgets"] });
    qc.invalidateQueries({ queryKey: ["accounts"] });
    qc.invalidateQueries({ queryKey: ["v2-insights"] });
    qc.invalidateQueries({ queryKey: ["v2-trends"] });
  };

  const mutation = useMutation({
    mutationFn: transactionService.create,
    onSuccess: () => {
      toast.success("Transaction added");
      invalidate();
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Unable to add transaction"));
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Omit<Transaction, "id"> }) => transactionService.update(id, payload),
    onSuccess: () => {
      toast.success("Transaction updated");
      setEditing(null);
      invalidate();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Unable to update transaction"))
  });

  const deleteMutation = useMutation({
    mutationFn: transactionService.remove,
    onSuccess: () => {
      toast.success("Transaction deleted");
      invalidate();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Unable to delete transaction"))
  });

  const lookup = useMemo(
    () => ({
      account: Object.fromEntries((accounts.data ?? []).map((a) => [a.id, a.name])),
      category: Object.fromEntries((categories.data ?? []).map((c) => [c.id, c.name]))
    }),
    [accounts.data, categories.data]
  );

  useEffect(() => {
    const next = new URLSearchParams();
    if (search.trim()) next.set("search", search.trim());
    if (from) next.set("from", from);
    if (to) next.set("to", to);
    if (accountFilter) next.set("accountId", accountFilter);
    if (categoryFilter) next.set("categoryId", categoryFilter);
    setSearchParams(next, { replace: true });
  }, [search, from, to, accountFilter, categoryFilter, setSearchParams]);

  return (
    <div className="page-grid">
      <PageHeader title="Transactions" subtitle="Record and review every income, expense, and transfer" />

      <Card
        title="Quick add transaction"
        subtitle="Designed for speed: minimal fields, instant dashboard updates"
        className="quick-add-card"
        action={
          <button
            className="primary-btn transactions-quick-card-action card-action-chip card-action-chip-primary"
            type="submit"
            form="transactions-quick-form"
            disabled={mutation.isPending || !canSubmit}
          >
            {mutation.isPending ? "Adding..." : "Add"}
          </button>
        }
      >
        {!canSubmit ? (
          <div className="recurring-setup-hint" role="status" aria-live="polite">
            <p>
              {!hasAccounts && !hasCategories
                ? "Add at least one account and one category to start adding transactions."
                : !hasAccounts
                  ? "Add at least one account to start adding transactions."
                  : "Add a category for the selected type to continue."}
            </p>
            <div className="recurring-setup-actions">
              {!hasAccounts ? (
                <Link className="ghost-btn recurring-setup-action" to="/accounts">
                  Go to accounts
                </Link>
              ) : null}
              {!hasCategories ? (
                <Link className="ghost-btn recurring-setup-action" to="/settings">
                  Go to category settings
                </Link>
              ) : null}
            </div>
          </div>
        ) : (
          <form
            id="transactions-quick-form"
            className="row-form compact labeled-form transactions-quick-form"
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget as HTMLFormElement);
              mutation.mutate({
                accountId: String(form.get("accountId") || ""),
                categoryId: form.get("categoryId") ? String(form.get("categoryId")) : undefined,
                destinationAccountId: undefined,
                type: Number(form.get("type") || txType),
                amount: Number(form.get("amount") || 0),
                transactionDate: String(form.get("transactionDate") || ""),
                note: String(form.get("note") || "")
              });
              (e.currentTarget as HTMLFormElement).reset();
              setTxType(2);
            }}
          >
            <label className="field">
              <span>Account</span>
              <select name="accountId" required aria-label="Account">
                {accounts.data?.map((a) => (
                  <option value={a.id} key={a.id}>{a.name}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Category</span>
              <select name="categoryId" aria-label="Category" required>
                {categoryOptions.map((c) => (
                  <option value={c.id} key={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Type</span>
              <select name="type" value={txType} onChange={(e) => setTxType(Number(e.target.value))} aria-label="Type">
                <option value={1}>Income</option>
                <option value={2}>Expense</option>
              </select>
            </label>
            <label className="field transactions-quick-amount-field">
              <span>Amount</span>
              <input name="amount" type="number" min="0.01" step="0.01" required placeholder="e.g. 1200" aria-label="Amount" />
            </label>
            <label className="field transactions-quick-date-field">
              <span>Date</span>
              <input name="transactionDate" type="date" defaultValue={today} required aria-label="Date" />
            </label>
            <label className="field">
              <span>Note (optional)</span>
              <input name="note" placeholder="e.g. Grocery run" aria-label="Note" />
            </label>
          </form>
        )}
      </Card>

      <Card
        title="All transactions"
        subtitle="Search and filter across your complete history"
        className="transactions-list-card"
        action={
          <button
            className="ghost-btn transactions-filter-reset transactions-filter-card-action card-action-chip card-action-chip-neutral"
            type="button"
            disabled={!hasActiveFilters}
            onClick={() => { setSearch(""); setFrom(""); setTo(""); setAccountFilter(""); setCategoryFilter(""); }}
          >
            Clear filters
          </button>
        }
      >
        <form className="row-form labeled-form transactions-filter-form" onSubmit={(e) => e.preventDefault()}>
          <label className="field">
            <span>Search</span>
            <input className="search-input" placeholder="Search by note" value={search} onChange={(e) => setSearch(e.target.value)} />
          </label>
          <label className="field">
            <span>From</span>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From date" title="From date" />
          </label>
          <label className="field">
            <span>To</span>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label="To date" title="To date" />
          </label>
          <label className="field">
            <span>Account</span>
            <select value={accountFilter} onChange={(e) => setAccountFilter(e.target.value)} aria-label="Filter account" title="Filter account">
              <option value="">All accounts</option>
              {accounts.data?.map((a) => <option value={a.id} key={a.id}>{a.name}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Category</span>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} aria-label="Filter category" title="Filter category">
              <option value="">All categories</option>
              {categories.data?.map((c) => <option value={c.id} key={c.id}>{c.name}</option>)}
            </select>
          </label>
        </form>
        <small>{transactions.data?.length ?? 0} records</small>

        {!transactions.data?.length ? (
          <EmptyState text="No transactions match your filters" hint="Try different filters or add a new transaction." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Date</th><th>Account</th><th>Category</th><th>Type</th><th>Amount</th><th>Note</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {transactions.data.map((tx) => (
                  <tr key={tx.id}>
                    <td>{formatDate(tx.transactionDate)}</td>
                    <td>{lookup.account[tx.accountId] ?? "-"}</td>
                    <td>{tx.categoryId ? lookup.category[tx.categoryId] : "Transfer"}</td>
                    <td>
                      <span className={`chip ${tx.type === 1 ? "chip-income" : tx.type === 2 ? "chip-expense" : "chip-transfer"}`}>
                        {tx.type === 1 ? "Income" : tx.type === 2 ? "Expense" : "Transfer"}
                      </span>
                    </td>
                    <td className="strong-cell">{formatCurrency(tx.amount)}</td>
                    <td>{tx.note || "-"}</td>
                    <td>
                      <div className="card-icon-actions">
                        <button
                          className="icon-plain-btn"
                          type="button"
                          aria-label="Edit transaction"
                          onClick={() => {
                            setEditing(tx);
                            setEditAmount(String(tx.amount));
                            setEditDate(String(tx.transactionDate).slice(0, 10));
                            setEditNote(tx.note ?? "");
                            setEditType(tx.type);
                            setEditAccountId(tx.accountId);
                            setEditCategoryId(tx.categoryId ?? "");
                          }}
                        >
                          <FiEdit2 />
                        </button>
                        <button className="icon-plain-btn danger" type="button" aria-label="Delete transaction" onClick={() => deleteMutation.mutate(tx.id)}>
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

      {editing ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Edit transaction">
          <section className="modal-card">
            <div className="modal-head">
              <div>
                <h3>Edit Transaction</h3>
                <p>Update amount, date, account and category safely.</p>
              </div>
              <button className="ghost-btn icon-btn" type="button" onClick={() => setEditing(null)} aria-label="Close">
                <FiX />
              </button>
            </div>

            <form className="quick-form" onSubmit={(e) => {
              e.preventDefault();
              updateMutation.mutate({
                id: editing.id,
                payload: {
                  accountId: editAccountId,
                  destinationAccountId: undefined,
                  categoryId: editType === 3 ? undefined : editCategoryId,
                  type: editType,
                  amount: Number(editAmount),
                  transactionDate: editDate,
                  note: editNote
                }
              });
            }}>
              <label>
                Account
                <select value={editAccountId} onChange={(e) => setEditAccountId(e.target.value)} required>
                  {accounts.data?.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </label>
              <label>
                Type
                <select value={editType} onChange={(e) => setEditType(Number(e.target.value))}>
                  <option value={1}>Income</option>
                  <option value={2}>Expense</option>
                </select>
              </label>
              <label>
                Category
                <select value={editCategoryId} onChange={(e) => setEditCategoryId(e.target.value)} required>
                  {editCategoryOptions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
              <label>
                Amount
                <input type="number" min="0.01" step="0.01" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} required />
              </label>
              <label>
                Date
                <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} required />
              </label>
              <label className="wide">
                Note
                <input value={editNote} onChange={(e) => setEditNote(e.target.value)} />
              </label>
              <button className="primary-btn wide" type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
};
