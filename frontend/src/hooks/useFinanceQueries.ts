import { useQuery } from "@tanstack/react-query";
import { accountService, budgetService, categoryService, dashboardService, goalService, recurringService, reportService, transactionService } from "services/financeServices";

export const useDashboardSummary = () => useQuery({ queryKey: ["dashboard"], queryFn: dashboardService.summary });
export const useAccounts = () => useQuery({ queryKey: ["accounts"], queryFn: accountService.list });
export const useCategories = () => useQuery({ queryKey: ["categories"], queryFn: categoryService.list });
export const useTransactions = (params?: Record<string, string | number>) => useQuery({ queryKey: ["transactions", params], queryFn: () => transactionService.list(params) });
export const useBudgets = (month: number, year: number) => useQuery({ queryKey: ["budgets", month, year], queryFn: () => budgetService.list(month, year) });
export const useGoals = () => useQuery({ queryKey: ["goals"], queryFn: goalService.list });
export const useRecurring = () => useQuery({ queryKey: ["recurring"], queryFn: recurringService.list });
export const useCategorySpend = (from: string, to: string) => useQuery({ queryKey: ["report-category", from, to], queryFn: () => reportService.categorySpend(from, to) });
export const useIncomeExpense = (from: string, to: string) => useQuery({ queryKey: ["report-income-expense", from, to], queryFn: () => reportService.incomeVsExpense(from, to) });
export const useSavingsReport = () => useQuery({ queryKey: ["report-savings"], queryFn: reportService.savings });
