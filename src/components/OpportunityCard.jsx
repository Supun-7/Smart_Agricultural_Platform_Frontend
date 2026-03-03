import { IconPin, IconLeaf, IconClock, IconTrend } from "./icons.jsx";
import "../styles/components/opportunityCard.css";

export function OpportunityCard({ project, action }) {
  const raised = Number(project.raised || 0);
  const target = Number(project.target || 0);
  const pct = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;

  const status = String(project.status || "Approved");

  return (
    <article className="opCard">
      <div className="opTop">
        <h3 className="opTitle">{project.title}</h3>
        <span className={`statusPill status-${status.toLowerCase()}`}>{status}</span>
      </div>

      <div className="opMeta">
        <span className="metaItem">
          <IconPin className="metaIco" />
          {project.location}
        </span>
        <span className="metaItem">
          <IconLeaf className="metaIco" />
          {project.crop}
        </span>
        <span className="metaItem">
          <IconClock className="metaIco" />
          {project.durationMonths}mo
        </span>
        <span className="metaItem">
          <IconTrend className="metaIco" />
          {project.roi}% ROI
        </span>
      </div>

      <div className="fundRow">
        <div className="fundText">LKR {raised.toLocaleString()} raised</div>
        <div className="fundPct">{pct}%</div>
      </div>

      <progress className="fundProgress" value={raised} max={Math.max(1, target)} />

      <div className="fundFoot">of LKR {target.toLocaleString()} target</div>

      {action ? <div className="opActions">{action}</div> : null}
    </article>
  );
}
