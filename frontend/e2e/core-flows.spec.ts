import { expect, test, type Page } from "@playwright/test";

type Account = { id: string; name: string; type: number; currency: string; balance: number; isArchived: boolean };
type Category = { id: string; name: string; type: number; colorHex: string; icon: string; isDefault: boolean };
type Transaction = { id: string; accountId: string; destinationAccountId?: string; categoryId?: string; type: number; amount: number; transactionDate: string; note?: string };
type Budget = { id: string; categoryId: string; categoryName: string; month: number; year: number; amount: number; actualSpend: number; utilizationPercent: number; alertLevel: string };
type Goal = { id: string; name: string; targetAmount: number; currentAmount: number; targetDate?: string; linkedAccountId?: string; progressPercent: number };
type Recurring = { id: string; accountId: string; destinationAccountId?: string; categoryId?: string; type: number; frequency: number; amount: number; nextRunDate: string; isPaused: boolean; note?: string };

const ok = <T>(data: T, message = "OK") => ({ success: true, message, data });

const setupApiMocks = async (page: Page) => {
  const state = {
    accounts: [] as Account[],
    categories: [
      { id: "cat-default-exp", name: "General", type: 2, colorHex: "#334155", icon: "tag", isDefault: true }
    ] as Category[],
    transactions: [] as Transaction[],
    budgets: [] as Budget[],
    goals: [] as Goal[],
    recurring: [] as Recurring[]
  };

  await page.route("**/api/**", async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname;
    const method = req.method();

    const body = req.postDataJSON?.() as Record<string, unknown> | undefined;

    if (path.endsWith("/api/auth/register") && method === "POST") {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ok({})) });
    }

    if (path.endsWith("/api/auth/login") && method === "POST") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(ok({
          accessToken: "token-1",
          refreshToken: "refresh-1",
          expiresAtUtc: "2099-01-01T00:00:00Z",
          userId: "user-1",
          email: "demo@example.com",
          fullName: "Demo User"
        }))
      });
    }

    if (path.endsWith("/api/dashboard/summary") && method === "GET") {
      const expense = state.transactions.filter((x) => x.type === 2).reduce((sum, x) => sum + x.amount, 0);
      const income = state.transactions.filter((x) => x.type === 1).reduce((sum, x) => sum + x.amount, 0);
      const totalBalance = state.accounts.reduce((sum, x) => sum + x.balance, 0);

      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(ok({
          totalBalance,
          monthlyIncome: income,
          monthlyExpense: expense,
          monthlySavings: income - expense,
          activeGoals: state.goals.length,
          dueRecurringCount: state.recurring.length
        }))
      });
    }

    if (path.endsWith("/api/accounts") && method === "GET") {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ok(state.accounts)) });
    }

    if (path.endsWith("/api/accounts") && method === "POST") {
      const created: Account = {
        id: `acc-${state.accounts.length + 1}`,
        name: String(body?.name ?? ""),
        type: Number(body?.type ?? 2),
        currency: String(body?.currency ?? "INR"),
        balance: Number(body?.balance ?? 0),
        isArchived: false
      };
      state.accounts.push(created);
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ok(created)) });
    }

    if (path.endsWith("/api/categories") && method === "GET") {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ok(state.categories)) });
    }

    if (path.endsWith("/api/categories") && method === "POST") {
      const created: Category = {
        id: `cat-${state.categories.length + 1}`,
        name: String(body?.name ?? ""),
        type: Number(body?.type ?? 2),
        colorHex: String(body?.colorHex ?? "#2563EB"),
        icon: String(body?.icon ?? "tag"),
        isDefault: false
      };
      state.categories.push(created);
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ok(created)) });
    }

    if (path.endsWith("/api/transactions") && method === "GET") {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ok(state.transactions)) });
    }

    if (path.endsWith("/api/transactions") && method === "POST") {
      const created: Transaction = {
        id: `tx-${state.transactions.length + 1}`,
        accountId: String(body?.accountId ?? ""),
        categoryId: body?.categoryId ? String(body.categoryId) : undefined,
        destinationAccountId: body?.destinationAccountId ? String(body.destinationAccountId) : undefined,
        type: Number(body?.type ?? 2),
        amount: Number(body?.amount ?? 0),
        transactionDate: String(body?.transactionDate ?? "2026-01-01"),
        note: body?.note ? String(body.note) : undefined
      };
      state.transactions.push(created);
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ok(created)) });
    }

    if (path.endsWith("/api/budgets") && method === "GET") {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ok(state.budgets)) });
    }

    if (path.endsWith("/api/budgets") && method === "POST") {
      const categoryId = String(body?.categoryId ?? "");
      const category = state.categories.find((c) => c.id === categoryId);
      const created: Budget = {
        id: `budget-${state.budgets.length + 1}`,
        categoryId,
        categoryName: category?.name ?? "Unknown",
        month: Number(body?.month ?? 1),
        year: Number(body?.year ?? 2026),
        amount: Number(body?.amount ?? 0),
        actualSpend: 0,
        utilizationPercent: 0,
        alertLevel: "Safe"
      };
      state.budgets.push(created);
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ok(created)) });
    }

    if (path.endsWith("/api/goals") && method === "GET") {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ok(state.goals)) });
    }

    if (path.endsWith("/api/goals") && method === "POST") {
      const targetAmount = Number(body?.targetAmount ?? 0);
      const currentAmount = Number(body?.currentAmount ?? 0);
      const created: Goal = {
        id: `goal-${state.goals.length + 1}`,
        name: String(body?.name ?? ""),
        targetAmount,
        currentAmount,
        targetDate: body?.targetDate ? String(body.targetDate) : undefined,
        linkedAccountId: body?.linkedAccountId ? String(body.linkedAccountId) : undefined,
        progressPercent: targetAmount > 0 ? Math.round((currentAmount / targetAmount) * 100) : 0
      };
      state.goals.push(created);
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ok(created)) });
    }

    if (path.endsWith("/api/recurring") && method === "GET") {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ok(state.recurring)) });
    }

    if (path.endsWith("/api/recurring") && method === "POST") {
      const created: Recurring = {
        id: `rec-${state.recurring.length + 1}`,
        accountId: String(body?.accountId ?? ""),
        destinationAccountId: body?.destinationAccountId ? String(body.destinationAccountId) : undefined,
        categoryId: body?.categoryId ? String(body.categoryId) : undefined,
        type: Number(body?.type ?? 2),
        frequency: Number(body?.frequency ?? 3),
        amount: Number(body?.amount ?? 0),
        nextRunDate: String(body?.nextRunDate ?? "2026-01-01"),
        isPaused: Boolean(body?.isPaused ?? false),
        note: body?.note ? String(body.note) : undefined
      };
      state.recurring.push(created);
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ok(created)) });
    }

    return route.fulfill({ status: 404, contentType: "application/json", body: JSON.stringify({ success: false, message: "Not mocked", data: null }) });
  });
};

