export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAtUtc: string;
  userId: string;
  email: string;
  fullName: string;
};

export type Account = {
  id: string;
  name: string;
  type: number;
  currency: string;
  balance: number;
  isArchived: boolean;
};

export type Category = {
  id: string;
  name: string;
  type: number;
  colorHex: string;
  icon: string;
  isDefault: boolean;
};

export type Transaction = {
  id: string;
  accountId: string;
  destinationAccountId?: string;
  categoryId?: string;
  type: number;
  amount: number;
  transactionDate: string;
  note?: string;
};

export type Budget = {
  id: string;
  categoryId: string;
  categoryName: string;
  month: number;
  year: number;
  amount: number;
  actualSpend: number;
  utilizationPercent: number;
  alertLevel: string;
};

export type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  linkedAccountId?: string;
  progressPercent: number;
};

export type RecurringItem = {
  id: string;
  accountId: string;
  destinationAccountId?: string;
  categoryId?: string;
  type: number;
  frequency: number;
  amount: number;
  nextRunDate: string;
  isPaused: boolean;
  note?: string;
};

export type RecurringRequest = {
  accountId: string;
  destinationAccountId?: string;
  categoryId?: string;
  type: number;
  frequency: number;
  amount: number;
  startDate: string;
  nextRunDate: string;
  endDate?: string;
  note?: string;
  isPaused: boolean;
};

export type DashboardSummary = {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlySavings: number;
  activeGoals: number;
  dueRecurringCount: number;
};
