import { FiArrowDownRight, FiArrowUpRight, FiCalendar, FiClock, FiFlag, FiShield } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Card } from "components/common/Card";
import { PageHeader } from "components/common/PageHeader";
import { StatCard } from "components/common/StatCard";
import { EmptyState, LoadingState } from "components/feedback/States";
import { useDashboardSummary, useForecastMonth, useGoals, useHealthScore, useTransactions } from "hooks/useFinanceQueries";
import { formatCurrency, formatDate } from "utils/format";

export const DashboardPage = () => {
  const summary = useDashboardSummary();
  const goals = useGoals();
  const transactions = useTransactions();
  const healthScore = useHealthScore();
  const forecastMonth = useForecastMonth();

  if (summary.isLoading) return <LoadingState text="Building your dashboard..." />;

  const monthlyIncome = summary.data?.monthlyIncome ?? 0;
  const monthlyExpense = summary.data?.monthlyExpense ?? 0;
  const monthlySavings = summary.data?.monthlySavings ?? 0;
  const balance = summary.data?.totalBalance ?? 0;
  const savingsRate = monthlyIncome > 0 ? Math.max(0, Math.round((monthlySavings / monthlyIncome) * 100)) : 0;

  const healthDataPoints = healthScore.data?.dataPointsUsed ?? 0;
  const healthValueLabel = healthScore.isLoading
    ? "..."
    : healthDataPoints === 0
      ? "Setup needed"
      : `${Math.round(healthScore.data?.totalScore ?? 0)}/100`;
  const healthHint = healthScore.isLoading
    ? "Calculating..."
    : healthDataPoints === 0
      ? "Add transactions and one budget to unlock full scoring"
      : healthScore.data?.isProvisional
        ? "Early estimate while more data is collected"
        : "Financial health model";
  const healthBadgeClass = healthDataPoints === 0
    ? "chip-transfer"
    : healthScore.data?.isProvisional
      ? "chip-transfer"
      : "chip-income";
  const healthBadgeLabel = healthDataPoints === 0
    ? "No data yet"
    : healthScore.data?.isProvisional
      ? "Provisional"
      : "Reliable";

  return (
    <div className="page-grid">
      <PageHeader title="Dashboard" subtitle="Your financial cockpit: cash position, momentum, and upcoming commitments." />

      <Card className="hero-card">
        <div className="hero-grid">
          <div>
            <p className="hero-label">Total Portfolio Balance</p>
            <h2 className="hero-value">{formatCurrency(balance)}</h2>
            <div className="hero-pills">
              <span><FiArrowUpRight /> Income {formatCurrency(monthlyIncome)}</span>
              <span><FiArrowDownRight /> Expense {formatCurrency(monthlyExpense)}</span>
              <span><FiFlag /> Savings rate {savingsRate}%</span>
            </div>
          </div>
          <div className="hero-insights">
            <div>
              <FiClock />
              <div>
                <strong>{summary.data?.dueRecurringCount ?? 0}</strong>
                <small>Upcoming recurring runs</small>
              </div>
            </div>
            <div>
              <FiCalendar />
              <div>
                <strong>{summary.data?.activeGoals ?? 0}</strong>
                <small>Active savings goals</small>
              </div>
            </div>
            <div className={`net-chip ${monthlySavings >= 0 ? "positive" : "negative"}`}>
              {monthlySavings >= 0 ? "Surplus this month" : "Deficit this month"}: {formatCurrency(monthlySavings)}
            </div>
          </div>
        </div>
      </Card>

      <div className="stats-grid">
        <StatCard label="Total balance" value={balance} hint="Across all accounts" />
        <StatCard label="Monthly income" value={monthlyIncome} tone="success" hint="Money coming in" />
        <StatCard label="Monthly expense" value={monthlyExpense} tone="danger" hint="Money going out" />
        <StatCard label="Monthly savings" value={monthlySavings} tone={monthlySavings >= 0 ? "success" : "danger"} hint="Net progress this month" />
      </div>

      <div className="two-col">
        <Card title="V2 Insights Snapshot" subtitle="Read-only additive indicators" action={<Link to="/insights" className="ghost-btn compact-btn">Open Insights</Link>}>
          <div className="budget-grid">
            <div className="budget-item">
              <div className="snapshot-head">
                <strong><FiShield /> Health score</strong>
                <span>{healthValueLabel}</span>
              </div>
              <p className="snapshot-copy">{healthHint}</p>
              <div className="snapshot-tags">
                <span className={`chip ${healthBadgeClass}`}>{healthBadgeLabel}</span>
                {healthDataPoints > 0 ? <span className="chip chip-income">{healthDataPoints} entries</span> : null}
              </div>
            </div>
            <div className="budget-item">
              <div className="snapshot-head">
                <strong>Projected month-end</strong>
                <span>{formatCurrency(forecastMonth.data?.projectedEndOfMonthBalance ?? 0)}</span>
              </div>
              <p className="snapshot-copy">Safe to spend/day: {formatCurrency(forecastMonth.data?.safeToSpend ?? 0)}</p>
              <div className="snapshot-tags">
                {forecastMonth.data?.atRiskOfNegativeBalance ? <span className="chip chip-expense">Risk warning</span> : <span className="chip chip-income">On track</span>}
              </div>
            </div>
          </div>
        </Card>

        <Card title="Recent transactions" subtitle="Latest activity, so nothing slips through">
          {!transactions.data?.length ? (
            <EmptyState
              text="No transactions yet"
              hint="Tap Add Transaction to create your first entry in under 10 seconds."
              action={<Link className="ghost-btn compact-btn" to="/transactions">Go to transactions</Link>}
            />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr><th>Date</th><th>Amount</th><th>Type</th><th>Note</th></tr>
                </thead>
                <tbody>
                  {transactions.data.slice(0, 7).map((tx) => (
                    <tr key={tx.id}>
                      <td>{formatDate(tx.transactionDate)}</td>
                      <td className="strong-cell">{formatCurrency(tx.amount)}</td>
                      <td>
                        <span className={`chip ${tx.type === 1 ? "chip-income" : tx.type === 2 ? "chip-expense" : "chip-transfer"}`}>
                          {tx.type === 1 ? "Income" : tx.type === 2 ? "Expense" : "Transfer"}
                        </span>
                      </td>
                      <td>{tx.note || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Card title="Goals progress" subtitle="Small wins compound over time">
        {!goals.data?.length ? (
          <EmptyState
            text="No goals created"
            hint="Create a goal and start with a small contribution to build momentum."
            action={<Link className="ghost-btn compact-btn" to="/goals">Create goal</Link>}
          />
        ) : (
          <div className="progress-list">
            {goals.data.slice(0, 5).map((goal) => (
              <div key={goal.id} className="goal-item">
                <div className="goal-top">
                  <strong>{goal.name}</strong>
                  <span>{goal.progressPercent}%</span>
                </div>
                <div className="progress-track"><div style={{ width: `${Math.min(goal.progressPercent, 100)}%` }} /></div>
                <small>{formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}</small>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
