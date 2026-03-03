import { IconPin, IconLeaf, IconClock, IconTrend } from "./icons.jsx";
import "../styles/components/opportunityCard.css";
import "../styles/components/farmerCards.css";

function statusKey(status) {
  return String(status || "active")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
}

export function FarmerProjectCard({ project, action }) {
  const raised = Number(project.raised || 0);
  const goal = Number(project.fundingGoal || 0);
  const pct = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;

  const status = String(project.status || "Active");
  const key = statusKey(status);

  return (
    <article className="opCard">
      <div className="opTop">
        <h3 className="opTitle">{project.title}</h3>
        <span className={`statusPill status-${key}`}>{status}</span>
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
          Start {project.startDate}
        </span>
        <span className="metaItem">
          <IconTrend className="metaIco" />
          {project.investors} investors
        </span>
      </div>

      <div className="fundRow">
        <div className="fundText">LKR {raised.toLocaleString()} raised</div>
        <div className="fundPct">{pct}%</div>
      </div>

      <progress className="fundProgress" value={raised} max={Math.max(1, goal)} />

      <div className="fundFoot">
        of LKR {goal.toLocaleString()} goal • Expected completion: <span className="cap">{project.expectedCompletion}</span>
      </div>

      {action ? <div className="opActions">{action}</div> : null}
    </article>
  );
}
