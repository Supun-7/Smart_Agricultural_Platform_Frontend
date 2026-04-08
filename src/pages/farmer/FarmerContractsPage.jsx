import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import { farmerApi } from "../../services/api.js";
import "../../styles/pages/farmer/farmerContracts.css";

/**
 * FarmerContractsPage — ගොවි ගිවිසුම් පිටුව
 *
 * Displays investment contracts received by the farmer, explained simply
 * in Sinhala. No blockchain links are shown — the farmer is told the
 * contract is immutable in plain language.
 */

function formatCurrency(value) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

function sinhalaBadge(status) {
  const map = {
    ACTIVE:    { label: "ක්‍රියාකාරී",   bg: "rgba(89,193,115,.14)", color: "#59c173" },
    COMPLETED: { label: "සම්පූර්ණ",       bg: "rgba(99,179,237,.14)", color: "#63b3ed" },
    PENDING:   { label: "පෙනී සිටිමින්",  bg: "rgba(255,193,7,.12)",  color: "#ffc107" },
    CANCELLED: { label: "අවලංගු",         bg: "rgba(255,92,122,.12)", color: "#ff5c7a" },
  };
  const s = map[status] || map.PENDING;
  return (
    <span className="fcBadge" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("si-LK", { year: "numeric", month: "long", day: "numeric" });
}

export default function FarmerContractsPage() {
  const { token } = useAuth();

  const [contracts, setContracts] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [expanded,  setExpanded]  = useState(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const data = await farmerApi.getContracts(token);
      setContracts(data.contracts || []);
    } catch (err) {
      setError(err.message || "ගිවිසුම් පූරණය කිරීමට නොහැකි විය.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="fcPage">
        <div className="fcCenter">
          <div className="fcSpinner" />
          <p className="fcMuted">ගිවිසුම් පූරණය වෙමින් පවතී…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fcPage">
        <div className="fcCenter">
          <span style={{ fontSize: "2rem" }}>⚠️</span>
          <p className="fcMuted">{error}</p>
          <button className="fcRetryBtn" onClick={load}>නැවත උත්සාහ කරන්න</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fcPage">

      {/* ── Page title ── */}
      <div className="fcHeader">
        <div className="fcHeaderIcon">📜</div>
        <div>
          <h1 className="fcTitle">මගේ ගිවිසුම්</h1>
          <p className="fcSubtitle">
            ඔබේ ඉඩමට ලැබුණු ආයෝජන ගිවිසුම් මෙහිදී බලාගත හැකිය.
          </p>
        </div>
        <span className="fcCount">
          ගිවිසුම් {contracts.length}ක්
        </span>
      </div>

      {/* ── Trust notice — the key message for farmers ── */}
      <div className="fcTrustBox">
        <div className="fcTrustIcon">🔒</div>
        <div>
          <p className="fcTrustTitle">මෙම ගිවිසුම් වෙනස් කළ නොහැකිය</p>
          <p className="fcTrustDesc">
            ඔබ සහ ආයෝජකයා අතර ඇති සෑම ගිවිසුමක්ම
            <strong> ජාත්‍යන්තර Blockchain තාක්‍ෂණය</strong> මගින් ස්ථිරව සටහන් කර ඇත.
            මෙම ගිවිසුම් කිසිවෙකුට වෙනස් කිරීමට, අවලංගු කිරීමට හෝ ඉවත් කිරීමට
            නොහැකිය. ඔබේ අයිතිවාසිකම් සම්පූර්ණයෙන්ම ආරක්‍ෂා වේ.
          </p>
        </div>
      </div>

      {/* ── Empty state ── */}
      {contracts.length === 0 ? (
        <div className="fcEmpty">
          <span className="fcEmptyIcon">🌾</span>
          <p className="fcEmptyTitle">තවම ගිවිසුම් නොමැත</p>
          <p className="fcEmptyDesc">
            ආයෝජකයින් ඔබේ ඉඩමට ආයෝජනය කළ විට, ගිවිසුම් මෙහි දිස්වේ.
          </p>
        </div>
      ) : (
        <div className="fcList">
          {contracts.map((c, idx) => {
            const isOpen = expanded === c.investmentId;

            return (
              <div
                key={c.investmentId}
                className={"fcCard" + (isOpen ? " fcCardOpen" : "")}
              >
                {/* ── Card header ── */}
                <div
                  className="fcCardHead"
                  onClick={() => setExpanded(isOpen ? null : c.investmentId)}
                  role="button"
                  aria-expanded={isOpen}
                >
                  {/* Number circle */}
                  <div className="fcCardNum">{idx + 1}</div>

                  <div className="fcCardHeadInfo">
                    <p className="fcCardProject">{c.projectName}</p>
                    <p className="fcCardMeta">📍 {c.location}</p>
                  </div>

                  <div className="fcCardHeadRight">
                    <p className="fcCardAmount">{formatCurrency(c.amountInvested)}</p>
                    {sinhalaBadge(c.status)}
                  </div>

                  <span className="fcChevron">{isOpen ? "▲" : "▼"}</span>
                </div>

                {/* ── Expanded body ── */}
                {isOpen && (
                  <div className="fcCardBody">

                    {/* Immutability notice inside card */}
                    <div className="fcCardNotice">
                      <span>🔒</span>
                      <span>
                        මෙම ගිවිසුම <strong>ජාත්‍යන්තර Blockchain ගිවිසුමකි</strong> —
                        කිසිවෙකුට වෙනස් කිරීමට නොහැකිය.
                      </span>
                    </div>

                    {/* Details in Sinhala */}
                    <div className="fcDetailList">
                      <div className="fcDetailItem">
                        <span className="fcDetailLabel">ව්‍යාපෘති නාමය</span>
                        <span className="fcDetailVal">{c.projectName}</span>
                      </div>
                      <div className="fcDetailItem">
                        <span className="fcDetailLabel">ස්ථානය</span>
                        <span className="fcDetailVal">{c.location}</span>
                      </div>
                      <div className="fcDetailItem">
                        <span className="fcDetailLabel">බෝගය</span>
                        <span className="fcDetailVal">{c.cropType || "—"}</span>
                      </div>
                      <div className="fcDetailItem">
                        <span className="fcDetailLabel">ඉඩම් ප්‍රමාණය</span>
                        <span className="fcDetailVal">
                          {c.sizeAcres ? `${c.sizeAcres} අක්කර` : "—"}
                        </span>
                      </div>
                      <div className="fcDetailItem">
                        <span className="fcDetailLabel">ආයෝජකයා</span>
                        <span className="fcDetailVal">{c.investorName}</span>
                      </div>
                      <div className="fcDetailItem">
                        <span className="fcDetailLabel">ආයෝජිත මුදල</span>
                        <span className="fcDetailVal fcAmountVal">
                          {formatCurrency(c.amountInvested)}
                        </span>
                      </div>
                      <div className="fcDetailItem">
                        <span className="fcDetailLabel">ගිවිසුම් දිනය</span>
                        <span className="fcDetailVal">{formatDate(c.investmentDate)}</span>
                      </div>
                      <div className="fcDetailItem">
                        <span className="fcDetailLabel">තත්ත්වය</span>
                        <span className="fcDetailVal">{sinhalaBadge(c.status)}</span>
                      </div>
                    </div>

                    {/* Sinhala explanation */}
                    <div className="fcExplanationBox">
                      <p className="fcExplainTitle">🌿 ගිවිසුම ගැන</p>
                      <p className="fcExplainText">
                        ඔබ සහ ආයෝජකයා{" "}
                        <strong>{c.investorName}</strong> අතර ඇති මෙම ගිවිසුම
                        ජාත්‍යන්තර Blockchain පද්ධතිය හරහා ස්ථිරව සටහන් කර ඇත.
                        CHC (Ceylon Harvest Capital) ප්ලැට්ෆෝමය මගින් ඔබේ ගෙවීම්
                        <strong> ඉලක්ක-මත-පදනම් ක්‍රමයකින් (Milestone)</strong> නිකුත් කෙරේ.
                        ඔබ සෑම ඉලක්කයක් සාක්‍ෂාත් කළ විට, ඒ මුදල ස්වයංක්‍රීයව ඔබට ලැබේ.
                      </p>
                      <p className="fcExplainText">
                        ඔබේ අයිතිවාසිකම් ආරක්‍ෂා කිරීම සඳහා
                        <strong> ස්වාධීන ගිණුම් පරීක්‍ෂකයින් (Auditors)</strong> මෙම
                        ගිවිසුම නිරීක්‍ෂණය කරයි. කිසිවෙකුට ඔබේ ගිවිසුම වෙනස් කිරීමට
                        හෝ ඉවත් කිරීමට නොහැකිය.
                      </p>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Footer note ── */}
      {contracts.length > 0 && (
        <div className="fcFooterNote">
          <span>ℹ️</span>
          <span>
            ගිවිසුම් සම්බන්ධ ගැටළු ඇත්නම්, "24/7 Support" හරහා CHC කණ්ඩායම හා සම්බන්ධ වන්න.
          </span>
        </div>
      )}
    </div>
  );
}
