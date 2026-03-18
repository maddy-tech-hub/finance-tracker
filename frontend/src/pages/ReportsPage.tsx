import { useMemo } from "react";
import { Card } from "components/common/Card";
import { PageHeader } from "components/common/PageHeader";
import { CategorySpendChart } from "components/charts/CategorySpendChart";
import { IncomeExpenseChart } from "components/charts/IncomeExpenseChart";
import { SavingsProgressChart } from "components/charts/SavingsProgressChart";
import { EmptyState, LoadingState } from "components/feedback/States";
import { useCategorySpend, useIncomeExpense, useSavingsReport } from "hooks/useFinanceQueries";

export const ReportsPage = () => {
  const { from, to } = useMemo(() => {
    const now = new Date();
    return {
      from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
      to: now.toISOString()
    };
  }, []);

  const category = useCategorySpend(from, to);
  const incomeExpense = useIncomeExpense(from, to);
  const savings = useSavingsReport();

  return (
    <div className="page-grid">
      <PageHeader title="Reports" subtitle="Clean visuals to explain spending, cashflow trends, and savings progress in your demo." />

      <Card title="Category Spend" subtitle="Where your money went this month">
        {category.isLoading ? <LoadingState text="Preparing category insights..." /> : null}
        {!category.isLoading && !(category.data?.length) ? <EmptyState text="No category spend data yet" hint="Add expense transactions to unlock this chart." /> : null}
        {category.data?.length ? <CategorySpendChart data={category.data} /> : null}
      </Card>

      <Card title="Income vs Expense" subtitle="Month-over-month cashflow trend">
        {incomeExpense.isLoading ? <LoadingState text="Preparing cashflow trend..." /> : null}
        {!incomeExpense.isLoading && !(incomeExpense.data?.length) ? <EmptyState text="No income/expense trend yet" hint="Create income and expense entries for a few dates." /> : null}
        {incomeExpense.data?.length ? <IncomeExpenseChart data={incomeExpense.data} /> : null}
      </Card>

      <Card title="Savings Progress" subtitle="Goal completion snapshot">
        {savings.isLoading ? <LoadingState text="Preparing goal analytics..." /> : null}
        {!savings.isLoading && !(savings.data?.length) ? <EmptyState text="No savings goals to chart" hint="Create at least one goal to visualize progress." /> : null}
        {savings.data?.length ? <SavingsProgressChart data={savings.data} /> : null}
      </Card>
    </div>
  );
};
