import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FiBell, FiPlus, FiSearch, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAccounts, useCategories } from "hooks/useFinanceQueries";
import { transactionService } from "services/financeServices";
import { useAuthStore } from "store/authStore";

const today = new Date().toISOString().slice(0, 10);

export const Topbar = () => {
  const fullName = useAuthStore((s) => s.fullName) ?? "User";
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const accounts = useAccounts();
  const categories = useCategories();

  const categoryOptions = useMemo(() => categories.data?.filter((c) => c.type === 2) ?? [], [categories.data]);
  const canSubmit = (accounts.data?.length ?? 0) > 0 && categoryOptions.length > 0;

  const addTransaction = useMutation({
    mutationFn: transactionService.create,
    onSuccess: () => {
      toast.success("Transaction saved");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["budgets"] });
    },
    onError: () => {
      toast.error("Unable to save transaction");
    }
  });

  return (
    <>
      <header className="topbar">
        <div className="search-box" role="search">
          <FiSearch />
          <input placeholder="Search transactions, goals, categories" aria-label="Search" />
        </div>
        <div className="topbar-actions">
          <button className="primary-btn topbar-add" type="button" onClick={() => setOpen(true)}>
            <FiPlus /> Add Transaction
          </button>
          <button className="ghost-btn icon-btn" type="button" aria-label="Notifications">
            <FiBell />
          </button>
          <div className="profile-pill" aria-label="Profile name">{fullName}</div>
        </div>
      </header>

      <button className="mobile-fab" type="button" onClick={() => setOpen(true)} aria-label="Add transaction">
        <FiPlus />
      </button>

      {open ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Quick add transaction">
          <section className="modal-card">
            <div className="modal-head">
              <div>
                <h3>Quick Add Transaction</h3>
                <p>Capture it in seconds and keep your dashboard accurate.</p>
              </div>
              <button className="ghost-btn icon-btn" type="button" onClick={() => setOpen(false)} aria-label="Close">
                <FiX />
              </button>
            </div>

            <form
              className="quick-form"
              onSubmit={(event) => {
                event.preventDefault();
                if (!canSubmit) {
                  toast.error("Create at least one account and expense category first.");
                  return;
                }
                const form = new FormData(event.currentTarget as HTMLFormElement);
                addTransaction.mutate({
                  accountId: String(form.get("accountId")),
                  destinationAccountId: undefined,
                  categoryId: String(form.get("categoryId")),
                  type: Number(form.get("type")),
                  amount: Number(form.get("amount")),
                  transactionDate: String(form.get("transactionDate")),
                  note: String(form.get("note") || "")
                });
                (event.currentTarget as HTMLFormElement).reset();
              }}
            >
              <label>
                Account
                <select name="accountId" required>
                  {accounts.data?.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </label>

              <label>
                Category
                <select name="categoryId" required>
                  {categoryOptions.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </label>

              <label>
                Type
                <select name="type" defaultValue={2}>
                  <option value={1}>Income</option>
                  <option value={2}>Expense</option>
                </select>
              </label>

              <label>
                Amount
                <input name="amount" type="number" min="0.01" step="0.01" placeholder="0.00" required autoFocus />
              </label>

              <label>
                Date
                <input name="transactionDate" type="date" defaultValue={today} required />
              </label>

              <label className="wide">
                Note
                <input name="note" placeholder="Optional note" />
              </label>

              <button className="primary-btn wide" type="submit" disabled={addTransaction.isPending || !canSubmit}>
                {addTransaction.isPending ? "Saving..." : "Save Transaction"}
              </button>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
};
