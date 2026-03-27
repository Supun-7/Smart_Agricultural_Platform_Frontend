import { useParams, useNavigate } from "react-router-dom";
import { useProjectMilestones } from "../../hooks/useProjectMilestones.js";
import "../../styles/pages/investor/milestones.css";
import "../../styles/pages/investor/dashboard.css"; // reuse invPage, invLoading, invError

/**
 * ProjectMilestonesPage
 *
 * AC-1: Investor navigates here from their dashboard or portfolio.
 * AC-2: Only APPROVED milestones are visible (backend filters; hook passes through).
 * AC-3: Each milestone shows progressPercentage, notes, date, approvalStatus.
 * AC-4: Milestones sorted latest date first (backend enforces ORDER BY milestoneDate DESC).
 * AC-5: Visual timeline + overall progress bar per project.
 * AC-6: PENDING and REJECTED milestones are NOT visible.
 */
export default function ProjectMilestonesPage() {
  const { landId }  = useParams();
  const navigate    = useNavigate();

  const { project, loading, error, reload } = useProjectMilestones(landId);

  // ── Loading state ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="invPage">
        <div className="invLoading">
          <div className="invSpin" />
          <p>Loading project milestones…</p>
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────
  if (error) {
    return (
      <div className="invPage">
        <div className="invError">
          <span>⚠️</span>
          <p>{error}</p>
          <button className="btn" onClick={reload}>Retry</button>
        </div>
      </div>
    );
  }

  if (!project) return null;

  const {
    projectName,
    location,
    totalValue,
    amountInvested,
    overallProgress,
    approvedMilestones = [],
  } = project;

  return (
    <div className="invPage">

      {/* ── Back navigation ─────────────────────────────── */}
      <button className="mstBack" onClick={() => navigate(-1)}>
        ← Back to Portfolio
      </button>

      {/* ── Project summary card with overall progress bar ─ */}
      <div className="mstProjectCard">
        <div className="mstProjectMeta">
          <div>
            <h1 className="mstProjectTitle">{projectName}</h1>
            <p className="mstProjectLocation">📍 {location}</p>
          </div>
        </div>

        {/* Key figures */}
        <div className="mstStatRow">
          <div className="mstStat">
            <span className="mstStatLabel">Your Investment</span>
            <span className="mstStatValue">{fmt(amountInvested)}</span>
          </div>
          <div className="mstStat">
            <span className="mstStatLabel">Project Value</span>
            <span className="mstStatValue">{fmt(totalValue)}</span>
          </div>
          <div className="mstStat">
            <span className="mstStatLabel">Approved Milestones</span>
            <span className="mstStatValue">{approvedMilestones.length}</span>
          </div>
        </div>

        {/* AC-5: Overall project progress bar */}
        <div className="mstOverallProgress">
          <div className="mstOverallLabel">
            <span>Overall project progress</span>
            <span>{overallProgress ?? 0}%</span>
          </div>
          <div className="mstProgressTrack">
            <div
              className="mstProgressFill"
              style={{ width: `${overallProgress ?? 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Milestones section ───────────────────────────── */}
      <div className="invSection">
        <div className="mstSectionHead">
          <h2 className="mstSectionTitle">Approved Milestones</h2>
          {approvedMilestones.length > 0 && (
            <span className="mstCount">
              {approvedMilestones.length} milestone{approvedMilestones.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {approvedMilestones.length === 0 ? (
          /* AC-2 / AC-6: no approved milestones yet */
          <div className="mstEmpty">
            <span>🌱</span>
            <p>No approved milestones yet for this project.</p>
            <p style={{ fontSize: ".8rem" }}>
              Check back once the farmer submits progress updates and they are approved.
            </p>
          </div>
        ) : (
          /* AC-4: sorted latest first — rendered in order received from API */
          <div className="mstTimeline">
            {approvedMilestones.map((ms, idx) => (
              <MilestoneEntry key={ms.milestoneId ?? idx} milestone={ms} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

// ── Single milestone card on the timeline ──────────────────
function MilestoneEntry({ milestone }) {
  const {
    progressPercentage,
    notes,
    date,
    approvalStatus,
  } = milestone;

  const dateStr = formatDate(date);

  return (
    <div className="mstEntry">
      {/* Dot on the vertical line */}
      <div className="mstDot" />

      {/* Card body */}
      <div className="mstCard">
        {/* AC-4: date + AC-3: approvalStatus */}
        <div className="mstCardTop">
          <span className="mstDate">📅 {dateStr}</span>
          <span className="mstBadgeApproved">
            ✓ {approvalStatus ?? "APPROVED"}
          </span>
        </div>

        {/* AC-3: progressPercentage */}
        <div className="mstCardProgress">
          <div className="mstCardProgressBar">
            <div
              className="mstCardProgressFill"
              style={{ width: `${progressPercentage ?? 0}%` }}
            />
          </div>
          <span className="mstCardProgressLabel">
            {progressPercentage ?? 0}% progress at this milestone
          </span>
        </div>

        {/* AC-3: notes */}
        {notes && (
          <p className="mstNotes">{notes}</p>
        )}
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────
function fmt(val) {
  return Number(val ?? 0).toLocaleString("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  });
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-LK", {
      year: "numeric", month: "short", day: "numeric",
    });
  } catch {
    return String(dateStr);
  }
}
