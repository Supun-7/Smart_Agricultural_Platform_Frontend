import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { ROUTES } from "../routes/routePaths.js";
import "../styles/pages/auditor/auditorLayout.css";
import logo from "../assets/logo.png";

const NAV_ITEMS = [
  { to: ROUTES.auditorDashboard, icon: "📊", label: "Dashboard"          },
  { to: ROUTES.auditorKyc,       icon: "🪪", label: "KYC Reviews"        },
  { to: ROUTES.auditorFarmers,   icon: "🌾", label: "Farmer Applications" },
  { to: ROUTES.auditorReports,   icon: "📈", label: "Reports"             },
  { to: ROUTES.auditorHistory,   icon: "🕓", label: "Audit History"       },
];

export function AuditorLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  function handleSignOut() {
    signOut();
    navigate(ROUTES.login, { replace: true });
  }

  return (
    <div className="audShell">

      {/* ── Sidebar ───────────────────────────────────────── */}
      <aside className="audSidebar">
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

      {/* ── Page content ──────────────────────────────────── */}
      <main className="audMain">
        <Outlet />
      </main>

    </div>
  );
}