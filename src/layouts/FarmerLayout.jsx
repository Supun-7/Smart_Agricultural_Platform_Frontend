import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { ROUTES } from "../routes/routePaths.js";
import { Navbar } from "../components/Navbar.jsx";
import "../styles/pages/farmer/farmerLayout.css";

const NAV_ITEMS = [
  { to: ROUTES.farmerDashboard,       icon: "🏠", label: "Dashboard"        },
  { to: ROUTES.farmerApplication,     icon: "📝", label: "Register Land"    },
  { to: ROUTES.farmerCrops,           icon: "🌾", label: "My Crops"         },
  { to: ROUTES.farmerMilestones,      icon: "📎", label: "Upload Evidence"  },
  { to: ROUTES.farmerContracts,       icon: "📋", label: "ගිවිසුම්"         },
  { to: ROUTES.farmerFinancialReport, icon: "📊", label: "Financial Report" },
];

export function FarmerLayout() {
  const { user, signOut } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Lock body scroll when drawer is open
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
    <div className="frmShell">
      <Navbar />

      {/* ── Mobile sidebar toggle bar (below navbar) ─────────── */}
      <div className="frmMobileBar">
        <button
          className={"layoutHamburger" + (sidebarOpen ? " open" : "")}
          onClick={() => setSidebarOpen(o => !o)}
          aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={sidebarOpen}
        >
          <span /><span /><span />
        </button>
        <span className="frmMobileBarLabel">
          {NAV_ITEMS.find(n => location.pathname.startsWith(n.to))?.label ?? "Farmer Portal"}
        </span>
      </div>

      {/* ── Overlay backdrop ──────────────────────────────────── */}
      <div
        className={"drawerOverlay" + (sidebarOpen ? " visible" : "")}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <div style={{ display: "flex", paddingTop: "70px" }}>

        {/* ── Sidebar ─────────────────────────────────────────── */}
        <aside className={"frmSidebar" + (sidebarOpen ? " open" : "")}>
          <div className="frmSidebarTop">

            {/* Role badge */}
            <span className="frmRoleBadge">🌾 Farmer Portal</span>

            {/* Nav links */}
            <nav className="frmNav">
              {NAV_ITEMS.map(({ to, icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    "frmNavItem" + (isActive ? " active" : "")
                  }
                >
                  <span className="frmNavIcon">{icon}</span>
                  <span className="frmNavLabel">{label}</span>
                </NavLink>
              ))}

              {/* ── Divider ── */}
              <div style={{ margin: ".6rem 0 .3rem", borderTop: "1px solid #1a2e1e" }} />

              {/* ── 24/7 AI Support ── */}
              <NavLink
                to={ROUTES.farmerSupport}
                className={({ isActive }) =>
                  "frmNavItem" + (isActive ? " active" : "")
                }
              >
                <span className="frmNavIcon">💬</span>
                <span className="frmNavLabel">
                  <span style={{ display: "block", lineHeight: 1.3 }}>24/7 Support</span>
                  <span style={{
                    display: "block",
                    fontSize: ".65rem",
                    fontWeight: 500,
                    color: "var(--brand)",
                    letterSpacing: ".02em",
                    lineHeight: 1.2,
                  }}>
                    Powered by AI
                  </span>
                </span>
                <span style={{
                  marginLeft: "auto",
                  fontSize: ".58rem",
                  fontWeight: 700,
                  letterSpacing: ".05em",
                  background: "rgba(89,193,115,.12)",
                  border: "1px solid rgba(89,193,115,.28)",
                  color: "var(--brand)",
                  borderRadius: "20px",
                  padding: ".15rem .45rem",
                  flexShrink: 0,
                  lineHeight: 1.4,
                }}>
                  LIVE
                </span>
              </NavLink>
            </nav>
          </div>

          {/* ── User info + sign out ─────────────────────────── */}
          <div className="frmSidebarBottom">
            <div className="frmUser">
              <div className="frmAvatar">
                {user?.fullName?.charAt(0)?.toUpperCase() ?? "F"}
              </div>
              <div className="frmUserInfo">
                <span className="frmUserName">{user?.fullName}</span>
                <span className="frmUserRole">Farmer</span>
              </div>
            </div>
            <button className="frmSignOut" onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────────── */}
        <main className="frmMain">
          <Outlet />
        </main>

      </div>
    </div>
  );
}
