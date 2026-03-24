import { useMemo, useState } from "react";
import { FiDownload, FiRotateCcw } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Card } from "components/common/Card";
import { PageHeader } from "components/common/PageHeader";
import { CategorySpendChart } from "components/charts/CategorySpendChart";
import { IncomeExpenseChart } from "components/charts/IncomeExpenseChart";
import { SavingsProgressChart } from "components/charts/SavingsProgressChart";
import { EmptyState, LoadingState } from "components/feedback/States";
import { useBalanceTrend, useCategorySpend, useIncomeExpense, useSavingsReport } from "hooks/useFinanceQueries";
import { reportService } from "services/financeServices";
import { formatCurrency } from "utils/format";

export const ReportsPage = () => {
  const defaults = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      from: start.toISOString().slice(0, 10),
      to: now.toISOString().slice(0, 10)
    };
  }, []);

  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);

  const fromIso = `${from}T00:00:00.000Z`;
  const toIso = `${to}T23:59:59.999Z`;

  const category = useCategorySpend(fromIso, toIso);
  const incomeExpense = useIncomeExpense(fromIso, toIso);
  const balanceTrend = useBalanceTrend(fromIso, toIso);
  const savings = useSavingsReport();

  return (
    <div className="page-grid">
      <PageHeader title="Reports" subtitle="Clean visuals to explain spending, cashflow trends, and savings progress in your demo." />

      <Card className="report-filter-card" title="Report filters" subtitle="Refine the reporting window without changing V1 APIs">
        <form className="row-form report-filter-form" onSubmit={(e) => e.preventDefault()}>
          <label className="field">
            <span>From</span>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="field">
            <span>To</span>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
          <div className="report-actions">
            <button className="ghost-btn compact-btn report-reset-btn" type="button" onClick={() => { setFrom(defaults.from); setTo(defaults.to); }}>
              <FiRotateCcw />
              Reset
            </button>
            <a className="primary-btn compact-btn report-export-btn" href={reportService.exportCsvUrl(fromIso, toIso)} target="_blank" rel="noreferrer">
              <FiDownload />
              Export CSV
            </a>
          </div>
        </form>
      </Card>

      <Card title="Category Spend" subtitle="Where your money went in selected period">
        {category.isLoading ? <LoadingState text="Preparing category insights..." /> : null}
        {!category.isLoading && !(category.data?.length) ? (
          <EmptyState
            text="No category spend data yet"
            hint="Add expense transactions to unlock this chart."
            action={<Link className="ghost-btn compact-btn" to="/transactions">Add transactions</Link>}
          />
        ) : null}
        {category.data?.length ? <CategorySpendChart data={category.data} /> : null}
      </Card>

      <Card title="Income vs Expense" subtitle="Cashflow trend in selected period">
        {incomeExpense.isLoading ? <LoadingState text="Preparing cashflow trend..." /> : null}
        {!incomeExpense.isLoading && !(incomeExpense.data?.length) ? (
          <EmptyState
            text="No income/expense trend yet"
            hint="Create income and expense entries for a few dates."
            action={<Link className="ghost-btn compact-btn" to="/transactions">Go to transactions</Link>}
          />
        ) : null}
        {incomeExpense.data?.length ? <IncomeExpenseChart data={incomeExpense.data} /> : null}
      </Card>

      <Card title="Account Balance Snapshot" subtitle="Current balances by account (from existing V1 endpoint)">
        {balanceTrend.isLoading ? <LoadingState text="Loading account balances..." /> : null}
        {!balanceTrend.isLoading && !(balanceTrend.data?.length) ? (
          <EmptyState
            text="No accounts available"
            hint="Create at least one account."
            action={<Link className="ghost-btn compact-btn" to="/accounts">Create account</Link>}
          />
        ) : null}
        {balanceTrend.data?.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Account</th><th>Balance</th></tr></thead>
              <tbody>
                {balanceTrend.data.map((row, idx) => (
                  <tr key={`${row.accountName}-${idx}`}>
                    <td>{row.accountName}</td>
                    <td className="strong-cell">{formatCurrency(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </Card>

      <Card title="Savings Progress" subtitle="Goal completion snapshot">
        {savings.isLoading ? <LoadingState text="Preparing goal analytics..." /> : null}
        {!savings.isLoading && !(savings.data?.length) ? (
          <EmptyState
            text="No savings goals to chart"
            hint="Create at least one goal to visualize progress."
            action={<Link className="ghost-btn compact-btn" to="/goals">Create goal</Link>}
          />
        ) : null}
        {savings.data?.length ? <SavingsProgressChart data={savings.data} /> : null}
      </Card>
    </div>
  );
};
