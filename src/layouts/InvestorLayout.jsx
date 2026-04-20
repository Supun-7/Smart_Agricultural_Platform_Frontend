import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { ROUTES } from "../routes/routePaths.js";
import { Navbar } from "../components/Navbar.jsx";
import "../styles/pages/investor/investorLayout.css";
import logo from "../assets/logo.png";

const NAV_ITEMS = [
  { to: "/investor/dashboard", icon: "📊", label: "Dashboard" },
  { to: "/investor/opportunities", icon: "🌱", label: "Land Market" },
  { to: "/investor/portfolio", icon: "💼", label: "My Projects" },
  { to: "/investor/contracts", icon: "📋", label: "Contracts" },
  { to: "/investor/reports", icon: "🧾", label: "Reports" },
  { to: "/investor/return-risk", icon: "📈", label: "Return & Risk" },
];

export function InvestorLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

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

  const activeItem = NAV_ITEMS.find((item) => location.pathname.startsWith(item.to));
  const userInitial = user?.fullName?.charAt(0)?.toUpperCase() ?? "I";

  return (
    <div className="invShell">
      <Navbar />

      <div className="invMobileBar">
        <button
          className={"layoutHamburger" + (sidebarOpen ? " open" : "")}
          onClick={() => setSidebarOpen((open) => !open)}
          aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={sidebarOpen}
        >
          <span />
          <span />
          <span />
        </button>

        <div className="invMobileBarText">
          <span className="invMobileBarLabel">{activeItem?.label ?? "Investor Portal"}</span>
        </div>
      </div>

      <div
        className={"drawerOverlay" + (sidebarOpen ? " visible" : "")}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <div className="invBody">
        <aside
          className={"invSidebar" + (sidebarOpen ? " open" : "")}
          aria-label="Investor navigation"
        >
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
                  className={({ isActive }) => "invNavItem" + (isActive ? " active" : "")}
                >
                  <span className="invNavIcon">{icon}</span>
                  <span className="invNavLabel">{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="invSidebarBottom">
            <div className="invUserCard">
              <div className="invAvatar">{userInitial}</div>
              <div className="invUserInfo">
                <span className="invUserName">{user?.fullName || "Investor"}</span>
                <span className="invUserRole">Investor</span>
              </div>
            </div>
            <button className="btn btnGhost invSignOut" onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        </aside>

        <main className="invMain">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
