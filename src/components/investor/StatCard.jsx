import "../../styles/components/investor/statCard.css";

export function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div className={"statCard" + (accent ? " statCardAccent" : "")}>
      <div className="statCardIcon">{icon}</div>
      <div className="statCardBody">
        <span className="statCardLabel">{label}</span>
        <span className="statCardValue">{value}</span>
        {sub && <span className="statCardSub">{sub}</span>}
      </div>
    </div>
  );
}