import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { ROUTES } from "../routes/routePaths.js";
import { Navbar } from "../components/Navbar.jsx";
import "../styles/pages/investor/investorLayout.css";
import logo from "../assets/logo.png";

const NAV_ITEMS = [
  { to: "/investor/dashboard",      icon: "📊", label: "Dashboard"   },
  { to: "/investor/opportunities",  icon: "🌱", label: "Land Market" },
  { to: "/investor/portfolio",      icon: "💼", label: "My Projects" },
  { to: "/investor/contracts",      icon: "📋", label: "Contracts"   },
  { to: "/investor/reports",        icon: "📈", label: "Reports"     },
];

export function InvestorLayout() {
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
    <div className="invShell">
      <Navbar />

      {/* ── Mobile sidebar toggle bar (below navbar) ─────────── */}
      <div className="invMobileBar">
        <button
          className={"layoutHamburger" + (sidebarOpen ? " open" : "")}
          onClick={() => setSidebarOpen(o => !o)}
          aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={sidebarOpen}
        >
          <span /><span /><span />
        </button>
        <span className="invMobileBarLabel">
          {NAV_ITEMS.find(n => location.pathname.startsWith(n.to))?.label ?? "Investor Portal"}
        </span>
      </div>

      {/* ── Overlay backdrop ───────────────────────────────────── */}
      <div
        className={"drawerOverlay" + (sidebarOpen ? " visible" : "")}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <div className="invBody">

        {/* ── Sidebar ────────────────────────────────────────── */}
        <aside
          className={"invSidebar" + (sidebarOpen ? " open" : "")}
          aria-label="Investor navigation"
        >
          <div className="invSidebarTop">

            {/* Brand — visible inside drawer on mobile */}
            <div className="invBrand">
              <img src={logo} alt="CHC" className="invBrandLogo" />
              <span className="invBrandText">Ceylon Harvest</span>
            </div>

            <nav className="invNav">
              {NAV_ITEMS.map(({ to, icon, label }) => (
                <NavLink key={to} to={to} className={({ isActive }) =>
                  "invNavItem" + (isActive ? " active" : "")
                }>
                  <span className="invNavIcon">{icon}</span>
                  <span className="invNavLabel">{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="invSidebarBottom">
            <div className="invUser">
              <div className="invAvatar">
                {user?.fullName?.charAt(0)?.toUpperCase() ?? "I"}
              </div>
              <div className="invUserInfo">
                <span className="invUserName">{user?.fullName}</span>
                <span className="invUserRole">Investor</span>
              </div>
            </div>
            <button className="btn btnGhost invSignOut" onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        </aside>

        {/* ── Main content ───────────────────────────────────── */}
        <main className="invMain">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
