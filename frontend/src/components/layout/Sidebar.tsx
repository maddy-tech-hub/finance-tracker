import type { ReactElement } from "react";
import { useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { FiActivity, FiBarChart2, FiCreditCard, FiHome, FiPieChart, FiRefreshCw, FiSettings, FiSliders, FiTarget, FiTrendingUp } from "react-icons/fi";

type SidebarProps = {
  className?: string;
  onNavigate?: () => void;
};

type NavItem = {
  to: string;
  label: string;
  icon: ReactElement;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const sections: NavSection[] = [
  {
    title: "Track",
    items: [
      { to: "/", label: "Dashboard", icon: <FiHome /> },
      { to: "/transactions", label: "Transactions", icon: <FiActivity /> },
      { to: "/accounts", label: "Accounts", icon: <FiCreditCard /> }
    ]
  },
  {
    title: "Plan",
    items: [
      { to: "/budgets", label: "Budgets", icon: <FiPieChart /> },
      { to: "/goals", label: "Goals", icon: <FiTarget /> },
      { to: "/recurring", label: "Recurring", icon: <FiRefreshCw /> }
    ]
  },
  {
    title: "Analyze",
    items: [
      { to: "/reports", label: "Reports", icon: <FiBarChart2 /> },
      { to: "/insights", label: "Insights", icon: <FiTrendingUp /> }
    ]
  },
  {
    title: "Automate",
    items: [
      { to: "/rules", label: "Rules", icon: <FiSliders /> }
    ]
  },
  {
    title: "Manage",
    items: [
      { to: "/settings", label: "Settings", icon: <FiSettings /> }
    ]
  }
];

export const Sidebar = ({ className, onNavigate }: SidebarProps) => (
  <SidebarContent className={className} onNavigate={onNavigate} />
);

const SidebarContent = ({ className, onNavigate }: SidebarProps) => {
  const location = useLocation();
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const activeLink = nav.querySelector<HTMLAnchorElement>(".sidebar-link.active");
    if (!activeLink) return;
    activeLink.scrollIntoView({ block: "nearest" });
  }, [location.pathname]);

  return (
    <aside className={`sidebar ${className ?? ""}`.trim()} aria-label="Main navigation">
      <div className="brand-wrap">
        <div className="brand-mark">FT</div>
        <div className="brand">Personal Finance Tracker</div>
      </div>

      <nav ref={navRef}>
        {sections.map((section) => (
          <div key={section.title} className="sidebar-section">
            <p className="sidebar-section-title">{section.title}</p>
            <div className="sidebar-section-links">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
                  onClick={onNavigate}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="sidebar-foot">
        <p>Stay consistent</p>
        <small>Log expenses daily to keep insights accurate.</small>
      </div>
    </aside>
  );
};
