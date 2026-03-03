import "../styles/components/milestoneHistory.css";

function fmtTs(ts) {
  try {
    const d = new Date(ts);
    if (!Number.isFinite(d.getTime())) return String(ts || "");
    return d.toLocaleString();
  } catch {
    return String(ts || "");
  }
}

function entryTitle(e) {
  const type = String(e?.type || "");
  if (type === "status") return "Status change";
  if (type === "due_date") return "Due date edit";
  if (type === "rollback") return "Rollback";
  if (type === "escrow") return "Escrow update";
  if (type === "created") return "Created";
  return "Update";
}

function entryDetail(e) {
  const type = String(e?.type || "");
  if (type === "status" || type === "due_date" || type === "rollback") {
    const from = e?.from ?? "—";
    const to = e?.to ?? "—";
    return `${from} → ${to}`;
  }
  if (type === "escrow") {
    const cur = String(e?.currency || "").trim();
    const delta = Number(e?.delta || 0);
    const sign = delta >= 0 ? "+" : "";
    return `${sign}${delta.toLocaleString()} ${cur}`.trim();
  }
  return String(e?.label || "");
}

export function MilestoneHistory({ history = [] }) {
  return (
    <div className="msHistWrap" aria-label="Milestone activity">
      <div className="msHistTitle">Activity timeline</div>
      <div className="msHistPanel" role="region" aria-label="Timeline" tabIndex={0}>
        {history.length === 0 ? (
          <div className="msHistEmpty">No activity recorded yet.</div>
        ) : (
          <ol className="msHistList">
            {history.map((e) => (
              <li key={String(e.id || e.ts)} className="msHistItem">
                <div className="msHistDot" aria-hidden="true" />
                <div className="msHistBody">
                  <div className="msHistRow">
                    <div className="msHistHead">{entryTitle(e)}</div>
                    <div className="msHistTs">{fmtTs(e.ts)}</div>
                  </div>
                  <div className="msHistLabel">{String(e.label || "")}</div>
                  <div className="msHistMeta">{entryDetail(e)}</div>
                  {e?.transactionId ? (
                    <div className="msHistMeta">Txn: {String(e.transactionId)}</div>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

export function exportMilestoneHistoryAsPdf({ projectTitle, milestoneLabel, history = [] }) {
  // Front-end only PDF export: open a print-friendly window and let the browser "Save as PDF".
  const safe = (s) => String(s || "").replace(/[<>]/g, "");

  const rows = (history || [])
    .map((e) => {
      const t = safe(entryTitle(e));
      const when = safe(fmtTs(e.ts));
      const label = safe(String(e.label || ""));
      const detail = safe(entryDetail(e));
      const txn = e?.transactionId ? `<div class="meta">Txn: ${safe(e.transactionId)}</div>` : "";
      return `
        <div class="row">
          <div class="left">
            <div class="title">${t}</div>
            <div class="meta">${label}</div>
            <div class="meta">${detail}</div>
            ${txn}
          </div>
          <div class="right">${when}</div>
        </div>
      `;
    })
    .join("\n");

  const html = `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>${safe(projectTitle)} — ${safe(milestoneLabel)} (History)</title>
      <style>
        body{ font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; margin: 28px; color: #111; }
        h1{ font-size: 18px; margin: 0 0 6px; }
        h2{ font-size: 14px; margin: 0 0 18px; font-weight: 600; color: #333; }
        .row{ display: grid; grid-template-columns: 1fr auto; gap: 16px; padding: 12px 0; border-bottom: 1px solid #e6e6e6; }
        .title{ font-weight: 800; }
        .meta{ font-size: 12px; color: #444; margin-top: 2px; }
        .right{ font-size: 12px; color: #555; white-space: nowrap; }
        .footer{ margin-top: 18px; font-size: 11px; color: #777; }
        @media print{ body{ margin: 14mm; } }
      </style>
    </head>
    <body>
      <h1>${safe(projectTitle)}</h1>
      <h2>Milestone history: ${safe(milestoneLabel)}</h2>
      ${rows || '<div class="meta">No history available.</div>'}
      <div class="footer">Generated ${safe(new Date().toLocaleString())}</div>
      <script>
        window.addEventListener('load', () => { setTimeout(() => window.print(), 50); });
      </script>
    </body>
  </html>
  `;

  const w = window.open("", "_blank", "noopener,noreferrer");
  if (!w) return { ok: false, message: "Popup blocked. Please allow popups to export." };
  w.document.open();
  w.document.write(html);
  w.document.close();
  return { ok: true };
}
