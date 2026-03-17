import { Outlet } from "react-router-dom";

export const AuthLayout = () => (
  <div className="auth-screen">
    <div className="auth-grid">
      <section className="auth-side">
        <p className="auth-kicker">Personal Finance Tracker</p>
        <h2>Build confidence with every rupee.</h2>
        <p>
          Track income, control spending, and hit your savings goals with a dashboard built for clear decisions.
        </p>
        <ul>
          <li>Fast transaction capture</li>
          <li>Budget alerts before overspending</li>
          <li>Recurring bill visibility</li>
        </ul>
      </section>

      <section className="auth-card">
        <Outlet />
      </section>
    </div>
  </div>
);
