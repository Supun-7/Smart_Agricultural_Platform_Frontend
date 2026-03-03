import { NavLink, useNavigate } from "react-router-dom";
import { ROUTES } from "../routes/routePaths.js";
import { useAuth } from "../hooks/useAuth.js";
import {
  IconGrid,
  IconTrend,
  IconClipboard,
  IconSearch,
  IconLogOut,
  IconUser,
  IconCoin
} from "./icons.jsx";
import logo from "../assets/logo-transparent.png";
import "../styles/components/sidebar.css";
import { ensureMockSeed } from "../mock/storage.js";

export function Sidebar({ open, onClose }) {
  const { user, signOut: authSignOut } = useAuth();
  const navigate = useNavigate();

  const email = user?.email || "";
  const roleDisplay = String(user?.role || "Farmer").charAt(0).toUpperCase() + String(user?.role || "Farmer").slice(1).toLowerCase();

  const navItems = [
    { to: ROUTES.farmerDashboard, label: "Dashboard", icon: <IconGrid className="navIco" /> },
    { to: ROUTES.farmerLands, label: "Registered Lands", icon: <IconClipboard className="navIco" /> },
    { to: ROUTES.farmerProjects, label: "Active Projects", icon: <IconTrend className="navIco" /> },
    { to: ROUTES.farmerMilestones, label: "Milestones", icon: <IconSearch className="navIco" /> },
    { to: ROUTES.farmerFunds, label: "Funds", icon: <IconCoin className="navIco" /> }
  ];

  function handleSignOut() {
    try {
      // Clear data as requested by user reset logic
      [
        "farmer_profile",
        "farmer_lands",
        "farmer_projects",
        "farmer_milestones",
        "farmer_funds",
        "farmer_transactions"
      ].forEach((k) => localStorage.removeItem(k));
      ensureMockSeed();
    } catch {
      // ignore
    }

    authSignOut();
    navigate(ROUTES.login);
  }

  return (
    <>
      <button
        type="button"
        className={`dashOverlay ${open ? "show" : ""}`}
        aria-label="Close navigation"
        onClick={onClose}
      />

      <aside className={`dashSidebar ${open ? "open" : ""}`} aria-label="Dashboard navigation">
        <div className="brandBlock">
          <div className="brandIcon" aria-hidden="true">
            <img className="brandLogo" src={logo} alt="" aria-hidden="true" />
          </div>
          <div className="brandText">
            <div className="brandName">Ceylon Harvest</div>
            <div className="brandSub">Capital</div>
          </div>
        </div>

        <div className="roleLabel">{roleDisplay}</div>

        <nav className="sideNav" aria-label="Role navigation">
          <ul className="sideList">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) => `sideLink ${isActive ? "active" : ""}`}
                >
                  {item.icon}
                  <span className="sideLabel">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sideBottom">
          <div className="sideUser">
            <IconUser className="sideUserIco" />
            <span className="sideUserEmail">{email || "—"}</span>
          </div>

          <button className="signOutBtn" type="button" onClick={handleSignOut}>
            <IconLogOut className="navIco" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
