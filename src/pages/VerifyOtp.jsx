import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { authApi } from "../services/api.js";
import { useAuth } from "../hooks/useAuth.js";
import { ROUTES } from "../routes/routePaths.js";
import { ErrorBanner } from "../components/ErrorBanner.jsx";
import "../styles/pages/auth.css";

const OTP_EXPIRY_SECONDS = 300; // 5 minutes — matches backend otp.expiry.minutes=5
const MAX_RESENDS        = 3;   // matches backend otp.max.resend.count=3

export default function VerifyOtp() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { signIn } = useAuth();

  // Email and destination passed from Login page
  const email = location.state?.email ?? null;
  const from  = location.state?.from  ?? ROUTES.gate;

  const [otp,         setOtp]         = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const [resending,   setResending]   = useState(false);
  const [error,       setError]       = useState("");
  const [success,     setSuccess]     = useState("");
  const [secondsLeft, setSecondsLeft] = useState(OTP_EXPIRY_SECONDS);
  const [resendCount, setResendCount] = useState(0);

  const timerRef = useRef(null);

  // If someone lands here without email in state, send them back to login
  useEffect(() => {
    if (!email) {
      navigate(ROUTES.login, { replace: true });
    }
  }, [email, navigate]);

  // Countdown timer
  useEffect(() => {
    if (secondsLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [secondsLeft]);

  function formatTime(secs) {
    const m = String(Math.floor(secs / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${m}:${s}`;
  }

  // AC-3: Submit OTP
  async function onSubmit(e) {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      // POST /api/users/verify-otp → returns { token, user }
      const result = await authApi.verifyOtp(email, otp);
      // AC-7, AC-8: OTP valid → sign in with JWT
      signIn({ token: result.token, ...result.user });
      navigate(from, { replace: true });
    } catch (err) {
      // AC-4: Show error for invalid/expired OTP
      setError(err.message || "Invalid or expired OTP. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // AC-5: Resend OTP with rate limiting
  async function handleResend() {
    if (resendCount >= MAX_RESENDS) {
      setError("Maximum resend limit reached. Please wait and try again later.");
      return;
    }
    setResending(true);
    setError("");
    setSuccess("");
    try {
      await authApi.resendOtp(email);
      setResendCount((c) => c + 1);
      setSecondsLeft(OTP_EXPIRY_SECONDS); // reset timer
      setOtp("");
      setSuccess("A new OTP has been sent to your email.");
    } catch (err) {
      // AC-5: Backend returns 429 when rate limit is exceeded
      setError(err.message || "Too many requests. Please wait before resending.");
    } finally {
      setResending(false);
    }
  }

  if (!email) return null; // Guard while redirect happens

  return (
    <section className="authWrap">
      <div className="authCard">
        <h2 className="authTitle">Verify Your Email</h2>

        <p style={{ textAlign: "center", color: "var(--text-muted, #6b7280)", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
          We sent a 6-digit code to <strong>{email}</strong>.
          Enter it below to complete sign-in.
        </p>

        {/* AC-4: Error banner */}
        <ErrorBanner message={error} />

        {/* Success message after resend */}
        {success && (
          <div className="successBanner" style={{ marginBottom: "1rem" }}>
            {success}
          </div>
        )}

        {/* AC-2: Countdown timer */}
        <p style={{ textAlign: "center", fontSize: "0.9rem", marginBottom: "1.25rem" }}>
          {secondsLeft > 0 ? (
            <>Code expires in <strong style={{ color: secondsLeft < 60 ? "#ef4444" : "inherit" }}>{formatTime(secondsLeft)}</strong></>
          ) : (
            <span style={{ color: "#ef4444" }}>OTP has expired. Please request a new one.</span>
          )}
        </p>

        {/* OTP input form */}
        <form className="form" onSubmit={onSubmit}>
          <label className="field">
            <span>One-Time Password (OTP)</span>
            <input
              className="input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              autoComplete="one-time-code"
              autoFocus
              disabled={secondsLeft === 0 || submitting}
              style={{ letterSpacing: "0.35em", fontSize: "1.4rem", textAlign: "center" }}
            />
          </label>

          {/* AC-3: Verify button */}
          <button
            className="btn btnBlock"
            type="submit"
            disabled={submitting || secondsLeft === 0 || otp.length !== 6}
          >
            {submitting ? "Verifying…" : "Verify OTP"}
          </button>
        </form>

        {/* AC-5: Resend option */}
        <div style={{ textAlign: "center", marginTop: "1.25rem" }}>
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || resendCount >= MAX_RESENDS}
            style={{
              background: "none",
              border: "none",
              color: resendCount >= MAX_RESENDS ? "#9ca3af" : "var(--primary, #16a34a)",
              cursor: resendCount >= MAX_RESENDS ? "not-allowed" : "pointer",
              fontSize: "0.9rem",
              textDecoration: "underline",
              padding: 0,
            }}
          >
            {resending ? "Sending…" : resendCount >= MAX_RESENDS ? "Resend limit reached" : "Resend OTP"}
          </button>
          {resendCount > 0 && resendCount < MAX_RESENDS && (
            <span style={{ fontSize: "0.8rem", color: "#6b7280", marginLeft: "0.5rem" }}>
              ({MAX_RESENDS - resendCount} resend{MAX_RESENDS - resendCount !== 1 ? "s" : ""} left)
            </span>
          )}
        </div>

        <p className="authHint" style={{ marginTop: "1.5rem" }}>
          Wrong account? <Link to={ROUTES.login}>Back to Login</Link>
        </p>
      </div>
    </section>
  );
}