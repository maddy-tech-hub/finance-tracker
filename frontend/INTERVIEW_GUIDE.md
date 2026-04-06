# React Finance Tracker - Interview Questions & Answers Guide

## Table of Contents
1. [React Fundamentals](#react-fundamentals)
2. [Project Architecture](#project-architecture)
3. [State Management (Zustand)](#state-management-zustand)
4. [Data Fetching (React Query)](#data-fetching-react-query)
5. [Routing (React Router)](#routing-react-router)
6. [Form Handling (React Hook Form)](#form-handling-react-hook-form)
7. [Authentication & Security](#authentication--security)
8. [Performance Optimization](#performance-optimization)
9. [Testing](#testing)
10. [Project-Specific Questions](#project-specific-questions)

---

## React Fundamentals

### Q1: Explain the difference between functional and class components. Which does this project use?

**Answer:**
- **Functional Components:** Written as JavaScript functions, use hooks for state and lifecycle. Simpler, more readable, and preferred in modern React.
- **Class Components:** ES6 classes extending `React.Component`, use lifecycle methods like `componentDidMount`.
- **This Project:** Uses functional components exclusively with hooks (React 18.3.1). Examples: `DashboardPage.tsx`, `LoginPage.tsx`, `TransactionsPage.tsx`

### Q2: What are React Hooks? Name 10 commonly used hooks.

**Answer:**
React Hooks are functions that let you use state and other features in functional components without writing class components.

**10 Common Hooks:**
1. `useState` - Manage component state
2. `useEffect` - Handle side effects (mounting, updating, cleanup)
3. `useContext` - Access context values
4. `useReducer` - Complex state management
5. `useCallback` - Memoize callbacks to prevent unnecessary re-renders
6. `useMemo` - Memoize expensive computations
7. `useRef` - Access DOM elements directly
8. `useCustom Hooks` - Reusable stateful logic (e.g., `useFinanceQueries`)
9. `useQuery` - Server state management (@tanstack/react-query)
10. `useNavigate` - Programmatic navigation (react-router-dom)

### Q3: What is the purpose of the `useEffect` hook? How does dependency array work?

**Answer:**
`useEffect` runs side effects after render. It accepts a function and optional dependency array.

**Dependency Array Behavior:**
- **No dependency array:** Runs after every render (risky, causes infinite loops)
- **Empty array `[]`:** Runs only once after mount (perfect for API calls, initialization)
- **With dependencies `[user, id]`:** Runs when dependencies change

**Example from this project:**
```typescript
useEffect(() => {
  // Fetch dashboard data when component mounts
}, []);
```

### Q4: What is JSX and why use it?

**Answer:**
JSX is syntax extension for JavaScript that looks like XML/HTML. It compiles to `React.createElement()` calls.

**Why use JSX:**
- More readable and intuitive than `createElement()`
- Closer to HTML structure
- Better developer experience
- Easier to spot issues (IDE integration)

**Example from this project:**
```typescript
return (
  <Card className="dashboard-card">
    <PageHeader title="Dashboard" />
    <StatCard label="Total Balance" value={balance} />
  </Card>
);
```

---

## Project Architecture

### Q5: Describe the folder structure of this project and the purpose of each directory.

**Answer:**
```
src/
├── app/              # Application setup, SessionGuard, root styles
├── components/       # Reusable UI components (charts, forms, layout, common)
├── features/         # Feature-specific modules (accounts, auth, budgets, etc.)
├── hooks/            # Custom React hooks (useFinanceQueries)
├── layouts/          # Page layouts (AppLayout for authenticated, AuthLayout for login)
├── lib/              # Utility libraries (apiClient, Axios setup)
├── pages/            # Full page components (dashboard, transactions, etc.)
├── routes/           # Routing setup (router config, ProtectedRoute)
├── services/         # API service layer (authService, financeServices)
├── store/            # Global state (Zustand stores - authStore)
├── test/             # Test setup and test files
├── types/            # TypeScript type definitions (API types)
└── utils/            # Utility functions (apiError, format)
```

**Architecture Pattern:** This is a **Modular/Feature-based architecture** with separation of concerns:
- **Pages** = Screens/routes
- **Components** = Reusable UI elements
- **Services** = API communication
- **Store** = Global state
- **Hooks** = Stateful logic

### Q6: What is the role of `SessionGuard.tsx` and how would you implement it?

**Answer:**
`SessionGuard.tsx` ensures user session validity and handles session persistence on app load.

**Implementation:**
```typescript
export const SessionGuard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const setAuth = useAuthStore((s) => s.setAuth);
  
  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          const response = await authService.me();
          // Session valid, keep user logged in
          setIsLoading(false);
        } catch (error) {
          // Session invalid, clear auth
          localStorage.clear();
        }
      }
      setIsLoading(false);
    };
    
    validateSession();
  }, []);
  
  if (isLoading) return <LoadingScreen />;
  return <App />;
};
```

---

## State Management (Zustand)

### Q7: What is Zustand and how is it used in this project?

**Answer:**
Zustand is a lightweight, simple state management library for React. It's easier than Redux and Context API.

**Pros:**
- Small bundle size
- No boilerplate
- TypeScript friendly
- Hooks-based API

**Usage in this project:**
```typescript
// store/authStore.ts
import { create } from "zustand";

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  fullName: string | null;
  setAuth: (payload: {...}) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: localStorage.getItem("access_token"),
  setAuth: ({ accessToken, refreshToken, fullName }) => {
    localStorage.setItem("access_token", accessToken);
    set({ accessToken });
  },
  logout: () => {
    localStorage.clear();
    set({ accessToken: null });
  }
}));

// Usage in component
const MyComponent = () => {
  const token = useAuthStore((s) => s.accessToken);
  const logout = useAuthStore((s) => s.logout);
  
  return <button onClick={logout}>Logout</button>;
};
```

### Q8: How does Zustand persist state to localStorage?

**Answer:**
In this project, auth state is manually persisted to localStorage in the action methods:

```typescript
setAuth: ({ accessToken, refreshToken, fullName }) => {
  // Persist to localStorage
  localStorage.setItem("access_token", accessToken);
  localStorage.setItem("refresh_token", refreshToken);
  localStorage.setItem("full_name", fullName);
  // Update Zustand state
  set({ accessToken, refreshToken, fullName });
},
```

**Best Practice:** For production, use Zustand middleware:
```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create<AuthState>(
  persist(
    (set) => ({ /* store */ }),
    { name: "auth-store" }
  )
);
```

---

## Data Fetching (React Query)

### Q9: What is React Query (TanStack Query) and why use it instead of direct useEffect + useState?

**Answer:**
React Query is a server state management library that handles caching, synchronization, and background updates.

**Benefits:**
- **Caching:** Automatic request deduplication and smart caching
- **Background Refetching:** Keep data fresh without manual management
- **Optimistic Updates:** Update UI before server confirms
- **Error Handling:** Built-in retry logic and error states
- **DevTools:** Debug state with React Query DevTools
- **Less Code:** No need to manually manage loading/error states

**Without React Query:**
```typescript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  getDashboard()
    .then(setData)
    .catch(setError)
    .finally(() => setLoading(false));
}, []);
```

**With React Query:**
```typescript
const { data, isLoading, error } = useDashboardSummary();
```

### Q10: Examine the `useFinanceQueries.ts` hook. What queries does it expose and why centralize them?

**Answer:**
The hook centralizes all data-fetching logic for the finance app:

```typescript
export const useDashboardSummary = () => 
  useQuery<DashboardSummary>({ 
    queryKey: ["dashboard"], 
    queryFn: dashboardService.summary 
  });

export const useAccounts = () => 
  useQuery<Account[]>({ 
    queryKey: ["accounts"], 
    queryFn: accountService.list 
  });

export const useTransactions = (params?: Record<string, string | number>) => 
  useQuery<Transaction[]>({ 
    queryKey: ["transactions", params], 
    queryFn: () => transactionService.list(params) 
  });

export const useBudgets = (month: number, year: number) => 
  useQuery<Budget[]>({ 
    queryKey: ["budgets", month, year], 
    queryFn: () => budgetService.list(month, year) 
  });

// ... more queries for goals, recurring, reports, insights, etc.
```

**Why Centralize?**
- **Single source of truth** for query configuration
- **Consistency** in query keys and error handling
- **Easy refactoring** - change backend without touching components
- **Type safety** - all queries are typed
- **Reusability** - use same hook in multiple components

### Q11: What are query keys in React Query? Why are they important?

**Answer:**
Query keys are unique identifiers for queries. They determine caching and invalidation behavior.

**Structure:** Query keys should be an array, with related queries sharing a common prefix.

**Example from project:**
```typescript
["dashboard"]              // Global dashboard query
["accounts"]               // All accounts
["budgets", month, year]   // Budgets for specific month/year (parameterized)
["transactions", params]   // Transactions with filter params
["report-category", from, to]  // Reports with date range
```

**Why Important:**
- **Caching:** React Query uses keys to cache results
- **Invalidation:** Invalidate related queries - `queryClient.invalidateQueries({ queryKey: ["budgets"] })`
- **Deduplication:** Same key + same params = reuse cached data
- **Updates:** Background refetching is tied to keys

### Q12: How would you handle pagination with React Query?

**Answer:**
Use query keys that include the page number:

```typescript
const [page, setPage] = useState(1);

const { data, isLoading, error } = useQuery({
  queryKey: ["transactions", page],  // New key for each page
  queryFn: () => transactionService.list({ page }),
  keepPreviousData: true,  // Show old data while loading new
});

return (
  <div>
    {data?.map(tx => <TransactionRow key={tx.id} {...tx} />)}
    <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>Prev</button>
    <button onClick={() => setPage(p => p + 1)}>Next</button>
  </div>
);
```

**Note:** `keepPreviousData` prevents loading state flashing between page transitions.

---

## Routing (React Router)

### Q13: How is routing structured in this project? Explain the difference between `AuthLayout` and `AppLayout`.

**Answer:**
This project uses **nested routing** with layout wrappers. There are two main routes:

**Auth Routes (No Authentication Required):**
```typescript
{
  element: <AuthLayout />,
  children: [
    { path: "/login", element: <LoginPage /> },
    { path: "/signup", element: <SignupPage /> },
    { path: "/forgot-password", element: <ForgotPasswordPage /> },
    { path: "/reset-password", element: <ResetPasswordPage /> }
  ]
}
```

**Protected Routes (Requires Authentication):**
```typescript
{
  element: <ProtectedRoute />,
  children: [
    {
      element: <AppLayout />,  // Has Sidebar, Topbar, etc.
      children: [
        { path: "/", element: <DashboardPage /> },
        { path: "/transactions", element: <TransactionsPage /> },
        { path: "/budgets", element: <BudgetsPage /> },
        // ... more routes
      ]
    }
  ]
}
```

**Difference:**
- **AuthLayout:** Minimal layout, no navigation. Shows login/signup forms. No sidebar or topbar.
- **AppLayout:** Full layout with sidebar navigation, topbar, and user menu. Shows `<Outlet />` for actual page content.

### Q14: How does `ProtectedRoute` work? Show the implementation and explain the flow.

**Answer:**
```typescript
// src/routes/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "store/authStore";

export const ProtectedRoute = () => {
  const token = useAuthStore((s) => s.accessToken);
  
  // If no token, redirect to login
  if (!token) return <Navigate to="/login" replace />;
  
  // If token exists, render nested routes
  return <Outlet />;
};
```

**Flow:**
1. User accesses `/accounts` (protected route)
2. `ProtectedRoute` component checks if `accessToken` exists in authStore
3. If NO token → Redirect to `/login` (unauthenticated users can't see the page)
4. If YES token → Render `<Outlet />` which shows the page content

### Q15: How would you implement logout and redirect to login?

**Answer:**
```typescript
const logout = () => {
  const clearAuth = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  
  clearAuth();  // Clear localStorage and Zustand state
  navigate("/login", { replace: true });  // Redirect to login
};

// In button
<button onClick={logout}>Logout</button>
```

**Alternative with API call:**
```typescript
const logout = async () => {
  try {
    await authService.logout();  // Notify backend
    clearAuth();
    navigate("/login", { replace: true });
  } catch (error) {
    toast.error("Logout failed");
  }
};
```

---

## Form Handling (React Hook Form)

### Q16: What is React Hook Form and what are its advantages over traditional form handling?

**Answer:**
React Hook Form is a performant form library with hooks-based API, minimal re-renders, and built-in validation.

**Advantages:**
- **Performance:** Only re-renders when specific field changes (not entire form)
- **Bundle Size:** ~9kb vs Redux ~40kb
- **Validation:** Built-in, with Zod integration
- **Uncontrolled Components:** Uses refs instead of controlled state (less memory)
- **Easy Integration:** Works with UI libraries, custom components

**Traditional Approach (Bad - causes re-renders for every keystroke):**
```typescript
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

return (
  <form>
    <input value={email} onChange={(e) => setEmail(e.target.value)} />
    <input value={password} onChange={(e) => setPassword(e.target.value)} />
  </form>
);
```

### Q17: How is form validation used in this project (Zod + React Hook Form)?

**Answer:**
The project uses Zod with React Hook Form for schema validation.

**Example - Login Form:**
```typescript
// authSchemas.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password required")
});

export type LoginFormData = z.infer<typeof loginSchema>;

// LoginPage.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const LoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur"  // Validate on blur
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await authService.login(data);
      useAuthStore.setState({ /* auth data */ });
    } catch (error) {
      toast.error("Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <InputField 
        {...register("email")}
        placeholder="Email"
        error={errors.email?.message}
      />
      <InputField 
        {...register("password")}
        type="password"
        placeholder="Password"
        error={errors.password?.message}
      />
      <button type="submit">Login</button>
    </form>
  );
};
```

### Q18: What should `InputField` component look like?

**Answer:**
```typescript
import { forwardRef, InputHTMLAttributes } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="input-group">
        {label && <label>{label}</label>}
        <input
          ref={ref}
          className={`input ${error ? "input-error" : ""} ${className || ""}`}
          {...props}
        />
        {error && <span className="error-text">{error}</span>}
      </div>
    );
  }
);

InputField.displayName = "InputField";
```

---

## Authentication & Security

### Q19: How is authentication implemented? Explain the JWT token flow.

**Answer:**
This project uses **JWT (JSON Web Token) authentication** with access + refresh tokens.

**Flow:**
1. **Login:** User sends credentials → Backend returns `accessToken` (short-lived) + `refreshToken` (long-lived)
2. **Storage:** Both tokens stored in localStorage and Zustand store
3. **API Requests:** Axios interceptor adds `Authorization: Bearer ${accessToken}` to all requests
4. **Token Expiration:** When accessToken expires (401 response), use refreshToken to get new accessToken
5. **Refresh Logic:** Automatic retry the failed request with new token
6. **Logout:** Clear tokens from localStorage and redirect to login

**Code Example - API Interceptor:**
```typescript
api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("access_token");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !original._retry) {
      // Token expired, refresh it
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const newToken = await refreshAccessToken(refreshToken);
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);  // Retry request
        } catch (err) {
          localStorage.clear();
          window.location.href = "/login";
        }
      }
    }
  }
);
```

### Q20: How should password reset be handled securely?

**Answer:**
The current implementation:
1. **Forgot Password:** User enters email → Backend sends reset token to email with expiration
2. **Reset Link:** Email contains link with reset token: `/reset-password?token=xyz`
3. **Verify Token:** Frontend sends token + new password to backend
4. **Backend Validates:** Check token is valid and not expired
5. **Security Measures:**
   - Token is short-lived (15-30 minutes)
   - Token is one-time use only
   - Use HTTPS for transmission
   - Hash password before storing

```typescript
// Frontend
const { token } = useSearchParams();
const resetPassword = async (newPassword: string) => {
  await authService.resetPassword({
    token,
    newPassword
  });
};

// Backend should:
// 1. Find user by reset token
// 2. Check token hasn't expired
// 3. Hash newPassword with bcrypt/Argon2
// 4. Update user password
// 5. Delete used token
// 6. Send confirmation email
```

---

## Performance Optimization

### Q21: How would you optimize the dashboard page performance?

**Answer:**

**1. Code Splitting (Lazy Loading):**
```typescript
const DashboardPage = lazy(() => import("pages/DashboardPage"));
const TransactionsPage = lazy(() => import("pages/TransactionsPage"));

// In router
<Route path="/" element={<Suspense fallback={<Loading />}><DashboardPage /></Suspense>} />
```

**2. React Query Caching:**
```typescript
const { data: dashboard } = useDashboardSummary();  // Cached automatically
const { data: accounts } = useAccounts();           // Parallel queries, cached
```

**3. Memoization (Components & Callbacks):**
```typescript
// Prevent StatCard re-render if props don't change
const StatCard = memo(({ label, value }) => (
  <div>{label}: {value}</div>
));

// Memoize expensive calculations
const chartData = useMemo(() => 
  processChartData(transactions, 1000),
  [transactions]
);
```

**4. Query Optimization:**
```typescript
// Only fetch what you need
const { data: summary } = useDashboardSummary({
  select: (data) => ({  // Transform data
    totalBalance: data.totalBalance,
    spentThisMonth: data.spentThisMonth
  })
});
```

**5. Pagination (Transactions list):**
```typescript
// Don't load all 10,000 transactions at once
const [page, setPage] = useState(1);
const { data } = useTransactions({ page, limit: 20 });
```

### Q22: How would you implement virtualization for large lists?

**Answer:**
Use `react-window` library for rendering only visible items:

```typescript
import { FixedSizeList } from "react-window";

const TransactionsList = ({ items }: { items: Transaction[] }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <TransactionRow transaction={items[index]} />
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={60}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
};
```

**Benefits:** Only visible rows rendered in DOM. Can handle 10,000+ items smoothly.

### Q23: How would you implement infinite scrolling?

**Answer:**
Use React Query with `useInfiniteQuery`:

```typescript
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuery({
  queryKey: ["transactions"],
  queryFn: ({ pageParam = 1 }) => 
    transactionService.list({ page: pageParam }),
  getNextPageParam: (lastPage, pages) => pages.length + 1,
});

const allTransactions = data?.pages.flatMap(page => page) ?? [];

useEffect(() => {
  const handleScroll = () => {
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100) {
      if (hasNextPage) fetchNextPage();
    }
  };
  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, [hasNextPage, fetchNextPage]);
```

---

## Testing

### Q24: How would you test a component like `DashboardPage`?

**Answer:**

**Setup (vitest + React Testing Library):**
```typescript
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DashboardPage } from "pages/DashboardPage";
import * as hooks from "hooks/useFinanceQueries";

const mockUseDashboardSummary = vi.spyOn(hooks, "useDashboardSummary");

describe("DashboardPage", () => {
  it("renders loading state", () => {
    mockUseDashboardSummary.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null
    });

    render(
      <QueryClientProvider client={new QueryClient()}>
        <DashboardPage />
      </QueryClientProvider>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("renders dashboard data when loaded", () => {
    mockUseDashboardSummary.mockReturnValue({
      data: {
        totalBalance: 5000,
        spentThisMonth: 1200
      },
      isLoading: false,
      error: null
    });

    render(
      <QueryClientProvider client={new QueryClient()}>
        <DashboardPage />
      </QueryClientProvider>
    );

    expect(screen.getByText("5000")).toBeInTheDocument();
  });

  it("renders error state", () => {
    mockUseDashboardSummary.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("API failed")
    });

    render(
      <QueryClientProvider client={new QueryClient()}>
        <DashboardPage />
      </QueryClientProvider>
    );

    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

### Q25: How would you test an async API call?

**Answer:**

```typescript
import { vi } from "vitest";
import * as authService from "services/authService";

describe("Login", () => {
  it("should login user successfully", async () => {
    const user = { email: "test@test.com", password: "123456" };
    const mockTokens = { 
      accessToken: "token123", 
      refreshToken: "refresh123" 
    };

    // Mock API response
    vi.spyOn(authService, "login").mockResolvedValueOnce({
      data: mockTokens
    });

    const result = await authService.login(user);
    expect(result.data).toEqual(mockTokens);
  });

  it("should handle login error", async () => {
    vi.spyOn(authService, "login").mockRejectedValueOnce(
      new Error("Invalid credentials")
    );

    await expect(authService.login({...})).rejects.toThrow("Invalid credentials");
  });
});
```

### Q26: How would you test form submission?

**Answer:**

```typescript
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";

it("should submit form with valid data", async () => {
  const user = userEvent.setup();

  render(<LoginPage />);

  // Fill form
  await user.type(screen.getByPlaceholderText(/email/i), "test@test.com");
  await user.type(screen.getByPlaceholderText(/password/i), "123456");

  // Submit
  await user.click(screen.getByRole("button", { name: /login/i }));

  // Assert
  await screen.findByText(/dashboard/i);  // Should navigate to dashboard
});

it("should show validation errors for empty form", async () => {
  const user = userEvent.setup();
  render(<LoginPage />);

  await user.click(screen.getByRole("button", { name: /login/i }));

  // Form shouldn't submit if validation fails
  expect(screen.getByText(/email required/i)).toBeInTheDocument();
});
```

### Q27: How would you set up Playwright e2e tests?

**Answer:**

**playwright.config.ts already set up. Example test:**

```typescript
// e2e/dashboard.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("http://localhost:5173/login");
    await page.fill("input[placeholder='Email']", "test@test.com");
    await page.fill("input[placeholder='Password']", "123456");
    await page.click("button:has-text('Login')");
    
    // Wait for dashboard to load
    await page.waitForURL("http://localhost:5173/");
  });

  test("should display dashboard summary", async ({ page }) => {
    await expect(page.locator("text=Total Balance")).toBeVisible();
    await expect(page.locator("text=Monthly Spending")).toBeVisible();
  });

  test("should filter transactions by date", async ({ page }) => {
    await page.click("a:has-text('Transactions')");
    await page.fill("input[placeholder='From Date']", "2024-01-01");
    await page.fill("input[placeholder='To Date']", "2024-12-31");
    await page.click("button:has-text('Filter')");

    // Verify results
    await expect(page.locator("table tbody tr")).toHaveCount(20);
  });

  test("should logout user", async ({ page }) => {
    await page.click("button:has-text('Logout')");
    await page.waitForURL("http://localhost:5173/login");
    expect(page.url()).toContain("/login");
  });
});
```

**Run tests:** `npm run e2e`

---

## Project-Specific Questions

### Q28: Explain the difference between `dashboardService`, `transactionService`, and other services.

**Answer:**
Each service is a collection of API methods for a specific domain:

```typescript
// accountService.ts
export const accountService = {
  list: () => api.get<ApiResponse<Account[]>>("/accounts"),
  create: (data) => api.post("/accounts", data),
  update: (id, data) => api.put(`/accounts/${id}`, data),
  delete: (id) => api.delete(`/accounts/${id}`)
};

// transactionService.ts
export const transactionService = {
  list: (params) => api.get("/transactions", { params }),
  create: (data) => api.post("/transactions", data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`)
};

// budgetService.ts
export const budgetService = {
  list: (month, year) => api.get("/budgets", { params: { month, year } }),
  create: (data) => api.post("/budgets", data),
  // ...
};
```

**Benefits:**
- **Organization:** Related endpoints grouped together
- **Reusability:** Share service across components
- **Testing:** Mock individual services easily
- **Maintainability:** One place to change API structure

### Q29: How would you add a new feature (e.g., Expense Categories)?

**Answer:**

**Step 1: Create API Service**
```typescript
// services/financeServices.ts - add
export const categoryService = {
  list: () => api.get<Category[]>("/categories"),
  create: (data: CreateCategoryPayload) => api.post("/categories", data),
  update: (id: string, data: CreateCategoryPayload) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`)
};
```

**Step 2: Create TypeScript Types**
```typescript
// types/api.ts
export type Category = {
  id: string;
  name: string;
  color: string;
  icon: string;
};

export type CreateCategoryPayload = Omit<Category, "id">;
```

**Step 3: Add React Query Hook**
```typescript
// hooks/useFinanceQueries.ts
export const useCategories = () => 
  useQuery<Category[]>({ 
    queryKey: ["categories"], 
    queryFn: categoryService.list 
  });

export const useCategoryCreate = () =>
  useMutation({
    mutationFn: (data) => categoryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    }
  });
```

**Step 4: Create Page Component**
```typescript
// pages/CategoriesPage.tsx
export const CategoriesPage = () => {
  const { data: categories, isLoading } = useCategories();
  const { mutate: createCategory } = useCategoryCreate();

  if (isLoading) return <Loading />;

  return (
    <div>
      <PageHeader title="Categories" />
      {categories?.map(cat => (
        <CategoryCard key={cat.id} category={cat} />
      ))}
      <button onClick={() => createCategory({ name: "Food", color: "#FF5733", icon: "utensil" })}>
        Add Category
      </button>
    </div>
  );
};
```

**Step 5: Add Route**
```typescript
// routes/router.tsx
{ path: "/categories", element: <CategoriesPage /> }
```

**Step 6: Add Navigation Link**
```typescript
// components/layout/Sidebar.tsx
<NavLink to="/categories">Categories</NavLink>
```

### Q30: How would you handle API errors globally?

**Answer:**

**Current Implementation:**
```typescript
// utils/apiError.ts
export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }
  return fallback;
};
```

**Improved Global Error Handler:**
```typescript
// lib/errorHandler.ts
export class ApiErrorHandler {
  static handle(error: unknown) {
    if (isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message;

      switch (status) {
        case 400:
          return { message: message || "Bad request", type: "error" };
        case 401:
          // Auto logout
          localStorage.clear();
          window.location.href = "/login";
          return { message: "Session expired. Please login again", type: "error" };
        case 403:
          return { message: "Unauthorized access", type: "error" };
        case 404:
          return { message: "Resource not found", type: "error" };
        case 500:
          return { message: "Server error. Try again later.", type: "error" };
        default:
          return { message: message || "An error occurred", type: "error" };
      }
    }
    return { message: "Unknown error", type: "error" };
  }
}

// Usage in components
try {
  await authService.login(data);
} catch (error) {
  const { message } = ApiErrorHandler.handle(error);
  toast.error(message);
}
```

**Request Interceptor Error Handling:**
```typescript
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

### Q31: How would you implement dark mode?

**Answer:**

**Step 1: Create Theme Context**
```typescript
// src/context/ThemeContext.tsx
import { createContext, useContext, useState } from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void } | null>(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("theme");
    return (saved as Theme) || "light";
  });

  const toggleTheme = () => {
    setTheme(prev => {
      const newTheme = prev === "light" ? "dark" : "light";
      localStorage.setItem("theme", newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};
```

**Step 2: Update CSS**
```css
:root {
  --bg: #fff;
  --text: #000;
  --border: #ddd;
}

[data-theme="dark"] {
  --bg: #1a1a1a;
  --text: #fff;
  --border: #333;
}

body {
  background-color: var(--bg);
  color: var(--text);
}
```

**Step 3: Use in App**
```typescript
// main.tsx
<ThemeProvider>
  <App />
</ThemeProvider>

// Topbar.tsx
const Topbar = () => {
  const { theme, toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>🌙 / ☀️</button>;
};
```

### Q32: How would you implement analytics tracking?

**Answer:**

```typescript
// lib/analytics.ts
import { useEffect } from "react";

export const trackPageView = (pageName: string) => {
  // Google Analytics
  if (window.gtag) {
    window.gtag("config", "GA_MEASUREMENT_ID", {
      page_path: window.location.pathname,
      page_title: pageName
    });
  }
};

export const trackEvent = (category: string, action: string, label?: string) => {
  if (window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label
    });
  }
};

// Usage in components
const DashboardPage = () => {
  useEffect(() => {
    trackPageView("Dashboard");
  }, []);

  const handleBudgetClick = () => {
    trackEvent("engagement", "budget_clicked", "dashboard");
  };

  return <button onClick={handleBudgetClick}>View Budget</button>;
};
```

### Q33: What security best practices this project should follow?

**Answer:**

1. **HTTPS Only:** All API calls over HTTPS, never HTTP
2. **Secure Token Storage:** Use httpOnly cookies instead of localStorage for tokens (prevents XSS attacks)
3. **CSRF Protection:** Add CSRF token to state-modifying requests
4. **Input Validation:** Zod schema validation on frontend (also validate on backend!)
5. **Output Encoding:** Prevent XSS by encoding user input when displaying
6. **Rate Limiting:** Backend should rate-limit login attempts
7. **API Versioning:** Use `/api/v1/` to allow backward compatibility
8. **Secrets Management:** Store API keys in environment variables, never in code
9. **Dependency Updates:** Regularly update packages to patch security vulnerabilities
10. **Error Messages:** Don't expose sensitive info in error messages (implement logging)

---

## Advanced Topics

### Q34: How would you implement Redux DevTools for Zustand?

**Answer:**

```typescript
import { create } from "zustand";
import { devtools } from "zustand/middleware";

export const useAuthStore = create<AuthState>(
  devtools((set) => ({
    accessToken: null,
    setAuth: (payload) => {
      set({ ...payload });
    },
    logout: () => {
      set({ accessToken: null, refreshToken: null });
    }
  }), { name: "AuthStore" })
);
```

Then install Redux DevTools extension browser extension to debug state changes.

### Q35: How would you convert this to TypeScript strict mode?

**Answer:**

Update `tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

Then fix all TypeScript errors across the codebase.

---

## Summary Checklist for Interview

- ✅ Understand React fundamentals (hooks, components, JSX)
- ✅ Know the project architecture (modular, feature-based)
- ✅ Explain Zustand for state management
- ✅ Know React Query for data fetching
- ✅ Understand routing and protected routes
- ✅ Know form handling with React Hook Form + Zod
- ✅ Explain JWT authentication flow
- ✅ Know performance optimization techniques
- ✅ Understand testing with Vitest + React Testing Library + Playwright
- ✅ Be able to add new features to the project
- ✅ Know security best practices
- ✅ Be familiar with deployment strategies
