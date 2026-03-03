import { Fragment, useEffect, useMemo, useState } from "react";
import { Modal } from "./Modal.jsx";
import "../styles/components/heatmap.css";
import { getMilestoneHistory, markMilestoneComplete, undoMilestoneComplete, updateMilestoneDueDate } from "../mock/storage.js";
import { exportMilestoneHistoryAsPdf, MilestoneHistory } from "./MilestoneHistory.jsx";

function parseDate(value) {
  const d = new Date(value);
  return Number.isFinite(d.getTime()) ? d : null;
}

function normalizeStatus(item, today) {
  const status = String(item?.status || "pending").toLowerCase();
  const due = parseDate(item?.dueDate);
  if (status !== "complete" && due && due.getTime() < today.getTime()) return "delayed";
  if (["complete", "active", "pending", "delayed"].includes(status)) return status;
  return "pending";
}

function riskForProject({ completionPct, delayedCount, activeCount }) {
  // Higher score = worse risk (0-100).
  const delayPenalty = delayedCount > 0 ? 60 : 0;
  const completionPenalty = (100 - completionPct) * 0.4;
  const activityPenalty = activeCount === 0 ? 10 : 0;
  const score = Math.min(100, Math.round(delayPenalty + completionPenalty + activityPenalty));

  let level = "Low";
  if (score >= 70) level = "High";
  else if (score >= 40) level = "Medium";

  return { level, score };
}

function cellColor(status, completionPct) {
  // Gradient intensity based on completion %.
  const alpha = Math.min(0.95, Math.max(0.35, 0.35 + completionPct / 140));
  switch (status) {
    case "complete":
      return `rgba(34,197,94,${alpha})`; // green
    case "active":
      return `rgba(234,179,8,${alpha})`; // yellow
    case "delayed":
      return `rgba(239,68,68,${alpha})`; // red
    default:
      return `rgba(96,165,250,${Math.min(0.7, alpha)})`; // blue (pending)
  }
}

function buildColumns(milestoneGroups) {
  // Unique labels ordered by earliest due date.
  const meta = new Map();
  milestoneGroups.forEach((g) => {
    (g?.items || []).forEach((m) => {
      const label = String(m.label || "Milestone");
      const due = parseDate(m.dueDate);
      const t = due ? due.getTime() : Number.POSITIVE_INFINITY;
      const prev = meta.get(label);
      if (!prev || t < prev.minDue) meta.set(label, { label, minDue: t });
    });
  });
  return Array.from(meta.values())
    .sort((a, b) => a.minDue - b.minDue)
    .map((x) => x.label);
}

