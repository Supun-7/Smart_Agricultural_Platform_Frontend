import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { ROUTES } from "../routes/routePaths.js";
import "../styles/components/navbar.css";
import logo from "../assets/logo.png";

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    signOut();
    navigate(ROUTES.login, { replace: true }); 

  }

  return (
    <header className="nav">
      <div className="container navInner">
        <Link className="brand" to={ROUTES.home} aria-label="Ceylon Harvest Capital">
          <img className="brandLogo" src={logo} alt="CHC" />
          <span className="brandText">Ceylon Harvest Capital</span>
        </Link>

        <nav className="navActions" aria-label="Top navigation">
          {!user ? (
            <>
              <Link className="btn btnGhost" to={ROUTES.login}>Login</Link>
              <Link className="btn" to={ROUTES.register}>Register</Link>
            </>
          ) : (
            <>
              <span className="navGreet">👋 {user.fullName || user.email}</span>
              <button className="btn" onClick={handleSignOut} type="button">Sign out</button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
