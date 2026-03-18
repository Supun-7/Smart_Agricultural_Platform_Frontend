import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../services/api.js";
import { ROUTES } from "../routes/routePaths.js";
import { ErrorBanner } from "../components/ErrorBanner.jsx";
import "../styles/pages/auth.css";

const ROLES = [
  { value: "FARMER",   label: "Farmer" },
  { value: "INVESTOR", label: "Investor" },
];

export default function Register() {
  const [fullName,   setFullName]   = useState("");
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
    setDone(false);

    try {
      // authApi.register instead of registerUser
      await authApi.register(fullName, email, password, role);

      setDone(true);

      // Redirect to login after short delay
      // User can see the success message
      setTimeout(() => navigate(ROUTES.login), 1200);

    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="authWrap">
      <div className="authCard">
        <h2 className="authTitle">Register</h2>

        <ErrorBanner message={error} />

        {done && (
          <div className="successBanner">
            Account created! Redirecting to login…
          </div>
        )}

        <form className="form" onSubmit={onSubmit}>

          <label className="field">
            <span>Full name</span>
            <input
              className="input"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </label>

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
              minLength={6}
              autoComplete="new-password"
            />
          </label>

          <label className="field">
            <span>I am a</span>
            <select
              className="input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>

          <button
            className="btn btnBlock"
            disabled={submitting || done}
            type="submit"
          >
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