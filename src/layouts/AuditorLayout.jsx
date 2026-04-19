import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { ROUTES } from "../routes/routePaths.js";
import "../styles/pages/auditor/auditorLayout.css";
import logo from "../assets/logo.png";

const NAV_ITEMS = [
  { to: ROUTES.auditorDashboard,   icon: "📊", label: "Dashboard"    },
  { to: ROUTES.auditorProjects,    icon: "🏗️", label: "Projects"      },
  { to: ROUTES.auditorReports,     icon: "📈", label: "Reports"       },
  { to: ROUTES.auditorFullHistory, icon: "📋", label: "Full History"  },
];

export function AuditorLayout() {
  const { user, signOut } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile nav completed)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Lock body scroll when drawer is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }
    return () => document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  function handleSignOut() {
    signOut();
    navigate(ROUTES.login, { replace: true });
  }

  return (
    <div className="audShell">

      {/* ── Mobile top bar ─────────────────────────────────────── */}
      <div className="layoutMobileTopbar">
        <div className="layoutMobileTopbarBrand">
          <img src={logo} alt="CHC" className="layoutMobileTopbarLogo" />
          <span className="layoutMobileTopbarText">Ceylon Harvest</span>
          <span
            className="layoutMobileRoleBadge"
            style={{ background: "rgba(89,193,115,.1)", border: "1px solid rgba(89,193,115,.25)", color: "var(--brand)" }}
          >
            Auditor
          </span>
        </div>
        <button
          className={"layoutHamburger" + (sidebarOpen ? " open" : "")}
          onClick={() => setSidebarOpen(o => !o)}
          aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={sidebarOpen}
        >
          <span /><span /><span />
        </button>
      </div>

      {/* ── Overlay backdrop ───────────────────────────────────── */}
      <div
        className={"drawerOverlay" + (sidebarOpen ? " visible" : "")}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* ── Sidebar ───────────────────────────────────────────── */}
      <aside
        className={"audSidebar" + (sidebarOpen ? " open" : "")}
        aria-label="Auditor navigation"
      >
        <div className="audSidebarTop">

          {/* Brand */}
          <div className="audBrand">
            <img src={logo} alt="CHC" className="audBrandLogo" />
            <div>
              <span className="audBrandText">Ceylon Harvest</span>
              <span className="audBrandSub">Capital</span>
            </div>
          </div>

          {/* Role badge */}
          <div className="audRoleBadge">
            🔍 Auditor Portal
          </div>

          {/* Nav */}
          <nav className="audNav">
            {NAV_ITEMS.map(({ to, icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  "audNavItem" + (isActive ? " active" : "")
                }
              >
                <span className="audNavIcon">{icon}</span>
                <span className="audNavLabel">{label}</span>
              </NavLink>
            ))}
          </nav>

        </div>

        {/* Bottom user strip */}
        <div className="audSidebarBottom">
          <div className="audUser">
            <div className="audAvatar">
              {user?.fullName?.charAt(0)?.toUpperCase() ?? "A"}
            </div>
            <div className="audUserInfo">
              <span className="audUserName">{user?.fullName}</span>
              <span className="audUserRole">Auditor</span>
            </div>
          </div>
          <button className="audSignOut" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Page content ──────────────────────────────────────── */}
      <main className="audMain">
        <Outlet />
      </main>

    </div>
  );
}
