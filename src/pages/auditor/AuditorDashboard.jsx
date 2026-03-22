import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { auditorApi } from "../../services/api";

// ── Stat Card ────────────────────────────────────────────────
function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: "#111611",
      border: `1px solid ${color}`,
      borderRadius: "10px",
      padding: "1.2rem 1.8rem",
      minWidth: "160px",
      textAlign: "center",
    }}>
      <div style={{ fontSize: "2rem", fontWeight: 700, color }}>{value}</div>
      <div style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "4px" }}>{label}</div>
    </div>
  );
}

// ── Status Badge ─────────────────────────────────────────────
function Badge({ status }) {
  const colors = {
    PENDING:  { bg: "#2a2200", text: "#f5c842" },
    VERIFIED: { bg: "#0d2b1a", text: "#59c173" },
    REJECTED: { bg: "#2b0d0d", text: "#ff5c7a" },
  };
  const c = colors[status] ?? colors.PENDING;
  return (
    <span style={{
      background: c.bg, color: c.text,
      borderRadius: "20px", padding: "2px 12px",
      fontSize: "0.78rem", fontWeight: 600,
    }}>
      {status}
    </span>
  );
}

// ── Document Button — opens public URL in new tab ────────────
function DocButton({ url, label }) {
  if (!url) return null;

  const ext      = url.split(".").pop().toLowerCase();
  const icon     = ext === "pdf" ? "📄" : "🖼️";
  const filename = url.split("/").pop();

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      style={{
        background: "transparent",
        border: "1px solid var(--brand)",
        color: "var(--brand)",
        borderRadius: "6px",
        padding: "6px 12px",
        fontSize: "0.8rem",
        marginRight: "8px",
        marginBottom: "8px",
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        textDecoration: "none",
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
      <span style={{ color: "var(--muted)", fontSize: "0.72rem" }}>
        ({filename})
      </span>
    </a>
  );
}

// ── Reject Modal ─────────────────────────────────────────────
function RejectModal({ onConfirm, onCancel }) {
  const [reason, setReason] = useState("");

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.75)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000,
    }}>
      <div style={{
        background: "#141a15",
        border: "1px solid var(--danger)",
        borderRadius: "12px",
        padding: "2rem",
        width: "100%", maxWidth: "440px",
      }}>
        <h3 style={{ color: "var(--danger)", marginTop: 0, marginBottom: "1rem" }}>
          Reject — Enter Reason
        </h3>
        <textarea
          rows={4}
          placeholder="Explain why this is being rejected..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          style={{
            width: "100%", borderRadius: "8px",
            background: "var(--bg)", color: "var(--text)",
            border: "1px solid var(--muted)", padding: "0.7rem",
            fontSize: "0.9rem", resize: "vertical",
            boxSizing: "border-box",
          }}
        />
        <div style={{ display: "flex", gap: "10px", marginTop: "1.2rem", justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={ghostBtn("var(--muted)")}>
            Cancel
          </button>
          <button
            onClick={() => {
              if (!reason.trim()) {
                alert("Please enter a rejection reason.");
                return;
              }
              onConfirm(reason.trim());
            }}
            style={ghostBtn("var(--danger)")}
          >
            Confirm Reject
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Detail Row ───────────────────────────────────────────────
function Detail({ label, value }) {
  return (
    <div>
      <span style={{ color: "var(--muted)" }}>{label}: </span>
      <span style={{ color: "var(--text)" }}>{value || "—"}</span>
    </div>
  );
}

// ── Button style helper ───────────────────────────────────────
function ghostBtn(color) {
  return {
    background: "transparent",
    border: `1px solid ${color}`,
    color,
    borderRadius: "8px",
    padding: "5px 14px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "0.85rem",
  };
}

// ── KYC Row ──────────────────────────────────────────────────
function KycRow({ kyc, onApprove, onReject }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      background: "#111611",
      border: "1px solid #1e2e20",
      borderRadius: "10px",
      marginBottom: "12px",
      overflow: "hidden",
    }}>
      {/* Summary */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        padding: "1rem 1.4rem",
        flexWrap: "wrap", gap: "10px",
      }}>
        <div>
          <div style={{ fontWeight: 600, color: "var(--text)", fontSize: "1rem" }}>
            {kyc.fullName}
          </div>
          <div style={{ fontSize: "0.82rem", color: "var(--muted)" }}>{kyc.email}</div>
          <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "2px" }}>
            Submitted: {new Date(kyc.submittedAt).toLocaleDateString()}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Badge status={kyc.status} />
          <button onClick={() => setExpanded(!expanded)} style={ghostBtn("var(--muted)")}>
            {expanded ? "Hide" : "View Details"}
          </button>
          <button onClick={() => onApprove(kyc.id)} style={ghostBtn("var(--brand)")}>
            ✓ Approve
          </button>
          <button onClick={() => onReject(kyc.id)} style={ghostBtn("var(--danger)")}>
            ✗ Reject
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div style={{
          borderTop: "1px solid #1e2e20",
          padding: "1rem 1.4rem",
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px 24px",
            fontSize: "0.85rem",
            marginBottom: "1rem",
          }}>
            <Detail label="Nationality" value={kyc.nationality} />
            <Detail label="ID Type"     value={kyc.idType} />
            <Detail label="ID Number"   value={kyc.idNumber} />
            <Detail label="Address"     value={kyc.address} />
          </div>
          <div>
            <div style={{ color: "var(--muted)", fontSize: "0.82rem", marginBottom: "8px" }}>
              Documents:
            </div>
            <DocButton url={kyc.idFrontUrl}     label="ID Front"       />
            <DocButton url={kyc.idBackUrl}      label="ID Back"        />
            <DocButton url={kyc.utilityBillUrl} label="Utility Bill"   />
            <DocButton url={kyc.bankStmtUrl}    label="Bank Statement" />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Farmer Row ───────────────────────────────────────────────
