import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { ROUTES } from "../routes/routePaths.js";
import "../styles/pages/farmer/farmerLayout.css";
import logo from "../assets/logo.png";

const NAV_ITEMS = [
  { to: ROUTES.farmerDashboard,   icon: "🏡", label: "Dashboard"   },
  { to: ROUTES.farmerApplication, icon: "📋", label: "Application"  },
  { to: ROUTES.farmerCrops,       icon: "🌿", label: "My Crops"     },
];

export function FarmerLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  function handleSignOut() {
    signOut();
    navigate(ROUTES.login, { replace: true });
  }

  return (
    <div className="frmShell">

      {/* ── Sidebar ───────────────────────────────────────── */}
      <aside className="frmSidebar">
        <div className="frmSidebarTop">

          {/* Brand */}
          <div className="frmBrand">
            <img src={logo} alt="CHC" className="frmBrandLogo" />
            <div>
              <span className="frmBrandText">Ceylon Harvest</span>
              <span className="frmBrandSub">Capital</span>
            </div>
          </div>

          {/* Role badge */}
          <div className="frmRoleBadge">
            🌾 Farmer Portal
          </div>

          {/* Nav */}
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
          </nav>

        </div>

        {/* Bottom user strip */}
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

      {/* ── Page content ──────────────────────────────────── */}
      <main className="frmMain">
        <Outlet />
      </main>

    </div>
  );
}