import { IconLeaf, IconPin, IconTrend, IconClock } from "./icons.jsx";
import "../styles/components/opportunityCard.css";
import "../styles/components/farmerCards.css";

function statusKey(status) {
  return String(status || "active")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
}

export function FarmerLandCard({ land, action }) {
  const status = land.status || "Active";
  const key = statusKey(status);

  return (
    <article className="opCard">
      <div className="opTop">
        <h3 className="opTitle">{land.name}</h3>
        <span className={`statusPill status-${key}`}>{status}</span>
      </div>

      <div className="opMeta">
        <span className="metaItem">
          <IconPin className="metaIco" />
          {land.location}
        </span>
        <span className="metaItem">
          <IconLeaf className="metaIco" />
          {land.crop}
        </span>
        <span className="metaItem">
          <IconTrend className="metaIco" />
          {Number(land.acres || 0)} acres
        </span>
        <span className="metaItem">
          <IconClock className="metaIco" />
          {land.season}
        </span>
      </div>

      <div className="farmerHintRow">
        <div className="farmerHint">Yield target</div>
        <div className="farmerHintStrong">{land.yieldTarget || "—"}</div>
      </div>

      {action ? <div className="opActions">{action}</div> : null}
    </article>
  );
}
