import "../../styles/components/investor/statCard.css";

export function StatCard({ icon, label, value, sub, accent, tone = "default" }) {
  return (
    <div className={"statCard statCardTone-" + tone + (accent ? " statCardAccent" : "")}>
      <div className="statCardIconWrap">
        <div className="statCardIcon">{icon}</div>
      </div>
      <div className="statCardBody">
        <span className="statCardLabel">{label}</span>
        <span className="statCardValue">{value}</span>
        {sub ? <span className="statCardSub">{sub}</span> : null}
      </div>
    </div>
  );
}
