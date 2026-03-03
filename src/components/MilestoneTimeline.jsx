import "../styles/components/milestoneTimeline.css";
import "../styles/components/opportunityCard.css";

function pctComplete(items) {
  const total = items.length || 1;
  const done = items.filter((m) => m.status === "complete").length;
  return Math.round((done / total) * 100);
}

export function MilestoneTimeline({ title, items = [], action }) {
  const pct = pctComplete(items);
  let currency = "LKR";
  try {
    const raw = localStorage.getItem("farmer_funds");
    if (raw) currency = JSON.parse(raw)?.currency || currency;
  } catch {
    // ignore
  }

  return (
    <article className="msCard">
      <div className="msTop">
        <div>
          <h3 className="msTitle">{title}</h3>
          <div className="msSub">Milestone progress</div>
        </div>
        <div className="msPct" aria-label={`Milestone completion ${pct}%`}>{pct}%</div>
      </div>

      <progress className="fundProgress" value={pct} max={100} />

      <ol className="msList">
        {items.map((m) => (
          <li key={m.id} className={`msItem ms-${m.status || "pending"}`}>
            <span className="msDot" aria-hidden="true" />
            <div className="msContent">
              <div className="msLabel">{m.label}</div>
              <div className="msMeta">
                <span className="cap">{m.status}</span>
                {m.dueDate ? <span>• Due {m.dueDate}</span> : null}
                {typeof m.amount === "number" ? <span>• {currency} {Number(m.amount || 0).toLocaleString()}</span> : null}
              </div>
            </div>
          </li>
        ))}
      </ol>

      {action ? <div className="msActions">{action}</div> : null}
    </article>
  );
}
