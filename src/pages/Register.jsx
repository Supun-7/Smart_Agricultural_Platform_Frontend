import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../services/api.js";
import { useAuth } from "../hooks/useAuth.js";
import { ROUTES } from "../routes/routePaths.js";
import "../styles/pages/auth.css";

const ROLES = [
  { value: "FARMER",   label: "Farmer"   },
  { value: "INVESTOR", label: "Investor" },
];

// ── Build Google OAuth URL ────────────────────────────────────
function buildGoogleAuthUrl(role) {
  const clientId    = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const redirectUri = `${window.location.origin}/auth/callback`;
  const scope       = "email profile openid";

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: "code",
    scope:         scope,
    access_type:   "offline",
    prompt:        "select_account",
    state:         role,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

// ── Role Picker Modal ─────────────────────────────────────────
function RolePickerModal({ onSelect, onClose }) {
  return (
    <div className="roleModalOverlay" onClick={onClose}>
      <div className="roleModalCard" onClick={e => e.stopPropagation()}>
        <h3 className="roleModalTitle">Who are you?</h3>
        <p className="roleModalSub">
          Choose your role before signing up with Google:
        </p>
        <div className="roleModalBtns">
          <button className="roleModalBtn" onClick={() => onSelect("INVESTOR")}>
            <span className="roleModalIcon">💼</span>
            <div>
              <span className="roleModalLabel">I am an Investor</span>
              <span className="roleModalHint">I want to fund farms and earn returns</span>
            </div>
          </button>
          <button className="roleModalBtn" onClick={() => onSelect("FARMER")}>
            <span className="roleModalIcon">🌾</span>
            <div>
              <span className="roleModalLabel">I am a Farmer</span>
              <span className="roleModalHint">I want to register my farm and get funded</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Register() {
  const [firstName,  setFirstName]  = useState("");
  const [lastName,   setLastName]   = useState("");
  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");
  const [role,       setRole]       = useState("FARMER");
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");
  const [done,       setDone]       = useState(false);
  const [showRolePicker, setShowRolePicker] = useState(false);

  const navigate = useNavigate();

  // ── Google button — show role picker first ────────────────
  function handleGoogleClick() {
    setShowRolePicker(true);
  }

  // ── Role picked — redirect to Google with role in state ───
  function handleRolePicked(selectedRole) {
    setShowRolePicker(false);
    window.location.href = buildGoogleAuthUrl(selectedRole);
  }

  // ── Normal registration ───────────────────────────────────
  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await authApi.register({
        fullName: `${firstName} ${lastName}`,
        email,
        password,
        role,
      });
      setDone(true);
      setTimeout(() => navigate(ROUTES.login), 1200);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <section className="authWrap">

      {showRolePicker && (
        <RolePickerModal
          onSelect={handleRolePicked}
          onClose={() => setShowRolePicker(false)}
        />
      )}

      <div className="authCard">
        <h2 className="authTitle">Create Account</h2>

        {error && <div className="authError">{error}</div>}
        {done  && <div className="successBanner">Account created! Redirecting…</div>}

        {/* ── Google button ─────────────────────────────── */}
        <button
          className="googleBtn"
          onClick={handleGoogleClick}
          disabled={submitting}
          type="button"
        >
          <svg className="googleIcon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign up with Google
        </button>

        {/* ── Divider ───────────────────────────────────── */}
        <div className="authDivider">
          <span className="authDividerLine" />
          <span className="authDividerText">or register with email</span>
          <span className="authDividerLine" />
        </div>

        {/* ── Email registration form ───────────────────── */}
        <form className="form" onSubmit={onSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <label className="field">
              <span>First Name</span>
              <input className="input" type="text" placeholder="e.g. Nimal"
                value={firstName} onChange={e => setFirstName(e.target.value)} required />
            </label>
            <label className="field">
              <span>Last Name</span>
              <input className="input" type="text" placeholder="e.g. Silva"
                value={lastName} onChange={e => setLastName(e.target.value)} required />
            </label>
          </div>
          <label className="field">
            <span>Email</span>
            <input className="input" type="email" placeholder="you@email.com"
              value={email} onChange={e => setEmail(e.target.value)}
              required autoComplete="email" />
          </label>
          <label className="field">
            <span>Password</span>
            <input className="input" type="password" placeholder="Min. 6 characters"
              value={password} onChange={e => setPassword(e.target.value)}
              required minLength={6} autoComplete="new-password" />
          </label>
          <label className="field">
            <span>I am a</span>
            <select className="input" value={role} onChange={e => setRole(e.target.value)}>
              {ROLES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </label>
          <button className="btn btnBlock" disabled={submitting || done} type="submit">
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="authHint">
          Already have an account? <Link to={ROUTES.login}>Login</Link>
        </p>
      </div>
    </section>
  );
}