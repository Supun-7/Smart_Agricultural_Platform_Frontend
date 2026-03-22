import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../services/api.js";
import { useAuth } from "../hooks/useAuth.js";
import { ROUTES } from "../routes/routePaths.js";

// ── This page handles the Google OAuth redirect ───────────────
// Flow:
// 1. User clicks "Continue with Google" on Login/Register
// 2. We redirect to Google's OAuth URL
// 3. Google redirects back to /auth/callback?code=...
// 4. This page picks up the code, sends to backend
// 5. Backend exchanges code for user info, returns JWT
// 6. We store JWT and redirect to gate

export default function GoogleAuthCallback() {
  const [status, setStatus] = useState("Signing you in with Google…");
  const [error,  setError]  = useState("");
  const { signIn } = useAuth();
  const navigate   = useNavigate();

  useEffect(() => {
    const params    = new URLSearchParams(window.location.search);
    const code      = params.get("code");
    const roleState = params.get("state"); // we pass role in state param

    if (!code) {
      setError("No authorization code received from Google.");
      return;
    }

    setStatus("Verifying with Google…");

    authApi.googleCallback(code, roleState)
      .then(result => {
        signIn({ token: result.token, ...result.user });
        navigate(ROUTES.gate, { replace: true });
      })
      .catch(err => {
        setError(err.message || "Google sign-in failed. Please try again.");
      });
  }, []);

  return (
    <section style={{
      minHeight: "60vh", display: "flex", alignItems: "center",
      justifyContent: "center", flexDirection: "column", gap: "1rem"
    }}>
      {!error ? (
        <>
          <div style={{
            width: 40, height: 40,
            border: "3px solid rgba(255,255,255,.1)",
            borderTop: "3px solid #59c173",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }} />
          <p style={{ color: "var(--muted)", fontSize: ".95rem" }}>{status}</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </>
      ) : (
        <div style={{
          background: "rgba(255,92,122,.1)",
          border: "1px solid rgba(255,92,122,.3)",
          borderRadius: 12, padding: "1.5rem 2rem",
          color: "#ff5c7a", textAlign: "center", maxWidth: 400
        }}>
          <p style={{ marginBottom: "1rem" }}>⚠️ {error}</p>
          <a href="/login" style={{
            color: "#59c173", textDecoration: "underline", fontSize: ".9rem"
          }}>
            Back to login
          </a>
        </div>
      )}
    </section>
  );
}