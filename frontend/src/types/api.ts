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

export type UserProfile = {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  memberSinceUtc: string;
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

export type HealthScoreFactor = {
  key: string;
  label: string;
  score: number;
  maxScore: number;
  status: string;
  detail: string;
};

export type HealthScore = {
  totalScore: number;
  maxScore: number;
  factors: HealthScoreFactor[];
  suggestions: string[];
  generatedAtUtc: string;
  isProvisional?: boolean;
  provisionalReason?: string;
  dataPointsUsed?: number;
};

export type TrendPoint = {
  period: string;
  income: number;
  expense: number;
  savingsRate: number;
};

export type CategoryTrendPoint = {
  period: string;
  categoryName: string;
  amount: number;
};

export type TrendsResponse = {
  incomeExpenseTrend: TrendPoint[];
  categoryTrend: CategoryTrendPoint[];
};

export type NetWorthPoint = {
  date: string;
  netWorth: number;
};

export type NetWorthResponse = {
  points: NetWorthPoint[];
  changeAmount: number;
  changePercent: number;
};

export type InsightMessage = {
  title: string;
  message: string;
  tone: string;
};

export type InsightSummary = {
  messages: InsightMessage[];
};

export type ForecastMonth = {
  currentBalance: number;
  projectedEndOfMonthBalance: number;
  expectedIncome: number;
  expectedExpense: number;
  safeToSpend: number;
  atRiskOfNegativeBalance: boolean;
  explanation: string;
};

export type ForecastDailyPoint = {
  date: string;
  projectedBalance: number;
};

export type ForecastDaily = {
  points: ForecastDailyPoint[];
};

export type Rule = {
  id: string;
  name: string;
  isActive: boolean;
  priority: number;
  conditionType: number;
  conditionValue?: string;
  amountThreshold?: number;
  actionType: number;
  actionValue?: string;
  updatedAtUtc: string;
};

export type RuleRequest = {
  name: string;
  isActive: boolean;
  priority: number;
  conditionType: number;
  conditionValue?: string;
  amountThreshold?: number;
  actionType: number;
  actionValue?: string;
};

