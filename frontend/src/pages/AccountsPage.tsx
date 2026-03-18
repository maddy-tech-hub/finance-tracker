import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import { Card } from "components/common/Card";
import { PageHeader } from "components/common/PageHeader";
import { useAccounts } from "hooks/useFinanceQueries";
import { accountService } from "services/accountService";
import type { Account } from "types/api";
import { getApiErrorMessage } from "utils/apiError";
import { formatCurrency } from "utils/format";

const accountTypeLabel: Record<number, string> = {
  1: "Cash",
  2: "Bank",
  3: "Credit Card",
  4: "Investment",
  5: "Wallet"
};

export const AccountsPage = () => {
  const accounts = useAccounts();
  const qc = useQueryClient();
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState(1);
  const [editCurrency, setEditCurrency] = useState("INR");
  const [editBalance, setEditBalance] = useState("");

  const createAccount = useMutation({
    mutationFn: accountService.create,
    onSuccess: () => {
      toast.success("Account created");
      qc.invalidateQueries({ queryKey: ["accounts"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Unable to create account"))
  });

  const updateAccount = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Omit<Account, "id" | "isArchived"> }) => accountService.update(id, payload),
    onSuccess: () => {
      toast.success("Account updated");
      setEditingAccount(null);
      qc.invalidateQueries({ queryKey: ["accounts"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Unable to update account"))
  });

  const deleteAccount = useMutation({
    mutationFn: accountService.remove,
    onSuccess: () => {
      toast.success("Account deleted");
      qc.invalidateQueries({ queryKey: ["accounts"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Unable to delete account"))
  });

  return (
    <div className="page-grid">
      <PageHeader title="Accounts" subtitle="Manage wallets, bank accounts, cards and balances" />
      <Card title="Create account">
        <form className="row-form" onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget as HTMLFormElement);
          createAccount.mutate({ name: String(form.get("name")), type: Number(form.get("type")), currency: String(form.get("currency")), balance: Number(form.get("balance")) });
          (e.currentTarget as HTMLFormElement).reset();
        }}>
          <input name="name" placeholder="Account name" required />
          <select name="type"><option value={1}>Cash</option><option value={2}>Bank</option><option value={3}>Credit Card</option><option value={4}>Investment</option><option value={5}>Wallet</option></select>
          <input name="currency" defaultValue="INR" required />
          <input name="balance" type="number" step="0.01" required />
          <button className="primary-btn" type="submit" disabled={createAccount.isPending}>{createAccount.isPending ? "Creating..." : "Create"}</button>
        </form>
      </Card>
      <Card title="Account list">
        <table className="table accounts-table"><thead><tr><th>Name</th><th>Type</th><th>Currency</th><th>Balance</th><th>Actions</th></tr></thead><tbody>
          {accounts.data?.map((a) => (
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>{accountTypeLabel[a.type] ?? a.type}</td>
              <td>{a.currency}</td>
              <td>{formatCurrency(a.balance)}</td>
              <td>
                <div className="card-icon-actions">
                  <button
                    className="icon-plain-btn"
                    type="button"
                    title="Edit"
                    aria-label="Edit account"
                    onClick={() => {
                      setEditingAccount(a);
                      setEditName(a.name);
                      setEditType(a.type);
                      setEditCurrency(a.currency);
                      setEditBalance(String(a.balance));
                    }}
                  >
                    <FiEdit2 />
                  </button>
                  <button className="icon-plain-btn danger" type="button" title="Delete" aria-label="Delete account" onClick={() => deleteAccount.mutate(a.id)}>
                    <FiTrash2 />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody></table>
      </Card>

      {editingAccount ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Edit account">
          <section className="modal-card">
            <div className="modal-head">
              <div>
                <h3>Edit Account</h3>
                <p>Update name, type, currency, and balance.</p>
              </div>
              <button className="ghost-btn icon-btn" type="button" onClick={() => setEditingAccount(null)} aria-label="Close">
                <FiX />
              </button>
            </div>

            <form
              className="quick-form"
              onSubmit={(e) => {
                e.preventDefault();
                updateAccount.mutate({
                  id: editingAccount.id,
                  payload: {
                    name: editName,
                    type: editType,
                    currency: editCurrency,
                    balance: Number(editBalance)
                  }
                });
              }}
            >
              <label>
                Name
                <input value={editName} onChange={(e) => setEditName(e.target.value)} required />
              </label>
              <label>
                Type
                <select value={editType} onChange={(e) => setEditType(Number(e.target.value))}>
                  <option value={1}>Cash</option>
                  <option value={2}>Bank</option>
                  <option value={3}>Credit Card</option>
                  <option value={4}>Investment</option>
                  <option value={5}>Wallet</option>
                </select>
              </label>
              <label>
                Currency
                <input value={editCurrency} onChange={(e) => setEditCurrency(e.target.value.toUpperCase())} required />
              </label>
              <label>
                Balance
                <input type="number" step="0.01" value={editBalance} onChange={(e) => setEditBalance(e.target.value)} required />
              </label>
              <button className="primary-btn wide" type="submit" disabled={updateAccount.isPending}>
                {updateAccount.isPending ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
};
