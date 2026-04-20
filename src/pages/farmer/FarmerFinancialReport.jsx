import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

  return (
    <div className="ffr-section card">
      <div className="ffr-section-head">
        <div>
          <h2 className="ffr-section-title">{t("financialReport.moneyTitle")}</h2>
          <p className="ffr-section-sub">
            {t("financialReport.moneySubtitle")}
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="ffr-stat-grid">
        <div className="ffr-stat-card">
          <span className="ffr-stat-label">{t("financialReport.stats.fundingReceived")}</span>
          <strong className="ffr-stat-value ffr-stat-green">
            {formatCurrency(report.totalFundingReceived)}
          </strong>
        </div>
        <div className="ffr-stat-card">
          <span className="ffr-stat-label">{t("financialReport.stats.projectsFunded")}</span>
          <strong className="ffr-stat-value">
            {report.projectFundingSummaries?.length ?? 0}
          </strong>
        </div>
        <div className="ffr-stat-card">
          <span className="ffr-stat-label">{t("financialReport.stats.yieldRecorded")}</span>
          <strong className="ffr-stat-value">
            {Number(report.totalYieldKg ?? 0).toFixed(2)} kg
          </strong>
        </div>
        <div className="ffr-stat-card">
          <span className="ffr-stat-label">{t("financialReport.stats.yieldSubmissions")}</span>
          <strong className="ffr-stat-value">
            {report.yieldSubmissionCount ?? 0}
          </strong>
        </div>
      </div>

      {/* Per-project breakdown */}
      <div>
        <h3 className="ffr-sub-heading">{t("financialReport.projectBreakdown.title")}</h3>
        {!report.projectFundingSummaries?.length ? (
          <div className="ffr-empty">
            <p>{t("financialReport.projectBreakdown.empty")}</p>
          </div>
        ) : (
          <div className="ffr-project-list">
            {report.projectFundingSummaries.map((p) => (
              <div key={p.landId} className="ffr-project-row">
                <div className="ffr-project-info">
                  <strong className="ffr-project-name">{p.projectName}</strong>
                  <span className="ffr-project-meta">
                    📍 {p.location} · 🌾 {p.cropType} · {p.investorCount}{" "}
                    {p.investorCount === 1
                      ? t("financialReport.projectBreakdown.investor")
                      : t("financialReport.projectBreakdown.investors")}
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
                  <span className="ffr-progress-pct">
                    {p.progressPercentage}% {t("financialReport.projectBreakdown.funded")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ledger entries */}
      {report.ledgerEntries?.length > 0 && (
        <div>
          <h3 className="ffr-sub-heading">{t("financialReport.ledger.title")}</h3>
          <div className="ffr-table-wrap">
            <table className="ffr-table">
              <thead>
                <tr>
                  <th>{t("financialReport.ledger.type")}</th>
                  <th>{t("financialReport.ledger.amount")}</th>
                  <th>{t("financialReport.ledger.balanceAfter")}</th>
                  <th>{t("financialReport.ledger.gateway")}</th>
                  <th>{t("financialReport.ledger.date")}</th>
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
  const { t } = useTranslation();
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
      setHistoryError(err.message || t("financialReport.yieldTracking.loadingHistory"));
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
      setSubmitError(t("financialReport.yieldTracking.errorRequired"));
      return;
    }
    if (Number(form.yieldAmountKg) <= 0) {
      setSubmitError(t("financialReport.yieldTracking.errorZero"));
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
      setSubmitSuccess(t("financialReport.yieldTracking.success"));
      setForm({ landId: "", yieldAmountKg: "", harvestDate: "", notes: "" });
      await loadHistory();
      if (onYieldSubmitted) onYieldSubmitted();
    } catch (err) {
      setSubmitError(err.message || t("financialReport.yieldTracking.errorGeneric"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="ffr-section card">
      <div className="ffr-section-head">
        <div>
          <h2 className="ffr-section-title">{t("financialReport.yieldTracking.title")}</h2>
          <p className="ffr-section-sub">
            {t("financialReport.yieldTracking.subtitle")}
          </p>
        </div>
      </div>

      {/* Yield entry form */}
      <div className="ffr-yield-form-wrap">
        <h3 className="ffr-sub-heading">{t("financialReport.yieldTracking.logHarvest")}</h3>
        <form className="ffr-yield-form" onSubmit={handleSubmit}>
          <div className="ffr-form-row">
            <div className="field">
              <span>{t("financialReport.yieldTracking.landListing")}</span>
              <select
                name="landId"
                className="input ffr-select"
                value={form.landId}
                onChange={handleChange}
                disabled={submitting}
              >
                <option value="">{t("financialReport.yieldTracking.noLand")}</option>
                {lands.map((land) => (
                  <option key={land.landId} value={land.landId}>
                    {land.projectName} (#{land.landId})
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <span>{t("financialReport.yieldTracking.yieldAmountKg")}</span>
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
              <span>{t("financialReport.yieldTracking.harvestDate")}</span>
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
            <span>{t("financialReport.yieldTracking.notes")}</span>
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
              {submitting
                ? t("financialReport.yieldTracking.saving")
                : t("financialReport.yieldTracking.recordHarvest")}
            </button>
          </div>
        </form>
      </div>

      {/* Yield history */}
      <div>
        <h3 className="ffr-sub-heading">{t("financialReport.yieldTracking.historyTitle")}</h3>
        {historyLoading ? (
          <div className="ffr-loading-row">
            <div className="ffr-spinner" />
            <span>{t("financialReport.yieldTracking.loadingHistory")}</span>
          </div>
        ) : historyError ? (
          <div className="ffr-form-error">{historyError}</div>
        ) : history.length === 0 ? (
          <div className="ffr-empty">
            <p>{t("financialReport.yieldTracking.noHistory")}</p>
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
                    {t("financialReport.yieldTracking.harvested")} {formatDate(record.harvestDate)}
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
  const { t } = useTranslation();
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
      setError(err.message || t("financialReport.status.errorGeneric"));
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
          <p>{t("financialReport.status.loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ffr-page">
        <div className="ffr-state">
          <h2>{t("financialReport.status.couldNotLoad")}</h2>
          <p className="ffr-muted">{error}</p>
          <button className="btn" onClick={loadReport}>
            {t("financialReport.status.tryAgain")}
          </button>
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
            <span className="ffr-eyebrow">{t("financialReport.eyebrow")}</span>
            <h1 className="ffr-title">{t("financialReport.title")}</h1>
            <p className="ffr-title-sub">
              {t("financialReport.subtitle")}
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