test("register flow submits successfully", async ({ page }) => {
  await setupApiMocks(page);
  await page.goto("/signup");

  await page.getByLabel("First name").fill("Madhava");
  await page.getByLabel("Last name").fill("Reddy");
  await page.getByLabel("Email").fill("madhava@example.com");
  await page.getByLabel("Password").fill("Darling@143");
  await page.getByRole("button", { name: "Create Account" }).click();

  await expect(page).toHaveURL(/\/login$/);
});

test("login flow navigates to dashboard", async ({ page }) => {
  await setupApiMocks(page);
  await page.goto("/login");

  await page.getByLabel("Email").fill("madhava@example.com");
  await page.getByLabel("Password").fill("Darling@143");
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page.getByText("Dashboard")).toBeVisible();
});

test("critical create flows work end-to-end", async ({ page }) => {
  await setupApiMocks(page);
  await page.addInitScript(() => {
    localStorage.setItem("access_token", "token-1");
    localStorage.setItem("refresh_token", "refresh-1");
    localStorage.setItem("full_name", "Demo User");
  });

  await page.goto("/");

  await page.goto("/accounts");
  await page.getByPlaceholder("Account name").fill("Axis Bank");
  await page.getByDisplayValue("INR").fill("INR");
  await page.locator("input[name='balance']").fill("50000");
  await page.getByRole("button", { name: "Create" }).click();
  await expect(page.getByText("Axis Bank")).toBeVisible();

  await page.goto("/settings");
  await page.getByPlaceholder("Category name").fill("Groceries");
  await page.getByRole("button", { name: "Add Category" }).click();
  await expect(page.getByText("Groceries")).toBeVisible();

  await page.goto("/transactions");
  await page.getByPlaceholder("Amount").fill("999");
  await page.getByLabel("Note").fill("Weekly groceries");
  await page.getByRole("button", { name: "Add" }).click();
  await expect(page.getByText("Weekly groceries")).toBeVisible();

  await page.goto("/budgets");
  await page.getByPlaceholder("Monthly limit").fill("5000");
  await page.getByRole("button", { name: "Save Budget" }).click();
  await expect(page.getByText("General")).toBeVisible();

  await page.goto("/goals");
  await page.getByPlaceholder("Goal name (e.g., Emergency Fund)").fill("Travel");
  await page.getByPlaceholder("Target amount").fill("200000");
  await page.getByPlaceholder("Starting amount").fill("1000");
  await page.getByRole("button", { name: "Add Goal" }).click();
  await expect(page.getByText("Travel")).toBeVisible();

  await page.goto("/recurring");
  await page.getByPlaceholder("Amount").fill("899");
  await page.getByPlaceholder("Label (e.g., Netflix, Rent)").fill("Prime Video");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Prime Video")).toBeVisible();

  await page.goto("/");
  await expect(page.getByText("Goals progress")).toBeVisible();
  await expect(page.getByText("Travel")).toBeVisible();
});
