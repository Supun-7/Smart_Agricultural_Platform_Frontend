import { useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import { authApi } from "../../services/api.js";
import "../../styles/pages/admin/dashboard.css";

export default function CreateUserPage() {
  const { token } = useAuth();

  const [firstName,  setFirstName]  = useState("");
  const [lastName,   setLastName]   = useState("");
  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [role,       setRole]       = useState("AUDITOR");
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState("");
  const [error,      setError]      = useState("");

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPwd) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setSubmitting(true);
    try {
      await authApi.registerAsAdmin(token, {
        fullName: `${firstName} ${lastName}`,
        email,
        password,
        role,
      });
      setSuccess(`${role} account created successfully for ${email}`);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setConfirmPwd("");
      setRole("AUDITOR");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="adminPage">

      {/* Header */}
      <div className="adminPageHeader">
        <div>
          <span className="adminPageEyebrow">User Management</span>
          <h1 className="adminPageTitle">Create Admin or Auditor</h1>
          <p className="adminPageSub">
            Only admins can create these account types.
            Passwords are securely hashed before storage.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="adminSection">
        <div className="adminTableWrap">
          <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>

            {/* Name row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="adminFormField">
                <label className="adminFormLabel">First Name</label>
                <input
                  className="input"
                  type="text"
                  placeholder="e.g. Nimal"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="adminFormField">
                <label className="adminFormLabel">Last Name</label>
                <input
                  className="input"
                  type="text"
                  placeholder="e.g. Silva"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email + Role row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "1rem", alignItems: "end" }}>
              <div className="adminFormField">
                <label className="adminFormLabel">Email Address</label>
                <input
                  className="input"
                  type="email"
                  placeholder="e.g. auditor@ceylonharvest.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="adminFormField">
                <label className="adminFormLabel">Role</label>
                <select
                  className="input"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  style={{ minWidth: 140 }}
                >
                  <option value="AUDITOR">Auditor</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>

            {/* Password row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="adminFormField">
                <label className="adminFormLabel">Password</label>
                <input
                  className="input"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="adminFormField">
                <label className="adminFormLabel">Confirm Password</label>
                <input
                  className="input"
                  type="password"
                  placeholder="Repeat password"
                  value={confirmPwd}
                  onChange={e => setConfirmPwd(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Role info note */}
            <div style={{
              padding: ".75rem 1rem",
              background: "rgba(89,193,115,.07)",
              border: "1px solid rgba(89,193,115,.2)",
              borderRadius: "var(--radius)",
              fontSize: ".82rem",
              color: "var(--muted)",
              lineHeight: 1.5,
            }}>
              {role === "AUDITOR"
                ? "🔍 Auditors can view and approve/reject KYC and farmer applications. They cannot manage other users."
                : "⚙️ Admins have full platform access including creating other admin and auditor accounts."}
            </div>

            {/* Error */}
            {error && (
              <div style={{
                padding: ".75rem 1rem",
                background: "rgba(255,92,122,.1)",
                border: "1px solid rgba(255,92,122,.3)",
                borderRadius: "var(--radius)",
                color: "var(--danger)",
                fontSize: ".85rem",
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div style={{
                padding: ".75rem 1rem",
                background: "rgba(89,193,115,.1)",
                border: "1px solid rgba(89,193,115,.3)",
                borderRadius: "var(--radius)",
                color: "var(--brand)",
                fontSize: ".85rem",
              }}>
                ✅ {success}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                className="btn"
                type="submit"
                disabled={submitting}
                style={{
                  background: "var(--brand)",
                  color: "#0b0f0c",
                  fontWeight: 700,
                  padding: ".6rem 1.6rem",
                  opacity: submitting ? .6 : 1,
                }}
              >
                {submitting
                  ? "Creating account…"
                  : `Create ${role === "AUDITOR" ? "Auditor" : "Admin"} Account`}
              </button>
            </div>

          </form>
        </div>
      </div>

    </div>
  );
}