import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import { farmerApi } from "../../services/api.js";
import "../../styles/pages/farmer/farmerFinancialReport.css";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ── Financial Report Section ─────────────────────────────────────────────────
function FinancialReportSection({ report }) {
  return (
    <div className="ffr-section card">
      <div className="ffr-section-head">
        <div>
          <h2 className="ffr-section-title">💰 Financial Report</h2>
          <p className="ffr-section-sub">
            Total funding received across all your land listings, sourced from investment and ledger records.
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="ffr-stat-grid">
        <div className="ffr-stat-card">
          <span className="ffr-stat-label">Total Funding Received</span>
          <strong className="ffr-stat-value ffr-stat-green">
            {formatCurrency(report.totalFundingReceived)}
          </strong>
        </div>
        <div className="ffr-stat-card">
          <span className="ffr-stat-label">Projects Funded</span>
          <strong className="ffr-stat-value">
            {report.projectFundingSummaries?.length ?? 0}
          </strong>
        </div>
        <div className="ffr-stat-card">
          <span className="ffr-stat-label">Total Yield Recorded</span>
          <strong className="ffr-stat-value">
            {Number(report.totalYieldKg ?? 0).toFixed(2)} kg
          </strong>
        </div>
        <div className="ffr-stat-card">
          <span className="ffr-stat-label">Yield Submissions</span>
          <strong className="ffr-stat-value">
            {report.yieldSubmissionCount ?? 0}
          </strong>
        </div>
      </div>

      {/* Per-project breakdown */}
      <div>
        <h3 className="ffr-sub-heading">Per-Project Funding Breakdown</h3>
        {!report.projectFundingSummaries?.length ? (
          <div className="ffr-empty">
            <p>No project funding data available yet.</p>
          </div>
        ) : (
          <div className="ffr-project-list">
            {report.projectFundingSummaries.map((p) => (
              <div key={p.landId} className="ffr-project-row">
                <div className="ffr-project-info">
                  <strong className="ffr-project-name">{p.projectName}</strong>
                  <span className="ffr-project-meta">
                    📍 {p.location} · 🌾 {p.cropType} · {p.investorCount} investor{p.investorCount !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="ffr-project-right">
                  <strong className="ffr-project-amount">
                    {formatCurrency(p.totalFundingReceived)}
                  </strong>
                  <div className="ffr-progress-bar">
                    <div
                      className="ffr-progress-fill"
                      style={{ width: `${Math.min(p.progressPercentage, 100)}%` }}
                    />
                  </div>
                  <span className="ffr-progress-pct">{p.progressPercentage}% funded</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ledger entries */}
      {report.ledgerEntries?.length > 0 && (
        <div>
          <h3 className="ffr-sub-heading">Ledger Transaction History</h3>
          <div className="ffr-table-wrap">
            <table className="ffr-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Balance After</th>
                  <th>Gateway</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {report.ledgerEntries.map((entry) => (
                  <tr key={entry.ledgerId}>
                    <td>
                      <span className="ffr-txn-type">{entry.transactionType}</span>
                    </td>
                    <td className="ffr-amount-cell">{formatCurrency(entry.amount)}</td>
                    <td>{formatCurrency(entry.balanceAfter)}</td>
                    <td className="ffr-muted">{entry.gateway || "—"}</td>
                    <td className="ffr-muted">{formatDate(entry.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Yield Tracking Section ───────────────────────────────────────────────────
function YieldSection({ lands, onYieldSubmitted }) {
  const { token } = useAuth();

  const [form, setForm] = useState({
    landId: "",
    yieldAmountKg: "",
    harvestDate: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError("");
    try {
      const data = await farmerApi.getYieldHistory(token);
      setHistory(data ?? []);
    } catch (err) {
      setHistoryError(err.message || "Failed to load yield history.");
    } finally {
      setHistoryLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) loadHistory();
  }, [token, loadHistory]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSubmitError("");
    setSubmitSuccess("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.yieldAmountKg || !form.harvestDate) {
      setSubmitError("Yield amount and harvest date are required.");
      return;
    }
    if (Number(form.yieldAmountKg) <= 0) {
      setSubmitError("Yield amount must be greater than zero.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      await farmerApi.submitYield(token, {
        landId: form.landId ? Number(form.landId) : null,
        yieldAmountKg: Number(form.yieldAmountKg),
        harvestDate: form.harvestDate,
        notes: form.notes || null,
      });
      setSubmitSuccess("✅ Yield record saved successfully.");
      setForm({ landId: "", yieldAmountKg: "", harvestDate: "", notes: "" });
      await loadHistory();
      if (onYieldSubmitted) onYieldSubmitted();
    } catch (err) {
      setSubmitError(err.message || "Failed to save yield record.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="ffr-section card">
      <div className="ffr-section-head">
        <div>
          <h2 className="ffr-section-title">🌾 Yield Tracking</h2>
          <p className="ffr-section-sub">
            Record your harvest yields to track agricultural performance over time.
          </p>
        </div>
      </div>

      {/* Yield entry form */}
      <div className="ffr-yield-form-wrap">
        <h3 className="ffr-sub-heading">Log New Harvest</h3>
        <form className="ffr-yield-form" onSubmit={handleSubmit}>
          <div className="ffr-form-row">
            <div className="field">
              <span>Land Listing (optional)</span>
              <select
                name="landId"
                className="input ffr-select"
                value={form.landId}
                onChange={handleChange}
                disabled={submitting}
              >
                <option value="">— No specific land —</option>
                {lands.map((land) => (
                  <option key={land.landId} value={land.landId}>
                    {land.projectName} (#{land.landId})
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <span>Yield Amount (kg) *</span>
              <input
                type="number"
                name="yieldAmountKg"
                className="input"
                placeholder="e.g. 250.00"
                min="0.01"
                step="0.01"
                value={form.yieldAmountKg}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>

            <div className="field">
              <span>Harvest Date *</span>
              <input
                type="date"
                name="harvestDate"
                className="input"
                max={new Date().toISOString().split("T")[0]}
                value={form.harvestDate}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="field">
            <span>Notes (optional)</span>
            <textarea
              name="notes"
              className="input textarea"
              rows={3}
              placeholder="Weather conditions, quality notes, pest observations…"
              maxLength={1000}
              value={form.notes}
              onChange={handleChange}
              disabled={submitting}
            />
          </div>

          {submitError && <div className="ffr-form-error">{submitError}</div>}
          {submitSuccess && <div className="ffr-form-success">{submitSuccess}</div>}

          <div className="ffr-form-actions">
            <button className="btn" type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Record Harvest"}
            </button>
          </div>
        </form>
      </div>

      {/* Yield history */}
      <div>
        <h3 className="ffr-sub-heading">Yield History</h3>
        {historyLoading ? (
          <div className="ffr-loading-row">
            <div className="ffr-spinner" />
            <span>Loading yield records…</span>
          </div>
        ) : historyError ? (
          <div className="ffr-form-error">{historyError}</div>
        ) : history.length === 0 ? (
          <div className="ffr-empty">
            <p>No yield records yet. Submit your first harvest above.</p>
          </div>
        ) : (
          <div className="ffr-yield-history">
            {history.map((record) => (
              <div key={record.yieldId} className="ffr-yield-row">
                <div className="ffr-yield-left">
                  <strong className="ffr-yield-amount">
                    {Number(record.yieldAmountKg).toFixed(2)} kg
                  </strong>
                  <span className="ffr-yield-date">
                    Harvested {formatDate(record.harvestDate)}
                  </span>
                  {record.projectName && (
                    <span className="ffr-yield-project">
                      🌾 {record.projectName}
                    </span>
                  )}
                </div>
                {record.notes && (
                  <p className="ffr-yield-notes">{record.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function FarmerFinancialReport() {
  const { token } = useAuth();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await farmerApi.getFinancialReport(token);
      setReport(data);
    } catch (err) {
      setError(err.message || "Failed to load financial report.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) loadReport();
  }, [token, loadReport]);

  if (loading) {
    return (
      <div className="ffr-page">
        <div className="ffr-state">
          <div className="ffr-spinner" />
          <p>Loading your financial report…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ffr-page">
        <div className="ffr-state">
          <h2>Could not load report</h2>
          <p className="ffr-muted">{error}</p>
          <button className="btn" onClick={loadReport}>Try again</button>
        </div>
      </div>
    );
  }

  // Build land options for the yield form from project summaries
  const lands = (report?.projectFundingSummaries ?? []).map((p) => ({
    landId: p.landId,
    projectName: p.projectName,
  }));

  return (
    <section className="ffr-page">
      <div className="container ffr-inner">
        {/* Header */}
        <div className="card ffr-header">
          <div>
            <span className="ffr-eyebrow">Financial Reports &amp; Yield</span>
            <h1 className="ffr-title">Farm Performance Overview</h1>
            <p className="ffr-title-sub">
              Monitor your total funding received and track agricultural yield over time.
            </p>
          </div>
        </div>

        {/* Financial report */}
        <FinancialReportSection report={report} />

        {/* Yield tracking */}
        <YieldSection lands={lands} onYieldSubmitted={loadReport} />
      </div>
    </section>
  );
}
