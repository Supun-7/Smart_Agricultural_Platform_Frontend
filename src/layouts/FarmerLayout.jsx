import { useTranslation } from "react-i18next";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { ROUTES } from "../routes/routePaths.js";
import { Navbar } from "../components/Navbar.jsx";
import { useState, useEffect } from "react";
import "../styles/pages/farmer/farmerLayout.css";

const NAV_ITEMS = [
  { to: ROUTES.farmerDashboard,       icon: "🏠", labelKey: "sidebar.dashboard"        },
  { to: ROUTES.farmerApplication,     icon: "📝", labelKey: "sidebar.registerLand"    },
  { to: ROUTES.farmerCrops,           icon: "🌾", labelKey: "sidebar.myCrops"         },
  { to: ROUTES.farmerMilestones,      icon: "📎", labelKey: "sidebar.uploadEvidence"  },
  { to: ROUTES.farmerContracts,       icon: "📋", labelKey: "sidebar.contracts"         },
  { to: ROUTES.farmerFinancialReport, icon: "📊", labelKey: "sidebar.financialReport" },
];

export function FarmerLayout() {
  const { t, i18n } = useTranslation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const toggleLanguage = () => {
    const nextLang = (i18n.language || '').startsWith('si') ? 'en' : 'si';
    i18n.changeLanguage(nextLang);
  };

  function handleSignOut() {
    signOut();
    navigate(ROUTES.login, { replace: true });
  }

  return (
    <div className="frmShell">
      <Navbar />

      <div style={{ display: "flex", paddingTop: "70px", flex: 1, width: "100%" }}>

        {sidebarOpen && (
          <div 
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
              background: "rgba(0,0,0,0.5)", zIndex: 140, backdropFilter: "blur(2px)"
            }}
          />
        )}

        {/* ── Sidebar ─────────────────────────────────────── */}
        <aside className={`frmSidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="frmSidebarTop">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: ".5rem" }}>
              {/* Role badge */}
              <span className="frmRoleBadge">🌾 {t("sidebar.portal")}</span>
              
              {/* Close button inside sidebar on mobile */}
              <button 
                className="closeSidebarBtn"
                onClick={() => setSidebarOpen(false)}
                style={{ background: "none", border: "none", color: "var(--muted)", fontSize: "1.4rem", cursor: "pointer", padding: "0 0.5rem" }}
              >
                ×
              </button>
            </div>

            {/* Nav links */}
            <nav className="frmNav">
              {NAV_ITEMS.map(({ to, icon, labelKey }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    "frmNavItem" + (isActive ? " active" : "")
                  }
                >
                  <span className="frmNavIcon">{icon}</span>
                  <span className="frmNavLabel">{t(labelKey)}</span>
                </NavLink>
              ))}

              {/* ── Divider ── */}
              <div style={{ margin: ".6rem 0 .3rem", borderTop: "1px solid #1a2e1e" }} />

              {/* ── 24/7 AI Support ── */}
              <NavLink
                to={ROUTES.farmerSupport}
                className={({ isActive }) =>
                  "frmNavItem" + (isActive ? " active" : "")
                }
              >
                <span className="frmNavIcon">💬</span>
                <span className="frmNavLabel">
                  <span style={{ display: "block", lineHeight: 1.3 }}>{t("sidebar.support247")}</span>
                  <span style={{
                    display: "block",
                    fontSize: ".65rem",
                    fontWeight: 500,
                    color: "var(--brand)",
                    letterSpacing: ".02em",
                    lineHeight: 1.2,
                  }}>
                    {t("sidebar.poweredByAI")}
                  </span>
                </span>
                <span style={{
                  marginLeft: "auto",
                  fontSize: ".58rem",
                  fontWeight: 700,
                  letterSpacing: ".05em",
                  background: "rgba(89,193,115,.12)",
                  border: "1px solid rgba(89,193,115,.28)",
                  color: "var(--brand)",
                  borderRadius: "20px",
                  padding: ".15rem .45rem",
                  flexShrink: 0,
                  lineHeight: 1.4,
                }}>
                  LIVE
                </span>
              </NavLink>
            </nav>
          </div>

          {/* ── User info + sign out ─────────────────────── */}
          <div className="frmSidebarBottom">
            <div className="frmUser">
              <div className="frmAvatar">
                {user?.fullName?.charAt(0)?.toUpperCase() ?? "F"}
              </div>
              <div className="frmUserInfo">
                <span className="frmUserName">{user?.fullName}</span>
                <span className="frmUserRole">{t("sidebar.role")}</span>
              </div>
            </div>
          {/* ── Language toggle ──────────────── */}
            <button
              className="frmLangToggle"
              onClick={toggleLanguage}
              title={(i18n.language || '').startsWith('si') ? 'Switch to English' : 'සිංහලට මාරු වන්න'}
            >
              <span className="frmLangIcon">🌐</span>
              <span className="frmLangLabel">
                {(i18n.language || '').startsWith('si') ? 'සිංහල' : 'English'}
              </span>
              <span className="frmLangCurrent">
                {(i18n.language || '').startsWith('si') ? 'සිං' : 'EN'}
              </span>
            </button>

            <button className="frmSignOut" onClick={handleSignOut}>
              {t("sidebar.signOut")}
            </button>
          </div>
        </aside>

        {/* ── Main content wrapper ────────────────────────── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          
          {/* Mobile Bar to toggle sidebar */}
          <div className="frmMobileBar">
            <button 
              onClick={() => setSidebarOpen(true)}
              style={{ background: "none", border: "none", color: "var(--text)", fontSize: "1.4rem", cursor: "pointer", padding: "0.2rem 0.6rem" }}
              aria-label="Toggle Sidebar"
            >
              ☰
            </button>
            <span className="frmMobileBarLabel">{t("sidebar.portal")}</span>
          </div>

          <main className="frmMain">
            <Outlet />
          </main>
        </div>

      </div>
    </div>
  );
}