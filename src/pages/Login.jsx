import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { authApi } from "../services/api.js";
import { useAuth } from "../hooks/useAuth.js";
import { ROUTES } from "../routes/routePaths.js";
import { ErrorBanner } from "../components/ErrorBanner.jsx";
import "../styles/pages/auth.css";

export default function Login() {
  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");

  const { signIn }  = useAuth();
  const navigate    = useNavigate();
  const location    = useLocation();

  // If they were redirected here from a protected page,
  // send them back there after login. Otherwise go to gate.
  const from = location.state?.from?.pathname ?? ROUTES.gate;

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      // result = { token: "...", user: { userId, fullName, email, role, verificationStatus } }
      const result = await authApi.login(email, password);

      // Store token + user together in one session object
      // Now user.token is available everywhere via useAuth()
      signIn({
        token: result.token,
        ...result.user,
      });

      // Go to gate — gate decides which dashboard to show
      navigate(from, { replace: true });

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