function FarmerRow({ farmer, onApprove, onReject }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      background: "#111611",
      border: "1px solid #1e2e20",
      borderRadius: "10px",
      marginBottom: "12px",
      overflow: "hidden",
    }}>
      {/* Summary */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        padding: "1rem 1.4rem",
        flexWrap: "wrap", gap: "10px",
      }}>
        <div>
          <div style={{ fontWeight: 600, color: "var(--text)", fontSize: "1rem" }}>
            {farmer.farmerName} {farmer.surname}
          </div>
          <div style={{ fontSize: "0.82rem", color: "var(--muted)" }}>{farmer.email}</div>
          <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "2px" }}>
            Submitted: {new Date(farmer.submittedAt).toLocaleDateString()}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <Badge status={farmer.status} />
          <button onClick={() => setExpanded(!expanded)} style={ghostBtn("var(--muted)")}>
            {expanded ? "Hide" : "View Details"}
          </button>
          <button onClick={() => onApprove(farmer.id)} style={ghostBtn("var(--brand)")}>
            ✓ Approve
          </button>
          <button onClick={() => onReject(farmer.id)} style={ghostBtn("var(--danger)")}>
            ✗ Reject
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div style={{
          borderTop: "1px solid #1e2e20",
          padding: "1rem 1.4rem",
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px 24px",
            fontSize: "0.85rem",
            marginBottom: "1rem",
          }}>
            <Detail label="NIC Number"    value={farmer.nicNumber} />
            <Detail label="Farm Location" value={farmer.farmLocation} />
            <Detail label="Land Size"     value={farmer.landSizeAcres ? `${farmer.landSizeAcres} acres` : "—"} />
            <Detail label="Crop Types"    value={farmer.cropTypes} />
          </div>
          <div>
            <div style={{ color: "var(--muted)", fontSize: "0.82rem", marginBottom: "8px" }}>
              Documents:
            </div>
            <DocButton url={farmer.nicFrontUrl} label="NIC Front" />
            <DocButton url={farmer.nicBackUrl}  label="NIC Back"  />
            {farmer.landPhotoUrls && farmer.landPhotoUrls.split(",").map((u, i) => (
              <DocButton key={i} url={u.trim()} label={`Land Photo ${i + 1}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ───────────────────────────────────────────
export default function AuditorDashboard() {
  const { token } = useAuth();

  const [kycList,      setKycList]      = useState([]);
  const [farmerList,   setFarmerList]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [activeTab,    setActiveTab]    = useState("kyc");
  const [toast,        setToast]        = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);

  // ── Load data ────────────────────────────────────────────
  async function loadDashboard() {
    setLoading(true);
    setError(null);
    try {
      const data = await auditorApi.getDashboard(token);
      setKycList(data.pendingKyc);
      setFarmerList(data.pendingFarmers);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadDashboard(); }, []);

  // ── Toast ────────────────────────────────────────────────
  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  // ── KYC actions ─────────────────────────────────────────
  async function handleApproveKyc(id) {
    try {
      await auditorApi.approveKyc(token, id);
      showToast("KYC approved successfully ✓");
      loadDashboard();
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  function handleRejectKyc(id) {
    setRejectTarget({ id, type: "kyc" });
  }

  // ── Farmer actions ───────────────────────────────────────
  async function handleApproveFarmer(id) {
    try {
      await auditorApi.approveFarmer(token, id);
      showToast("Farmer application approved ✓");
      loadDashboard();
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  function handleRejectFarmer(id) {
    setRejectTarget({ id, type: "farmer" });
  }

  // ── Modal confirm ────────────────────────────────────────
  async function handleRejectConfirm(reason) {
    try {
      if (rejectTarget.type === "kyc") {
        await auditorApi.rejectKyc(token, rejectTarget.id, reason);
        showToast("KYC rejected");
      } else {
        await auditorApi.rejectFarmer(token, rejectTarget.id, reason);
        showToast("Farmer application rejected");
      }
      setRejectTarget(null);
      loadDashboard();
    } catch (err) {
      showToast(err.message, "error");
      setRejectTarget(null);
    }
  }

  // ── Render ───────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      color: "var(--text)",
      padding: "2rem",
      fontFamily: "sans-serif",
    }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: "1.5rem", right: "1.5rem",
          background: toast.type === "error" ? "var(--danger)" : "var(--brand)",
          color: "#fff", borderRadius: "8px",
          padding: "0.8rem 1.6rem", fontWeight: 600,
          zIndex: 2000, boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        }}>
          {toast.msg}
        </div>
      )}

      {/* Reject modal */}
      {rejectTarget && (
        <RejectModal
          onConfirm={handleRejectConfirm}
          onCancel={() => setRejectTarget(null)}
        />
      )}

      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ color: "var(--brand)", margin: 0, fontSize: "1.8rem" }}>
          Auditor Dashboard
        </h1>
        <p style={{ color: "var(--muted)", marginTop: "6px" }}>
          Review pending KYC submissions and farmer applications
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ color: "var(--muted)", textAlign: "center", padding: "4rem" }}>
          Loading...
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div style={{
          background: "#2b0d0d",
          border: "1px solid var(--danger)",
          borderRadius: "10px",
          padding: "1.2rem 1.6rem",
          color: "var(--danger)",
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <span>Error: {error}</span>
          <button onClick={loadDashboard} style={ghostBtn("var(--danger)")}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Stat cards */}
          <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
            <StatCard label="Pending KYC"         value={kycList.length}    color="var(--brand)" />
            <StatCard label="Pending Farmer Apps" value={farmerList.length} color="#f5c842" />
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "1.5rem" }}>
            {[
              { key: "kyc",     label: `KYC Submissions (${kycList.length})` },
              { key: "farmers", label: `Farmer Applications (${farmerList.length})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  background:   activeTab === tab.key ? "var(--brand)" : "transparent",
                  color:        activeTab === tab.key ? "#0b0f0c"      : "var(--muted)",
                  border:       `1px solid ${activeTab === tab.key ? "var(--brand)" : "var(--muted)"}`,
                  borderRadius: "8px",
                  padding:      "6px 18px",
                  cursor:       "pointer",
                  fontWeight:   600,
                  fontSize:     "0.9rem",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* KYC Tab */}
          {activeTab === "kyc" && (
            <>
              {kycList.length === 0 ? (
                <div style={{ color: "var(--muted)", textAlign: "center", padding: "3rem" }}>
                  No pending KYC submissions 🎉
                </div>
              ) : (
                kycList.map((kyc) => (
                  <KycRow
                    key={kyc.id}
                    kyc={kyc}
                    onApprove={handleApproveKyc}
                    onReject={handleRejectKyc}
                  />
                ))
              )}
            </>
          )}

          {/* Farmers Tab */}
          {activeTab === "farmers" && (
            <>
              {farmerList.length === 0 ? (
                <div style={{ color: "var(--muted)", textAlign: "center", padding: "3rem" }}>
                  No pending farmer applications 🎉
                </div>
              ) : (
                farmerList.map((farmer) => (
                  <FarmerRow
                    key={farmer.id}
                    farmer={farmer}
                    onApprove={handleApproveFarmer}
                    onReject={handleRejectFarmer}
                  />
                ))
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}