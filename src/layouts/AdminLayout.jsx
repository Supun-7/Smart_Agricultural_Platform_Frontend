import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { ROUTES } from "../routes/routePaths.js";
import "../styles/pages/admin/adminLayout.css";
import logo from "../assets/logo.png";

const NAV_ITEMS = [
  { to: "/admin/dashboard",    icon: "📊", label: "Dashboard"   },
  { to: "/admin/create-user",  icon: "➕", label: "Create User" },
];

export function AdminLayout() {
  const { user, signOut } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change
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
    <div className="admShell">

      {/* ── Mobile top bar ─────────────────────────────────────── */}
      <div className="layoutMobileTopbar">
        <div className="layoutMobileTopbarBrand">
          <img src={logo} alt="CHC" className="layoutMobileTopbarLogo" />
          <span className="layoutMobileTopbarText">Ceylon Harvest</span>
          <span
            className="layoutMobileRoleBadge"
            style={{ background: "rgba(89,193,115,.1)", border: "1px solid rgba(89,193,115,.25)", color: "var(--brand)" }}
          >
            Admin
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

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        className={"admSidebar" + (sidebarOpen ? " open" : "")}
        aria-label="Admin navigation"
      >
        <div className="admSidebarTop">

          <div className="admBrand">
            <img src={logo} alt="CHC" className="admBrandLogo" />
            <span className="admBrandText">Ceylon Harvest</span>
          </div>

          <nav className="admNav">
            {NAV_ITEMS.map(({ to, icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  "admNavItem" + (isActive ? " active" : "")
                }
              >
                <span className="admNavIcon">{icon}</span>
                <span className="admNavLabel">{label}</span>
              </NavLink>
            ))}
          </nav>

        </div>

        <div className="admSidebarBottom">
          <div className="admUser">
            <div className="admAvatar">
              {user?.fullName?.charAt(0)?.toUpperCase() ?? "A"}
            </div>
            <div className="admUserInfo">
              <span className="admUserName">{user?.fullName}</span>
              <span className="admUserRole">Admin</span>
            </div>
          </div>
          <button className="btn btnGhost admSignOut" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Page content ─────────────────────────────────────── */}
      <main className="admMain">
        <Outlet />
      </main>

    </div>
  );
}
