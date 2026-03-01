import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { ROUTES } from "../routes/routePaths.js";
import { IconUser, IconLogOut } from "./icons.jsx";
import "../styles/components/dashboardHeader.css";
import { ensureMockSeed, loadProfile } from "../mock/storage.js";

export function DashboardHeader({ onOpenNav }) {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const profile = loadProfile();
  const title = "Investor";

  function handleLogout() {
    signOut();
    navigate(ROUTES.home);
  }

  return (
    <header className="dashHeader">
      {/* Mobile: hamburger */}
      <button
        className="iconBtn dashHamburger"
        type="button"
        onClick={onOpenNav}
        aria-label="Open navigation"
      >
        <span className="iconBars" aria-hidden="true" />
      </button>

      <Link className="dashBrand" to={ROUTES.dashboard} aria-label="Ceylon Harvest Capital">
        <span className="dashBrandName">Ceylon Harvest Capital</span>
        <span className="dashBrandRole">{title} Portal</span>
      </Link>

      <details className="profileMenu">
        <summary className="profileBtn" aria-label="Profile menu">
          <IconUser className="profileIco" />
          <span className="profileEmail">{profile.email || "Profile"}</span>
          <span className="profileCaret" aria-hidden="true" />
        </summary>

        <div className="profileDropdown" role="menu">
          <div className="profileMeta">
            <div className="profileMetaLabel">Signed in as</div>
            <div className="profileMetaValue">{profile.email || "—"}</div>
            <div className="profileMetaSub">Role: {title}</div>
          </div>

          <Link className="profileAction" to={ROUTES.profile} role="menuitem">
            <IconUser className="navIco" />
            <span>Profile</span>
          </Link>

          <button className="profileAction" type="button" onClick={handleLogout} role="menuitem">
            <IconLogOut className="navIco" />
            <span>Log out</span>
          </button>
        </div>
      </details>
    </header>
  );
}
