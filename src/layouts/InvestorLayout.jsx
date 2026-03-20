import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { ROUTES } from "../routes/routePaths.js";
import "../styles/pages/investor/investorLayout.css";
import logo from "../assets/logo.png";

const NAV_ITEMS = [
  { to: ROUTES.investorDashboard,     icon: "📊", label: "Dashboard"     },
  { to: ROUTES.investorPortfolio,     icon: "💼", label: "Portfolio"     },
  { to: ROUTES.investorOpportunities, icon: "🌱", label: "Opportunities" },
  { to: ROUTES.investorReports,       icon: "📈", label: "Reports"       },
];

export function InvestorLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  function handleSignOut() {
    signOut();
    navigate(ROUTES.login, { replace: true });
  }

  return (
    <div className="invShell">

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className="invSidebar">

        <div className="invSidebarTop">
          <div className="invBrand">
            <img src={logo} alt="CHC" className="invBrandLogo" />
            <span className="invBrandText">Ceylon Harvest</span>
          </div>

          <nav className="invNav">
            {NAV_ITEMS.map(({ to, icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  "invNavItem" + (isActive ? " active" : "")
                }
              >
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

      {/* ── Page content ─────────────────────────────────── */}
      <main className="invMain">
        <Outlet />
      </main>

    </div>
  );
}
