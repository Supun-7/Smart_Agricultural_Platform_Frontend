import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "../routes/routePaths.js";
import { useAuth } from "../hooks/useAuth.js";
import { IconUser, IconLogOut } from "./icons.jsx";
import "../styles/components/dashboardHeader.css";
import { ensureMockSeed } from "../mock/storage.js";

export function DashboardHeader({ onOpenNav }) {
  const { user, signOut: authSignOut } = useAuth();
  const navigate = useNavigate();

  const email = user?.email || "Profile";
  const role = String(user?.role || "Farmer").toLowerCase();
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);


  function handleReset() {
    try {
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
    <header className="dashHeader">
      <button className="iconBtn dashHamburger" type="button" onClick={onOpenNav} aria-label="Open navigation">
        <span className="iconBars" aria-hidden="true" />
      </button>

      <Link className="dashBrand" to={ROUTES.farmerDashboard} aria-label="Ceylon Harvest Capital">
        <span className="dashBrandName">Ceylon Harvest Capital</span>
        <span className="dashBrandRole">{roleLabel} Portal</span>
      </Link>

      <details className="profileMenu">
        <summary className="profileBtn" aria-label="Profile menu">
          <IconUser className="profileIco" />
          <span className="profileEmail">{email}</span>
          <span className="profileCaret" aria-hidden="true" />
        </summary>

        <div className="profileDropdown" role="menu">
          <div className="profileMeta">
            <div className="profileMetaLabel">Signed in as</div>
            <div className="profileMetaValue">{email}</div>
            <div className="profileMetaSub">Role: {roleLabel}</div>
          </div>

          <Link className="profileAction" to={ROUTES.farmerProfile} role="menuitem">
            <IconUser className="navIco" />
            <span>Profile</span>
          </Link>

          

          <Link className="profileAction" to={ROUTES.farmerReport} role="menuitem">
            <span style={{ width: 18, display: "inline-block" }} aria-hidden="true">🧾</span>
            <span>Report (PDF)</span>
          </Link>
          
        </div>
      </details>
    </header>
  );
}
