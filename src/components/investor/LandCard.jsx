import "../../styles/components/investor/landCard.css";

const STATUS_MAP = {
  ACTIVE: { label: "Active", cls: "landBadgeActive" },
  PENDING: { label: "Pending", cls: "landBadgePending" },
  COMPLETED: { label: "Completed", cls: "landBadgeDone" },
  CANCELLED: { label: "Cancelled", cls: "landBadgeMuted" },
};

function fmt(val) {
  return Number(val ?? 0).toLocaleString("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
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
    blockchainTxHash,
    polygonScanUrl,
    farmerName,
    cropType,
  } = investment;

  const badge = STATUS_MAP[status] ?? { label: status || "Unknown", cls: "landBadgeMuted" };
  const progress = Math.max(0, Math.min(100, Number(progressPercentage ?? 0)));
  const dateStr = investmentDate
    ? new Date(investmentDate).toLocaleDateString("en-LK", { dateStyle: "medium" })
    : "Not available";

  const hasRealLink =
    polygonScanUrl &&
    blockchainTxHash &&
    !blockchainTxHash.startsWith("BLOCKCHAIN_ERROR") &&
    !blockchainTxHash.startsWith("PENDING") &&
    blockchainTxHash.length <= 66;

  return (
    <article className="landCard">
      <div className="landCardHeader">
        <div className="landCardIdentity">
          <span className="landCardEyebrow">Live project</span>
          <p className="landCardName">{projectName}</p>
          <p className="landCardLocation">{location || "Location unavailable"}</p>
        </div>
        <span className={"landBadge " + badge.cls}>{badge.label}</span>
      </div>

      <div className="landCardMeta">
        {cropType ? <span className="landMetaChip">{cropType}</span> : null}
        {farmerName ? <span className="landMetaChip">Farmer: {farmerName}</span> : null}
        <span className="landMetaChip">Started {dateStr}</span>
      </div>

      <div className="landCardProgress">
        <div className="landCardProgressTop">
          <span className="landCardProgressLabel">Verified completion</span>
          <span className="landCardProgressValue">{progress}%</span>
        </div>
        <div className="landCardBar">
          <div className="landCardFill" style={{ width: `${progress}%` }} />
        </div>
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
      </div>

      <div className="landCardActions">
        {hasRealLink ? (
          <a
            href={polygonScanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="landCardChainLink"
          >
            View contract on PolygonScan
          </a>
        ) : (
          <span className="landCardPendingLink">Blockchain record pending</span>
        )}
      </div>
    </article>
  );
}
