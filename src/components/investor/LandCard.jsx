import "../../styles/components/investor/landCard.css";

const STATUS_MAP = {
  ACTIVE:    { label: "Active",    cls: "landBadgeActive"    },
  PENDING:   { label: "Pending",   cls: "landBadgePending"   },
  COMPLETED: { label: "Completed", cls: "landBadgeDone"      },
  CANCELLED: { label: "Cancelled", cls: "landBadgeMuted"     },
};

function fmt(val) {
  return Number(val ?? 0).toLocaleString("en-LK", {
    style: "currency", currency: "LKR", maximumFractionDigits: 0,
  });
}

export function LandCard({ investment }) {
  const {
    projectName,
    location,
    amountInvested,
    landTotalValue,
    progressPercentage,
    investmentDate,
    status,
  } = investment;

  const badge   = STATUS_MAP[status] ?? { label: status, cls: "landBadgeMuted" };
  const dateStr = investmentDate ? investmentDate.split("T")[0] : "—";

  return (
    <div className="landCard">

      <div className="landCardHeader">
        <div>
          <p className="landCardName">{projectName}</p>
          <p className="landCardLocation">📍 {location}</p>
        </div>
        <span className={"landBadge " + badge.cls}>{badge.label}</span>
      </div>

      <div className="landCardProgress">
        <div className="landCardBar">
          <div
            className="landCardFill"
            style={{ width: `${progressPercentage ?? 0}%` }}
          />
        </div>
        <span className="landCardProgressLabel">
          {progressPercentage ?? 0}% complete
        </span>
      </div>

      <div className="landCardFooter">
        <div className="landCardStat">
          <span className="landCardStatLabel">Your investment</span>
          <span className="landCardStatValue">{fmt(amountInvested)}</span>
        </div>
        <div className="landCardStat">
          <span className="landCardStatLabel">Project value</span>
          <span className="landCardStatValue">{fmt(landTotalValue)}</span>
        </div>
        <div className="landCardStat">
          <span className="landCardStatLabel">Since</span>
          <span className="landCardStatValue">{dateStr}</span>
        </div>
      </div>

    </div>
  );
}
