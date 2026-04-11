import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { authApi } from "../services/api.js";
import { useAuth } from "../hooks/useAuth.js";
import { ROUTES } from "../routes/routePaths.js";
import { ErrorBanner } from "../components/ErrorBanner.jsx";
import "../styles/pages/auth.css";

// ── Build Google OAuth URL ────────────────────────────────────
function buildGoogleAuthUrl(role) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const redirectUri = `${window.location.origin}/auth/callback`;
  const scope = "email profile openid";

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scope,
    access_type: "offline",
    prompt: "select_account",
    state: role, // pass role through state so callback knows it
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showRolePicker, setShowRolePicker] = useState(false);

  const navigate = useNavigate();        // ← make sure this line is here
  const { } = useAuth();  // or simply delete this line entirely since it's no longer needed in Login.jsx  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname ?? ROUTES.gate;

  // ── Google button clicked ─────────────────────────────────
  // For Login we don't know if user is new or existing
  // so we redirect with role=null — backend handles existing users
  // For new users they'll still get INVESTOR by default on login page
  function handleGoogleLogin() {
    window.location.href = buildGoogleAuthUrl("INVESTOR");
  }

  // ── Normal email/password login ───────────────────────────
  // REPLACE the entire onSubmit function with this:
  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      // Step 1: Validate credentials — backend sends OTP, returns { message, email }
      await authApi.login(email, password);
      // Redirect to OTP verification page, passing email in navigation state
      navigate(ROUTES.verifyOtp, { state: { email, from } });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="authWrap">
      <div className="authCard">
        <h2 className="authTitle">Login</h2>
        <ErrorBanner message={error} />

        {/* ── Google button ─────────────────────────────── */}
        <button
          className="googleBtn"
          onClick={handleGoogleLogin}
          type="button"
        >
          <svg className="googleIcon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        {/* ── Divider ───────────────────────────────────── */}
        <div className="authDivider">
          <span className="authDividerLine" />
          <span className="authDividerText">or sign in with email</span>
          <span className="authDividerLine" />
        </div>

        {/* ── Email / password form ─────────────────────── */}
        <form className="form" onSubmit={onSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          <button className="btn btnBlock" disabled={submitting} type="submit">
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="authHint">
          New here? <Link to={ROUTES.register}>Create an account</Link>
        </p>
      </div>
    </section>
  );
}