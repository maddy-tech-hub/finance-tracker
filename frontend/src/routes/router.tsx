import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "routes/ProtectedRoute";
import { AppLayout } from "layouts/AppLayout";
import { AuthLayout } from "layouts/AuthLayout";
import { LoginPage } from "pages/LoginPage";
import { SignupPage } from "pages/SignupPage";
import { ForgotPasswordPage } from "pages/ForgotPasswordPage";
import { ResetPasswordPage } from "pages/ResetPasswordPage";
import { DashboardPage } from "pages/DashboardPage";
import { TransactionsPage } from "pages/TransactionsPage";
import { BudgetsPage } from "pages/BudgetsPage";
import { GoalsPage } from "pages/GoalsPage";
import { ReportsPage } from "pages/ReportsPage";
import { RecurringPage } from "pages/RecurringPage";
import { AccountsPage } from "pages/AccountsPage";
import { SettingsPage } from "pages/SettingsPage";

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/signup", element: <SignupPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/reset-password", element: <ResetPasswordPage /> }
    ]
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/", element: <DashboardPage /> },
          { path: "/transactions", element: <TransactionsPage /> },
          { path: "/budgets", element: <BudgetsPage /> },
          { path: "/goals", element: <GoalsPage /> },
          { path: "/reports", element: <ReportsPage /> },
          { path: "/recurring", element: <RecurringPage /> },
          { path: "/accounts", element: <AccountsPage /> },
          { path: "/settings", element: <SettingsPage /> }
        ]
      }
    ]
  }
]);
