import "../styles/components/statCard.css";

export function StatCard({ variant = "plain", kicker, valueTop, value, sub, icon }) {
  return (
    <div className={`statCard statCard--${variant}`}>
      <div className="statLeft">
        <div className="statKicker">{kicker}</div>
        {valueTop ? <div className="statValueTop">{valueTop}</div> : null}
        <div className="statValue">{value}</div>
        {sub ? <div className="statSub">{sub}</div> : null}
      </div>

      <div className="statIconBox" aria-hidden="true">
        {icon}
      </div>
    </div>
  );
}
