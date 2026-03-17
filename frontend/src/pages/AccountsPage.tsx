import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Card } from "components/common/Card";
import { PageHeader } from "components/common/PageHeader";
import { useAccounts } from "hooks/useFinanceQueries";
import { accountService } from "services/accountService";
import { formatCurrency } from "utils/format";

export const AccountsPage = () => {
  const accounts = useAccounts();
  const qc = useQueryClient();

  const createAccount = useMutation({
    mutationFn: accountService.create,
    onSuccess: () => {
      toast.success("Account created");
      qc.invalidateQueries({ queryKey: ["accounts"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    }
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
          <button className="primary-btn" type="submit">Create</button>
        </form>
      </Card>
      <Card title="Account list">
        <table className="table"><thead><tr><th>Name</th><th>Type</th><th>Currency</th><th>Balance</th></tr></thead><tbody>
          {accounts.data?.map((a) => <tr key={a.id}><td>{a.name}</td><td>{a.type}</td><td>{a.currency}</td><td>{formatCurrency(a.balance)}</td></tr>)}
        </tbody></table>
      </Card>
    </div>
  );
};
