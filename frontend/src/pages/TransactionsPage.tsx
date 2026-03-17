import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Card } from "components/common/Card";
import { PageHeader } from "components/common/PageHeader";
import { EmptyState } from "components/feedback/States";
import { useAccounts, useCategories, useTransactions } from "hooks/useFinanceQueries";
import { transactionService } from "services/financeServices";
import { formatCurrency, formatDate } from "utils/format";

const today = new Date().toISOString().slice(0, 10);

export const TransactionsPage = () => {
  const [search, setSearch] = useState("");
  const transactions = useTransactions(search ? { search } : undefined);
  const accounts = useAccounts();
  const categories = useCategories();
  const qc = useQueryClient();

  const categoryOptions = useMemo(() => categories.data?.filter((c) => c.type === 2) ?? [], [categories.data]);
  const canSubmit = (accounts.data?.length ?? 0) > 0 && categoryOptions.length > 0;

  const mutation = useMutation({
    mutationFn: transactionService.create,
    onSuccess: () => {
      toast.success("Transaction added");
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["budgets"] });
    },
    onError: () => {
      toast.error("Unable to add transaction");
    }
  });

  const lookup = useMemo(
    () => ({
      account: Object.fromEntries((accounts.data ?? []).map((a) => [a.id, a.name])),
      category: Object.fromEntries((categories.data ?? []).map((c) => [c.id, c.name]))
    }),
    [accounts.data, categories.data]
  );

  return (
    <div className="page-grid">
      <PageHeader title="Transactions" subtitle="Record and review every income, expense, and transfer" />

      <Card title="Quick add transaction" subtitle="Designed for speed: minimal fields, instant dashboard updates" className="quick-add-card">
        <form
          className="row-form compact"
          onSubmit={(e) => {
            e.preventDefault();
            if (!canSubmit) {
              toast.error("Create at least one account and expense category first.");
              return;
            }
            const form = new FormData(e.currentTarget as HTMLFormElement);
            mutation.mutate({
              accountId: String(form.get("accountId")),
              categoryId: form.get("categoryId") ? String(form.get("categoryId")) : undefined,
              destinationAccountId: undefined,
              type: Number(form.get("type")),
              amount: Number(form.get("amount")),
              transactionDate: String(form.get("transactionDate")),
              note: String(form.get("note") || "")
            });
            (e.currentTarget as HTMLFormElement).reset();
          }}
        >
          <select name="accountId" required aria-label="Account">
            {accounts.data?.map((a) => (
              <option value={a.id} key={a.id}>{a.name}</option>
            ))}
          </select>
          <select name="categoryId" aria-label="Category" required>
            {categoryOptions.map((c) => (
              <option value={c.id} key={c.id}>{c.name}</option>
            ))}
          </select>
          <select name="type" defaultValue={2} aria-label="Type">
            <option value={1}>Income</option>
            <option value={2}>Expense</option>
          </select>
          <input name="amount" type="number" min="0.01" step="0.01" required placeholder="Amount" aria-label="Amount" />
          <input name="transactionDate" type="date" defaultValue={today} required aria-label="Date" />
          <input name="note" placeholder="Optional note" aria-label="Note" />
          <button className="primary-btn" type="submit" disabled={mutation.isPending || !canSubmit}>
            {mutation.isPending ? "Adding..." : "Add"}
          </button>
        </form>
      </Card>

      <Card title="All transactions" subtitle="Search and scan across your complete history">
        <div className="table-toolbar">
          <input className="search-input" placeholder="Search by note" value={search} onChange={(e) => setSearch(e.target.value)} />
          <small>{transactions.data?.length ?? 0} records</small>
        </div>

        {!transactions.data?.length ? (
          <EmptyState text="No transactions match your filters" hint="Try a different keyword or add a new transaction." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Date</th><th>Account</th><th>Category</th><th>Type</th><th>Amount</th><th>Note</th></tr>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
