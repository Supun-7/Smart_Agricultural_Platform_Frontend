import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { ROUTES } from "../routes/routePaths.js";
import {
  IconLeaf,
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

export function Sidebar({ open, onClose }) {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const roleLabel = "Investor";
  const email = user?.email || "";

  const navItems = [
    { to: ROUTES.dashboard, label: "Dashboard", icon: <IconGrid className="navIco" /> },
    { to: ROUTES.investments, label: "Investments", icon: <IconTrend className="navIco" /> },
    { to: ROUTES.projects, label: "Projects", icon: <IconClipboard className="navIco" /> },
    { to: ROUTES.wallet, label: "Wallet", icon: <IconCoin className="navIco" /> },
    { to: ROUTES.transactions, label: "Transactions", icon: <IconSearch className="navIco" /> }
  ];

  function handleSignOut() {
    signOut();
    navigate(ROUTES.home);
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
            <IconLeaf className="brandLeaf" />
          </div>
          <div className="brandText">
            <div className="brandName">Ceylon Harvest</div>
            <div className="brandSub">Capital</div>
          </div>

          {/* Hidden asset prefetch (transparent logo) */}
          <img className="brandHiddenLogo" src={logo} alt="" aria-hidden="true" />
        </div>

        <div className="roleLabel">{roleLabel}</div>

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
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
