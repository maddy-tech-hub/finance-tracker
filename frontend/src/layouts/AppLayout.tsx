import { Outlet } from "react-router-dom";
import { Sidebar } from "components/layout/Sidebar";
import { Topbar } from "components/layout/Topbar";

export const AppLayout = () => (
  <div className="app-shell">
    <Sidebar />
    <div className="app-content-wrap">
      <Topbar />
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  </div>
);
