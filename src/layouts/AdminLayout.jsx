import { Outlet, NavLink, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  function handleSignOut() {
    signOut();
    navigate(ROUTES.login, { replace: true });
  }

  return (
    <div className="admShell">

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className="admSidebar">
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

      {/* ── Page content ─────────────────────────────────── */}
      <main className="admMain">
        <Outlet />
      </main>

    </div>
  );
}