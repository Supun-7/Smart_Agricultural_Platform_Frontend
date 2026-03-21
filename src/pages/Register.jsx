import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../services/api.js";
import { useAuth } from "../hooks/useAuth.js";
import { ROUTES } from "../routes/routePaths.js";
import "../styles/pages/auth.css";

const ROLES = [
  { value: "FARMER",   label: "Farmer" },
  { value: "INVESTOR", label: "Investor" },
];

export default function Register() {
  const [firstName,  setFirstName]  = useState("");
  const [lastName,   setLastName]   = useState("");
  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");
  const [role,       setRole]       = useState("FARMER");
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");
  const [done,       setDone]       = useState(false);

  const navigate = useNavigate();

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
      <div className="authCard">
        <h2 className="authTitle">Create Account</h2>

        {error && <div className="authError">{error}</div>}
        {done  && <div className="successBanner">Account created! Redirecting…</div>}

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