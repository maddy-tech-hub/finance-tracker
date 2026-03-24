import { useQuery } from "@tanstack/react-query";
import type {
  Account,
  Budget,
  Category,
  DashboardSummary,
  ForecastDaily,
  ForecastMonth,
  Goal,
  HealthScore,
  InsightSummary,
  NetWorthResponse,
  RecurringItem,
  Rule,
  Transaction,
  TrendsResponse
} from "types/api";
import { accountService } from "services/accountService";
import {
  budgetService,
  categoryService,
  dashboardService,
  forecastV2Service,
  goalService,
  insightV2Service,
  recurringService,
  reportService,
  reportsV2Service,
  rulesV2Service,
  transactionService
} from "services/financeServices";

type CategorySpendItem = { categoryName: string; totalAmount: number };
type IncomeVsExpenseItem = { period: string; income: number; expense: number };
type SavingsProgressItem = { goalName: string; currentAmount: number; targetAmount: number; progressPercent: number };
type BalanceTrendItem = { accountName: string; date: string; balance: number };

export const useDashboardSummary = () => useQuery<DashboardSummary>({ queryKey: ["dashboard"], queryFn: dashboardService.summary });
export const useAccounts = () => useQuery<Account[]>({ queryKey: ["accounts"], queryFn: accountService.list });
export const useCategories = () => useQuery<Category[]>({ queryKey: ["categories"], queryFn: categoryService.list });
export const useTransactions = (params?: Record<string, string | number>) => useQuery<Transaction[]>({ queryKey: ["transactions", params], queryFn: () => transactionService.list(params) });
export const useBudgets = (month: number, year: number) => useQuery<Budget[]>({ queryKey: ["budgets", month, year], queryFn: () => budgetService.list(month, year) });
export const useGoals = () => useQuery<Goal[]>({ queryKey: ["goals"], queryFn: goalService.list });
export const useRecurring = () => useQuery<RecurringItem[]>({ queryKey: ["recurring"], queryFn: recurringService.list });
export const useCategorySpend = (from: string, to: string) => useQuery<CategorySpendItem[]>({ queryKey: ["report-category", from, to], queryFn: () => reportService.categorySpend(from, to) });
export const useIncomeExpense = (from: string, to: string) => useQuery<IncomeVsExpenseItem[]>({ queryKey: ["report-income-expense", from, to], queryFn: () => reportService.incomeVsExpense(from, to) });
export const useSavingsReport = () => useQuery<SavingsProgressItem[]>({ queryKey: ["report-savings"], queryFn: reportService.savings });
export const useBalanceTrend = (from: string, to: string) => useQuery<BalanceTrendItem[]>({ queryKey: ["report-balance-trend", from, to], queryFn: () => reportService.balanceTrend(from, to) });

export const useHealthScore = () => useQuery<HealthScore>({ queryKey: ["v2-health-score"], queryFn: insightV2Service.healthScore });
export const useInsightMessages = () => useQuery<InsightSummary>({ queryKey: ["v2-insights"], queryFn: insightV2Service.insights });
export const useForecastMonth = () => useQuery<ForecastMonth>({ queryKey: ["v2-forecast-month"], queryFn: forecastV2Service.month });
export const useForecastDaily = () => useQuery<ForecastDaily>({ queryKey: ["v2-forecast-daily"], queryFn: forecastV2Service.daily });
export const useTrendsV2 = (params: { from: string; to: string; accountId?: string; categoryId?: string }) =>
  useQuery<TrendsResponse>({ queryKey: ["v2-trends", params], queryFn: () => reportsV2Service.trends(params) });
export const useNetWorthV2 = (from: string, to: string) =>
  useQuery<NetWorthResponse>({ queryKey: ["v2-net-worth", from, to], queryFn: () => reportsV2Service.netWorth(from, to) });
export const useRulesV2 = () => useQuery<Rule[]>({ queryKey: ["v2-rules"], queryFn: rulesV2Service.list });

