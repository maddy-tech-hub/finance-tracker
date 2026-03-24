import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "components/common/Card";
import { PageHeader } from "components/common/PageHeader";
import { LoadingState } from "components/feedback/States";
import { NetWorthChart } from "components/charts/NetWorthChart";
import { TrendComparisonChart } from "components/charts/TrendComparisonChart";
import { useAccounts, useCategories, useForecastDaily, useForecastMonth, useHealthScore, useInsightMessages, useNetWorthV2, useTrendsV2 } from "hooks/useFinanceQueries";
import { formatCurrency } from "utils/format";

const getFactorChipClass = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized.includes("strong") || normalized.includes("stable") || normalized.includes("on track") || normalized.includes("resilient")) {
    return "chip-income";
  }

  if (normalized.includes("needs") || normalized.includes("volatile") || normalized.includes("over")) {
    return "chip-expense";
  }

  return "chip-transfer";
};

export const InsightsPage = () => {
  const defaults = useMemo(() => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().slice(0, 10);
    const to = now.toISOString().slice(0, 10);
    return { from, to };
  }, []);

  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const applyQuickRange = (days: number) => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - days);
    setFrom(start.toISOString().slice(0, 10));
    setTo(now.toISOString().slice(0, 10));
  };

  const accounts = useAccounts();
  const categories = useCategories();
  const health = useHealthScore();
  const insights = useInsightMessages();
  const monthForecast = useForecastMonth();
  const dailyForecast = useForecastDaily();
  const trends = useTrendsV2({ from: `${from}T00:00:00.000Z`, to: `${to}T23:59:59.999Z`, accountId: accountId || undefined, categoryId: categoryId || undefined });
  const netWorth = useNetWorthV2(`${from}T00:00:00.000Z`, `${to}T23:59:59.999Z`);

  const healthDataPoints = health.data?.dataPointsUsed ?? 0;
  const showHealthSetupState = Boolean(health.data && healthDataPoints === 0);
  const healthScorePercent = health.data
    ? Math.max(0, Math.min(100, Math.round((health.data.totalScore / Math.max(health.data.maxScore, 1)) * 100)))
    : 0;
  const reliabilityLabel = showHealthSetupState ? "Setup needed" : health.data?.isProvisional ? "Early estimate" : "Reliable";
  const trendSeries = trends.data?.incomeExpenseTrend ?? [];
  const trendPoints = trendSeries.length;
  const hasTrendData = trendPoints > 0;
  const showTrendChart = trendPoints > 1;
  const avgTrendIncome = hasTrendData ? trendSeries.reduce((sum, point) => sum + point.income, 0) / trendPoints : 0;
  const avgTrendExpense = hasTrendData ? trendSeries.reduce((sum, point) => sum + point.expense, 0) / trendPoints : 0;
  const avgSavingsRate = hasTrendData ? trendSeries.reduce((sum, point) => sum + point.savingsRate, 0) / trendPoints : 0;
  const forecastPoints = dailyForecast.data?.points ?? [];
  const forecastHasMovement = forecastPoints.some((point, index, arr) => index > 0 && Math.abs(point.projectedBalance - arr[index - 1].projectedBalance) > 0.01);
  const forecastHasDrivers = Boolean(
    monthForecast.data &&
    (Math.abs(monthForecast.data.expectedIncome) > 0.01 ||
      Math.abs(monthForecast.data.expectedExpense) > 0.01 ||
      monthForecast.data.atRiskOfNegativeBalance));
  const riskLabel = monthForecast.data
    ? monthForecast.data.atRiskOfNegativeBalance
      ? "At risk"
      : forecastHasDrivers
        ? "On track"
        : "No signal"
    : "-";
  const showForecastChart = forecastPoints.length > 1 && (forecastHasMovement || forecastHasDrivers);

  const netWorthPoints = netWorth.data?.points ?? [];
  const netWorthHasMovement = netWorthPoints.some((point, index, arr) => index > 0 && Math.abs(point.netWorth - arr[index - 1].netWorth) > 0.01);
  const showNetWorthChart = netWorthPoints.length > 1 && netWorthHasMovement;
  const latestNetWorth = netWorthPoints.length ? netWorthPoints[netWorthPoints.length - 1].netWorth : 0;
  const rawInsightMessages = insights.data?.messages ?? [];
  const hasOnboardingData = healthDataPoints > 0 || hasTrendData || forecastHasDrivers;
  const insightMessages = hasOnboardingData
    ? rawInsightMessages
    : rawInsightMessages.filter((m) => m.title !== "No major shifts");
  const insightCount = insightMessages.length;

  return (
    <div className="page-grid insights-page">
      <PageHeader title="Insights (V2)" subtitle="Health score, trends, forecasting, and explainable insights." />

      <Card title="Analysis Filters" subtitle="Apply optional account/category filters to trends">
        <form className="row-form insights-filter-form" onSubmit={(e) => e.preventDefault()}>
          <label className="field"><span>From</span><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
          <label className="field"><span>To</span><input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label>
          <label className="field">
            <span>Account</span>
            <select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
              <option value="">All accounts</option>
              {accounts.data?.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Category</span>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">All categories</option>
              {categories.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <div className="insights-filter-actions">
            <button className="ghost-btn compact-btn" type="button" onClick={() => { setFrom(defaults.from); setTo(defaults.to); setAccountId(""); setCategoryId(""); }}>
              Reset
            </button>
            <button className="ghost-btn compact-btn" type="button" onClick={() => applyQuickRange(30)}>Last 30d</button>
            <button className="ghost-btn compact-btn" type="button" onClick={() => applyQuickRange(90)}>Last 90d</button>
          </div>
        </form>
      </Card>

      <Card className="insights-kpi-card">
        <div className="insights-kpi-grid">
          <div className="insights-kpi-item">
            <span>Health</span>
            <strong>{showHealthSetupState ? "-" : `${Math.round(health.data?.totalScore ?? 0)}/100`}</strong>
            <small>{reliabilityLabel}</small>
          </div>
          <div className="insights-kpi-item">
            <span>Forecast risk</span>
            <strong>{riskLabel}</strong>
            <small>Month-end projection</small>
          </div>
          <div className="insights-kpi-item">
            <span>Trend periods</span>
            <strong>{trendPoints}</strong>
            <small>Income/expense timeline</small>
          </div>
          <div className="insights-kpi-item">
            <span>Insight messages</span>
            <strong>{insightCount}</strong>
            <small>Actionable observations</small>
          </div>
        </div>
      </Card>

      <Card title="Financial Health Score" subtitle="0-100 explainable score with factor breakdown">
        {health.isLoading ? <LoadingState text="Calculating score..." /> : null}
        {health.data ? (
          <>
            {health.data.isProvisional ? (
              <div className="insight-note warning">
                <strong>Provisional score</strong>
                <p>{health.data.provisionalReason ?? "Score confidence is still building as we gather more data."}</p>
              </div>
            ) : null}

            {showHealthSetupState ? (
              <>
                <div className="health-empty-panel">
                  <strong>Not enough data yet for a reliable health score</strong>
                  <p>Add a few transactions and one budget to unlock full scoring.</p>
                </div>
                <div className="insights-quick-actions">
                  <Link className="ghost-btn compact-btn" to="/transactions">Add transaction</Link>
                  <Link className="ghost-btn compact-btn" to="/budgets">Set budget</Link>
                  <Link className="ghost-btn compact-btn" to="/accounts">Review accounts</Link>
                </div>
                <ul className="health-guidance-list">
                  {health.data.suggestions.map((s, idx) => <li key={idx}>{s}</li>)}
                </ul>
              </>
            ) : (
              <>
                <div className="health-score-row">
                  <h2 style={{ margin: 0 }}>{Math.round(health.data.totalScore)} / {health.data.maxScore}</h2>
                  <span className={`chip ${health.data.isProvisional ? "chip-transfer" : "chip-income"}`}>
                    {health.data.isProvisional ? "Provisional" : "Reliable"}
                  </span>
                </div>
                <p className="health-meta">Data points used: {healthDataPoints}</p>
                <div className="health-meter" aria-hidden="true">
                  <div className="health-meter-fill" style={{ width: `${healthScorePercent}%` }} />
                </div>
                <div className="health-factors-grid">
                  {health.data.factors.map((f) => (
                    <div key={f.key} className="budget-item health-factor-card">
                      <div className="goal-top"><strong>{f.label}</strong><span>{Math.round(f.score)} / {f.maxScore}</span></div>
                      <span className={`chip ${getFactorChipClass(f.status)}`}>{f.status}</span>
                      <div className="factor-meter" aria-hidden="true">
                        <div style={{ width: `${Math.max(0, Math.min(100, Math.round((f.score / Math.max(f.maxScore, 1)) * 100)))}%` }} />
                      </div>
                      <p style={{ margin: "8px 0 0", color: "var(--muted)" }}>{f.detail}</p>
                    </div>
                  ))}
                </div>
                <ul className="health-guidance-list">
                  {health.data.suggestions.map((s, idx) => <li key={idx}>{s}</li>)}
                </ul>
              </>
            )}
          </>
        ) : null}
      </Card>

      <Card title="Forecast" subtitle="Projected month-end balance and safe-to-spend indicator">
        {monthForecast.isLoading ? <LoadingState text="Building forecast..." /> : null}
        {monthForecast.data ? (
          <div className="stats-grid forecast-metrics-grid">
            <div className="stat-card"><p>Projected month-end</p><h2>{formatCurrency(monthForecast.data.projectedEndOfMonthBalance)}</h2></div>
            <div className="stat-card"><p>Safe to spend / day</p><h2>{formatCurrency(monthForecast.data.safeToSpend)}</h2></div>
            <div className="stat-card"><p>Expected income</p><h2>{formatCurrency(monthForecast.data.expectedIncome)}</h2></div>
            <div className="stat-card"><p>Expected expense</p><h2>{formatCurrency(monthForecast.data.expectedExpense)}</h2></div>
          </div>
        ) : null}
        {monthForecast.data?.atRiskOfNegativeBalance ? <p className="forecast-warning">Risk warning: projected negative balance before month end.</p> : null}
        {showForecastChart ? (
          <NetWorthChart height={220} data={forecastPoints.map((p) => ({ date: p.date.slice(5, 10), netWorth: p.projectedBalance }))} />
        ) : (
          !monthForecast.isLoading ? (
            <div className="forecast-empty-panel">
              <strong>No projected movement yet</strong>
              <p>Add transactions or recurring items to visualize projected balance movement.</p>
            </div>
          ) : null
        )}
      </Card>

      <Card title="Trends" subtitle="Income, expense and savings-rate trend">
        {trends.isLoading ? <LoadingState text="Loading trends..." /> : null}
        {!trends.isLoading && !hasTrendData ? (
          <div className="forecast-empty-panel trends-empty-panel">
            <strong>No trend data in this range</strong>
            <p>Add more transactions across different dates to build a clean trend timeline.</p>
          </div>
        ) : null}
        {hasTrendData ? (
          <>
            <div className="trends-summary-grid">
              <div className="trend-stat">
                <span>Avg income</span>
                <strong>{formatCurrency(avgTrendIncome)}</strong>
              </div>
              <div className="trend-stat">
                <span>Avg expense</span>
                <strong>{formatCurrency(avgTrendExpense)}</strong>
              </div>
              <div className="trend-stat">
                <span>Avg savings rate</span>
                <strong>{Math.round(avgSavingsRate)}%</strong>
              </div>
            </div>
            {showTrendChart ? (
              <TrendComparisonChart height={240} data={trendSeries} />
            ) : (
              <div className="forecast-empty-panel trends-empty-panel">
                <strong>More periods needed for a trend line</strong>
                <p>Current range has one period; widen the date range to compare month-over-month changes.</p>
              </div>
            )}
          </>
        ) : null}
      </Card>

      <Card title="Net Worth" subtitle="Historical net worth movement in selected period">
        {netWorth.isLoading ? <LoadingState text="Loading net worth..." /> : null}
        {netWorth.data ? (
          <>
            <div className="networth-summary-row">
              <p>
                Change: <strong>{formatCurrency(netWorth.data.changeAmount)}</strong> ({netWorth.data.changePercent}%)
              </p>
              <p>
                Current: <strong>{formatCurrency(latestNetWorth)}</strong>
              </p>
            </div>
            {showNetWorthChart ? (
              <NetWorthChart height={220} data={netWorthPoints.map((p) => ({ ...p, date: String(p.date).slice(0, 10) }))} />
            ) : (
              <div className="forecast-empty-panel networth-empty-panel">
                <strong>No net worth movement in this period</strong>
                <p>Try a wider date range or add transactions to see a trend line.</p>
              </div>
            )}
          </>
        ) : null}
      </Card>

      <Card title="Insight Messages" subtitle="Auto-generated, explainable observations">
        {insights.isLoading ? <LoadingState text="Generating insights..." /> : null}
        {!insights.isLoading && !insightCount ? (
          <div className="forecast-empty-panel insights-message-empty-panel">
            <strong>No insights yet</strong>
            <p>After you log a few weeks of income and expense data, we will show comparative insights here.</p>
          </div>
        ) : null}
        {insightCount ? (
          <div className="budget-grid">
            {insightMessages.map((m, idx) => (
              <div key={idx} className="budget-item">
                <div className="goal-top"><strong>{m.title}</strong><span className={`chip ${m.tone === "success" ? "chip-income" : m.tone === "warning" ? "chip-expense" : "chip-transfer"}`}>{m.tone}</span></div>
                <p style={{ margin: "8px 0 0" }}>{m.message}</p>
              </div>
            ))}
          </div>
        ) : null}
      </Card>
    </div>
  );
};
