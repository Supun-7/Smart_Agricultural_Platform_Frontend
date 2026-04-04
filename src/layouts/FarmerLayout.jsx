import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { ROUTES } from "../routes/routePaths.js";
import { Navbar } from "../components/Navbar.jsx";

const NAV_ITEMS = [
  { to: ROUTES.farmerDashboard,    icon: "🏠", label: "Dashboard"    },
  { to: ROUTES.farmerApplication,  icon: "📝", label: "Register Land" },
  { to: ROUTES.farmerCrops,        icon: "🌾", label: "My Crops"     },
  { to: ROUTES.farmerMilestones,   icon: "📎", label: "Upload Evidence" },
];

export function FarmerLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  function handleSignOut() {
    signOut();
    navigate(ROUTES.login, { replace: true });
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg, #0b0f0c)" }}>
      <Navbar />
      <div style={{ display: "flex", paddingTop: "70px" }}>

        {/* Sidebar */}
        <aside style={{
          width: 220, flexShrink: 0,
          background: "rgba(255,255,255,.03)",
          borderRight: "1px solid rgba(255,255,255,.08)",
          display: "flex", flexDirection: "column",
          justifyContent: "space-between",
          padding: "1.5rem 1rem",
          position: "sticky", top: 70,
          height: "calc(100vh - 70px)",
          overflowY: "auto",
        }}>
          <nav style={{ display: "flex", flexDirection: "column", gap: ".3rem" }}>
            {NAV_ITEMS.map(({ to, icon, label }) => (
              <NavLink key={to} to={to} className={({ isActive }) =>
                "admNavItem" + (isActive ? " active" : "")
              }>
                <span className="admNavIcon">{icon}</span>
                <span className="admNavLabel">{label}</span>
              </NavLink>
            ))}
          </nav>

          <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: ".65rem" }}>
              <div className="admAvatar">
                {user?.fullName?.charAt(0)?.toUpperCase() ?? "F"}
              </div>
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontSize: ".85rem", fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user?.fullName}
                </div>
                <div style={{ fontSize: ".72rem", color: "var(--muted)" }}>Farmer</div>
              </div>
            </div>
            <button className="btn btnGhost admSignOut" onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, minWidth: 0, overflowY: "auto" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}