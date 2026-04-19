import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { ROUTES } from "../routes/routePaths.js";
import { investorApi } from "../services/api.js";
import "../styles/components/navbar.css";
import logo from "../assets/logo.png";

function getDashboardRoute(role) {
  switch (role) {
    case "FARMER":       return "/farmer/dashboard";
    case "INVESTOR":     return "/investor/dashboard";
    case "ADMIN":        return "/admin/dashboard";
    case "SYSTEM_ADMIN": return "/admin/dashboard";
    case "AUDITOR":      return "/auditor/dashboard";
    default:             return ROUTES.gate;
  }
}

function fmtBalance(val, currency = "LKR") {
  return Number(val ?? 0).toLocaleString("en-LK", {
    style: "currency", currency, maximumFractionDigits: 0,
  });
}

export function Navbar() {
  const { user, token, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [profileOpen,  setProfileOpen]  = useState(false);
  const [walletBal,    setWalletBal]    = useState(null);
  const [walletCur,    setWalletCur]    = useState("LKR");

  // Fetch wallet balance for investors so it's always visible in the nav
  useEffect(() => {
    if (user?.role !== "INVESTOR" || !token) return;
    investorApi.getWallet(token)
      .then(w => { setWalletBal(Number(w.balance)); setWalletCur(w.currency ?? "LKR"); })
      .catch(() => {}); // silent — nav pill is a convenience, not critical
  }, [user, token]);

  function handleSignOut() {
    signOut();
    setMenuOpen(false);
    setProfileOpen(false);
    navigate(ROUTES.login, { replace: true });
  }

  const dashRoute = user ? getDashboardRoute(user.role) : ROUTES.gate;
  const initials  = user?.fullName
    ?.split(" ")
    .map(w => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "U";

  return (
    <header className="nav">
      <div className="navInner">

        {/* ── Brand ─────────────────────────────────── */}
        <Link className="brand" to={ROUTES.home} aria-label="Ceylon Harvest Capital"
          onClick={() => setMenuOpen(false)}>
          <img className="brandLogo" src={logo} alt="CHC" />
          <span className="brandText">Ceylon Harvest Capital</span>
        </Link>

        {/* ── Desktop nav ───────────────────────────── */}
        <nav className="navLinks" aria-label="Main navigation">
          <NavLink className="navLink" to={ROUTES.home} end>Home</NavLink>

          {user && (
            <NavLink className="navLink" to={dashRoute}>Dashboard</NavLink>
          )}

          {!user && (
            <>
              <NavLink className="navLink" to={ROUTES.login}>Login</NavLink>
              <NavLink className="navLink" to={ROUTES.register}>Register</NavLink>
            </>
          )}
        </nav>

        {/* ── Desktop right actions ──────────────────── */}
        <div className="navActions">

          {/* Wallet pill — investors only */}
          {user?.role === "INVESTOR" && (
            <button
              className="navWalletPill"
              onClick={() => navigate(ROUTES.investorWallet)}
              title="Go to Wallet"
            >
              <span>💰</span>
              <span className="navWalletAmount">
                {walletBal === null ? "…" : fmtBalance(walletBal, walletCur)}
              </span>
            </button>
          )}

          {!user ? (
            <>
              <Link className="btn btnGhost navBtnSm" to={ROUTES.login}>Login</Link>
              <Link className="btn navBtnSm" to={ROUTES.register}>Register</Link>
            </>
          ) : (
            <div className="profileWrap">
              <button
                className="profileBtn"
                onClick={() => setProfileOpen(o => !o)}
                aria-label="Profile menu"
              >
                <div className="profileAvatar">{initials}</div>
                <span className="profileName">{user.fullName?.split(" ")[0]}</span>
                <span className="profileChevron">{profileOpen ? "▲" : "▼"}</span>
              </button>

              {profileOpen && (
                <div className="profileDropdown">
                  <div className="profileDropdownHeader">
                    <div className="profileDropdownAvatar">{initials}</div>
                    <div>
                      <div className="profileDropdownName">{user.fullName}</div>
                      <div className="profileDropdownRole">{user.role}</div>
                    </div>
                  </div>
                  <div className="profileDropdownDivider" />
                  {user.role === "INVESTOR" && (
                    <>
                      <button
                        className="profileDropdownItem"
                        onClick={() => { setProfileOpen(false); navigate(ROUTES.investorWallet); }}
                      >
                        💰 Wallet {walletBal !== null && `· ${fmtBalance(walletBal, walletCur)}`}
                      </button>
                      <div className="profileDropdownDivider" />
                    </>
                  )}
                  <button
                    className="profileDropdownItem profileDropdownSignOut"
                    onClick={handleSignOut}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Hamburger (mobile) ─────────────────── */}
          <button
            className={"hamburger" + (menuOpen ? " open" : "")}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* ── Mobile menu ───────────────────────────── */}
      {menuOpen && (
        <div className="mobileMenu">
          <NavLink className="mobileLink" to={ROUTES.home} end
            onClick={() => setMenuOpen(false)}>
            🏠 Home
          </NavLink>

          {user && (
            <NavLink className="mobileLink" to={dashRoute}
              onClick={() => setMenuOpen(false)}>
              📊 Dashboard
            </NavLink>
          )}

          {/* Wallet link in mobile menu — investors only */}
          {user?.role === "INVESTOR" && (
            <NavLink className="mobileLink" to={ROUTES.investorWallet}
              onClick={() => setMenuOpen(false)}>
              💰 Wallet {walletBal !== null && `· ${fmtBalance(walletBal, walletCur)}`}
            </NavLink>
          )}

          {!user && (
            <>
              <NavLink className="mobileLink" to={ROUTES.login}
                onClick={() => setMenuOpen(false)}>
                🔑 Login
              </NavLink>
              <NavLink className="mobileLink" to={ROUTES.register}
                onClick={() => setMenuOpen(false)}>
                ✍️ Register
              </NavLink>
            </>
          )}

          {user && (
            <>
              <div className="mobileDivider" />
              <div className="mobileUser">
                <div className="profileAvatar">{initials}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: ".9rem" }}>{user.fullName}</div>
                  <div style={{ fontSize: ".75rem", color: "var(--muted)" }}>{user.role}</div>
                </div>
              </div>
              <button className="mobileLink mobileSignOut" onClick={handleSignOut}>
                🚪 Sign out
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
