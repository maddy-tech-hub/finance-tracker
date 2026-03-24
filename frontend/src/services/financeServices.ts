import { api } from "lib/apiClient";
import type {
  ApiResponse,
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
  RecurringRequest,
  Rule,
  RuleRequest,
  Transaction,
  TrendsResponse
} from "types/api";

type CategorySpendItem = { categoryName: string; totalAmount: number };
type IncomeVsExpenseItem = { period: string; income: number; expense: number };
type AccountBalanceTrendItem = { accountName: string; date: string; balance: number };
type SavingsProgressItem = { goalName: string; currentAmount: number; targetAmount: number; progressPercent: number };

export const categoryService = {
  list: async () => (await api.get<ApiResponse<Category[]>>("/categories")).data.data,
  create: async (payload: Omit<Category, "id" | "isDefault">) => (await api.post<ApiResponse<Category>>("/categories", payload)).data.data,
  update: async (id: string, payload: Omit<Category, "id" | "isDefault">) => (await api.put<ApiResponse<Category>>(`/categories/${id}`, payload)).data.data,
  remove: async (id: string) => api.delete(`/categories/${id}`)
};

export const transactionService = {
  list: async (params?: Record<string, string | number>) => (await api.get<ApiResponse<Transaction[]>>("/transactions", { params })).data.data,
  get: async (id: string) => (await api.get<ApiResponse<Transaction>>(`/transactions/${id}`)).data.data,
  create: async (payload: Omit<Transaction, "id">) => (await api.post<ApiResponse<Transaction>>("/transactions", payload)).data.data,
  update: async (id: string, payload: Omit<Transaction, "id">) => (await api.put<ApiResponse<Transaction>>(`/transactions/${id}`, payload)).data.data,
  remove: async (id: string) => api.delete(`/transactions/${id}`)
};

export const budgetService = {
  list: async (month: number, year: number) => (await api.get<ApiResponse<Budget[]>>(`/budgets?month=${month}&year=${year}`)).data.data,
  create: async (payload: { categoryId: string; month: number; year: number; amount: number }) => (await api.post<ApiResponse<Budget>>("/budgets", payload)).data.data,
  update: async (id: string, payload: { categoryId: string; month: number; year: number; amount: number }) => (await api.put<ApiResponse<Budget>>(`/budgets/${id}`, payload)).data.data,
  remove: async (id: string) => api.delete(`/budgets/${id}`)
};

export const goalService = {
  list: async () => (await api.get<ApiResponse<Goal[]>>("/goals")).data.data,
  create: async (payload: { name: string; targetAmount: number; currentAmount: number; targetDate?: string; linkedAccountId?: string }) =>
    (await api.post<ApiResponse<Goal>>("/goals", payload)).data.data,
  update: async (id: string, payload: { name: string; targetAmount: number; currentAmount: number; targetDate?: string; linkedAccountId?: string }) =>
    (await api.put<ApiResponse<Goal>>(`/goals/${id}`, payload)).data.data,
  contribute: async (id: string, amount: number) => (await api.post<ApiResponse<Goal>>(`/goals/${id}/contribute`, { amount })).data.data,
  withdraw: async (id: string, amount: number) => (await api.post<ApiResponse<Goal>>(`/goals/${id}/withdraw`, { amount })).data.data,
  remove: async (id: string) => api.delete(`/goals/${id}`)
};

export const recurringService = {
  list: async () => (await api.get<ApiResponse<RecurringItem[]>>("/recurring")).data.data,
  create: async (payload: RecurringRequest) => (await api.post<ApiResponse<RecurringItem>>("/recurring", payload)).data.data,
  update: async (id: string, payload: RecurringRequest) => (await api.put<ApiResponse<RecurringItem>>(`/recurring/${id}`, payload)).data.data,
  remove: async (id: string) => api.delete(`/recurring/${id}`)
};

export const dashboardService = {
  summary: async () => (await api.get<ApiResponse<DashboardSummary>>("/dashboard/summary")).data.data
};

export const reportService = {
  categorySpend: async (from: string, to: string) => (await api.get<ApiResponse<CategorySpendItem[]>>(`/reports/category-spend?from=${from}&to=${to}`)).data.data,
  incomeVsExpense: async (from: string, to: string) => (await api.get<ApiResponse<IncomeVsExpenseItem[]>>(`/reports/income-vs-expense?from=${from}&to=${to}`)).data.data,
  balanceTrend: async (from: string, to: string) => (await api.get<ApiResponse<AccountBalanceTrendItem[]>>(`/reports/account-balance-trend?from=${from}&to=${to}`)).data.data,
  savings: async () => (await api.get<ApiResponse<SavingsProgressItem[]>>("/reports/savings-progress")).data.data,
  exportCsvUrl: (from: string, to: string) => `${api.defaults.baseURL}/reports/export/csv?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
};

export const insightV2Service = {
  healthScore: async () => (await api.get<ApiResponse<HealthScore>>("/v2/insights/health-score")).data.data,
  insights: async () => (await api.get<ApiResponse<InsightSummary>>("/v2/insights")).data.data
};

export const reportsV2Service = {
  trends: async (params: { from: string; to: string; accountId?: string; categoryId?: string }) =>
    (await api.get<ApiResponse<TrendsResponse>>("/v2/reports/trends", { params })).data.data,
  netWorth: async (from: string, to: string) =>
    (await api.get<ApiResponse<NetWorthResponse>>("/v2/reports/net-worth", { params: { from, to } })).data.data
};

export const forecastV2Service = {
  month: async () => (await api.get<ApiResponse<ForecastMonth>>("/v2/forecast/month")).data.data,
  daily: async () => (await api.get<ApiResponse<ForecastDaily>>("/v2/forecast/daily")).data.data
};

export const rulesV2Service = {
  list: async () => (await api.get<ApiResponse<Rule[]>>("/v2/rules")).data.data,
  create: async (payload: RuleRequest) => (await api.post<ApiResponse<Rule>>("/v2/rules", payload)).data.data,
  update: async (id: string, payload: RuleRequest) => (await api.put<ApiResponse<Rule>>(`/v2/rules/${id}`, payload)).data.data,
  remove: async (id: string) => api.delete(`/v2/rules/${id}`)
};

