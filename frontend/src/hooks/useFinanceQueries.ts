import { useQuery } from "@tanstack/react-query";
import type { Account, Budget, Category, DashboardSummary, Goal, RecurringItem, Transaction } from "types/api";
import { accountService } from "services/accountService";
import { budgetService, categoryService, dashboardService, goalService, recurringService, reportService, transactionService } from "services/financeServices";

type CategorySpendItem = { categoryName: string; totalAmount: number };
type IncomeVsExpenseItem = { period: string; income: number; expense: number };
type SavingsProgressItem = { goalName: string; currentAmount: number; targetAmount: number; progressPercent: number };

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
