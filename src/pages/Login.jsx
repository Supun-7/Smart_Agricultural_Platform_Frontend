import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/userService.js";
import { useAuth } from "../hooks/useAuth.js";
import { ROUTES } from "../routes/routePaths.js";
import { ErrorBanner } from "../components/ErrorBanner.jsx";
import "../styles/pages/auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { signIn } = useAuth();
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const { data, error: err } = await loginUser(email, password);

    if (err) {
      setError(err.message);
      setSubmitting(false);
      return;
    }

    // data is the User object returned by backend
    signIn(data);
<<<<<<< HEAD
    navigate(ROUTES.home);
=======
    navigate(ROUTES.farmerDashboard);
>>>>>>> 308dde4 (CHC-29: Farmer Dashboard Layout UI)
  }

  return (
    <section className="authWrap">
      <div className="authCard">
        <h2 className="authTitle">Login</h2>
        <ErrorBanner message={error} />

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
