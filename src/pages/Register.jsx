import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/userService.js";
import { ROUTES } from "../routes/routePaths.js";
import { ErrorBanner } from "../components/ErrorBanner.jsx";
import "../styles/pages/auth.css";

const ROLES = [
  { value: "farmer", label: "Farmer" },
  { value: "investor", label: "Investor" },
  { value: "admin", label: "Admin" },
  { value: "auditor", label: "Auditor" },
];

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("farmer");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setDone(false);

    const { error: err } = await registerUser({ fullName, email, password, role });

    if (err) {
      setError(err.message);
      setSubmitting(false);
      return;
    }

    setDone(true);
    setTimeout(() => navigate(ROUTES.login), 1200);
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
            <span>Role</span>
            <select
              className="input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              {ROLES.map((r) => (
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