export function KpiHeatmap({ projects = [], milestoneGroups = [] }) {
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const [dueDraft, setDueDraft] = useState("");
  const [hist, setHist] = useState([]);
  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    if (!selected) return;
    setDueDraft(String(selected.milestone?.dueDate || ""));
    setHist(getMilestoneHistory({ projectId: selected.project.id, milestoneId: selected.milestone.id }));
  }, [selected]);

  const model = useMemo(() => {
    const columns = buildColumns(milestoneGroups);
    const rows = projects.map((p) => {
      const g = milestoneGroups.find((x) => x.projectId === p.id);
      const items = (g?.items || []).map((m) => ({
        ...m,
        status: normalizeStatus(m, today)
      }));

      const done = items.filter((m) => m.status === "complete").length;
      const active = items.filter((m) => m.status === "active").length;
      const delayed = items.filter((m) => m.status === "delayed").length;
      const pct = items.length ? Math.round((done / items.length) * 100) : 0;
      const risk = riskForProject({ completionPct: pct, delayedCount: delayed, activeCount: active });

      const byLabel = new Map(items.map((m) => [String(m.label || "Milestone"), m]));
      return { project: p, byLabel, pct, delayed, risk };
    });

    const delayedTotal = rows.reduce((s, r) => s + r.delayed, 0);
    const delayedProjects = rows.filter((r) => r.delayed > 0).length;

    return { columns, rows, delayedTotal, delayedProjects };
  }, [projects, milestoneGroups, today]);

  return (
    <div className="heatWrap">
      <div className="heatTop">
        

        <div className="heatMeta">
          <div className="heatPill">
            Delayed <strong>{model.delayedTotal}</strong>
          </div>
          <div className="heatPill">
            Projects affected <strong>{model.delayedProjects}</strong>
          </div>
          <div className="heatPill muted">Local Data</div>
        </div>
      </div>

      <div className="heatLegend" aria-label="Legend">
        <div className="legendItem">
          <span className="legendSwatch complete" /> Completed
        </div>
        <div className="legendItem">
          <span className="legendSwatch active" /> Active
        </div>
        <div className="legendItem">
          <span className="legendSwatch pending" /> Pending
        </div>
        <div className="legendItem">
          <span className="legendSwatch delayed" /> Delayed
        </div>
        <div className="legendItem hint">Color intensity increases with project completion.</div>
      </div>

      <div className="heatScroll" role="region" aria-label="Heatmap" tabIndex={0}>
        <div
          className="heatGrid"
          style={{
            gridTemplateColumns: `300px repeat(${Math.max(model.columns.length, 1)}, 180px)`
          }}
        >
          <div className="heatHead sticky">Project</div>
          {(model.columns.length ? model.columns : ["Milestones"]).map((label) => (
            <div key={`head-${label}`} className="heatHead" title={label}>
              <div className="headLabel">{label}</div>
            </div>
          ))}

          {model.rows.map((row) => {
            const { project, pct, risk } = row;
            return (
              <Fragment key={project.id}>
                <div className="heatProj sticky">
                  <div className="projTitle">{project.title}</div>
                  <div className="projMeta">
                    <span className="projPct">{pct}%</span>
                    <span className={`riskBadge ${risk.level.toLowerCase()}`}>Risk {risk.level} ({risk.score})</span>
                  </div>
                </div>

                {(model.columns.length ? model.columns : ["Milestones"]).map((col) => {
                  const m = row.byLabel.get(col);
                  if (!m) return <div key={`${project.id}-${col}-empty`} className="heatCell empty" />;

                  const title = `${m.label}\nDue: ${m.dueDate || "—"}\nStatus: ${m.status}\nAmount: ${Number(m.amount || 0).toLocaleString()}`;
                  return (
                    <button
                      key={`${project.id}-${col}`}
                      type="button"
                      className={`heatCell ${m.status}`}
                      style={{ background: cellColor(m.status, pct) }}
                      title={title}
                      onClick={() => setSelected({ project, milestone: m, completionPct: pct, risk })}
                    />
                  );
                })}
              </Fragment>
            );
          })}
        </div>
      </div>

      <Modal open={Boolean(selected)} title="Milestone" onClose={() => setSelected(null)}>
        {selected ? (
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ fontWeight: 900 }}>{selected.project.title}</div>
            <div className="cap" style={{ opacity: 0.8 }}>
              Completion <strong>{selected.completionPct}%</strong> · Risk <strong>{selected.risk.level}</strong> ({selected.risk.score})
            </div>

            <div className="filterInput" style={{ padding: 14, borderRadius: 14 }}>
              <div style={{ display: "grid", gap: 6 }}>
                <div style={{ fontWeight: 800 }}>{selected.milestone.label}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center" }}>
                  <div style={{ opacity: 0.75, fontSize: 13 }}>Due date</div>
                  <input
                    className="heatDate"
                    type="date"
                    value={dueDraft}
                    onChange={(e) => setDueDraft(e.target.value)}
                    aria-label="Due date"
                  />
                </div>
                <div style={{ opacity: 0.75, fontSize: 13 }}>Status: {selected.milestone.status}</div>
                <div style={{ opacity: 0.75, fontSize: 13 }}>Amount: {Number(selected.milestone.amount || 0).toLocaleString()}</div>
              </div>
            </div>

            <MilestoneHistory history={hist} />

            {toast ? (
              <div className="heatToast" role="status" aria-live="polite">
                {toast}
              </div>
            ) : null}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
              <button
                className="secondaryBtn"
                type="button"
                disabled={busy}
                onClick={() => {
                  const res = exportMilestoneHistoryAsPdf({
                    projectTitle: selected.project.title,
                    milestoneLabel: selected.milestone.label,
                    history: hist
                  });
                  if (!res.ok) setToast(res.message || "Could not export.");
                }}
              >
                Export history (PDF)
              </button>
              <button
                className="secondaryBtn"
                type="button"
                disabled={busy}
                onClick={async () => {
                  if (!dueDraft) {
                    setToast("Please select a due date.");
                    return;
                  }
                  setBusy(true);
                  setToast(null);
                  await new Promise((r) => setTimeout(r, 180));
                  const res = updateMilestoneDueDate({
                    projectId: selected.project.id,
                    milestoneId: selected.milestone.id,
                    dueDate: dueDraft
                  });
                  if (res.ok) {
                    setToast("Due date updated.");
                    setSelected((s) => (s ? { ...s, milestone: { ...s.milestone, dueDate: dueDraft } } : s));
                    setHist(getMilestoneHistory({ projectId: selected.project.id, milestoneId: selected.milestone.id }));
                  } else {
                    setToast(res.message || "Could not update due date.");
                  }
                  setBusy(false);
                }}
              >
                Save due date
              </button>

              {String(selected.milestone.status).toLowerCase() !== "complete" ? (
                <button
                  className="primaryBtn"
                  type="button"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    setToast(null);
                    // Small delay so UI feels intentional/premium.
                    await new Promise((r) => setTimeout(r, 220));
                    const res = markMilestoneComplete({
                      projectId: selected.project.id,
                      milestoneId: selected.milestone.id
                    });
                    if (res.ok) {
                      setToast("Milestone completed — escrow released and transaction added.");
                      // Update local view immediately; dashboard will refresh via event.
                      setSelected((s) => (s ? { ...s, milestone: { ...s.milestone, status: "complete" } } : s));
                      setHist(getMilestoneHistory({ projectId: selected.project.id, milestoneId: selected.milestone.id }));
                    } else {
                      setToast(res.message || "Could not complete milestone.");
                    }
                    setBusy(false);
                  }}
                >
                  Mark complete
                </button>
              ) : (
                <button
                  className="dangerBtn"
                  type="button"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    setToast(null);
                    await new Promise((r) => setTimeout(r, 220));
                    const res = undoMilestoneComplete({
                      projectId: selected.project.id,
                      milestoneId: selected.milestone.id
                    });
                    if (res.ok) {
                      setToast("Undo complete — escrow and transactions rolled back.");
                      setSelected((s) => (s ? { ...s, milestone: { ...s.milestone, status: "pending" } } : s));
                      setHist(getMilestoneHistory({ projectId: selected.project.id, milestoneId: selected.milestone.id }));
                    } else {
                      setToast(res.message || "Could not undo milestone.");
                    }
                    setBusy(false);
                  }}
                >
                  Undo completion
                </button>
              )}

              <button className="secondaryBtn" type="button" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
