import { useMemo, useState } from "react";
import { MilestoneTimeline } from "../components/MilestoneTimeline.jsx";
import { StatCard } from "../components/StatCard.jsx";
import { IconCheck, IconClock, IconPercent, IconGrid } from "../components/icons.jsx";
import "../styles/pages/roleDash.css";

import {
  loadFarmerMilestones,
  saveFarmerMilestones,
  markMilestoneComplete
} from "../mock/storage.js";

function computeCounts(groups) {
  const all = groups.flatMap((g) => g.items || []);
  const total = all.length;
  const done = all.filter((m) => m.status === "complete").length;
  const active = all.filter((m) => m.status === "active").length;
  const pending = all.filter((m) => m.status === "pending").length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return { total, done, active, pending, pct };
}

export default function FarmerMilestones() {
  const [groups, setGroups] = useState(() => loadFarmerMilestones());

  const counts = useMemo(() => computeCounts(groups), [groups]);

  function advance(projectId) {
    const g = groups.find((x) => x.projectId === projectId);
    const active = (g?.items || []).find((m) => String(m.status || "").toLowerCase() === "active");
    if (!active) return;

    markMilestoneComplete({ projectId, milestoneId: active.id });
    // Refresh from storage (also preserves per-milestone history)
    const refreshed = loadFarmerMilestones();
    setGroups(refreshed);
    saveFarmerMilestones(refreshed);
  }

  return (
    <div className="dashPage">
      <div className="pageTop">
        <h1 className="pageTitle">Milestone Progress</h1>
      </div>

      <section className="section">
        <h2 className="sectionTitle">Overview</h2>
        <p className="sectionSubtitle"></p>

        <div className="statGrid">
          <StatCard variant="plain" kicker="Total Milestones" value={String(counts.total)} icon={<IconGrid />} />
          <StatCard variant="green" kicker="Completed" value={String(counts.done)} icon={<IconCheck />} />
          <StatCard variant="brown" kicker="Active" value={String(counts.active)} icon={<IconClock />} />
          <StatCard variant="plain" kicker="Completion" value={`${counts.pct}%`} sub="Across all projects" icon={<IconPercent />} />
        </div>
      </section>

      <section className="section">
        <h2 className="sectionTitle">Project Milestones</h2>
        <p className="sectionSubtitle"></p>

        {groups.length === 0 ? (
          <div className="filterInput" style={{ padding: 16, borderRadius: 18, marginTop: 14 }}>
            No milestone data available.
          </div>
        ) : (
          <div className="cardGrid">
            {groups.map((g) => {
              const hasActive = (g.items || []).some((m) => m.status === "active");
              const allComplete = (g.items || []).length > 0 && (g.items || []).every((m) => m.status === "complete");

              return (
                <MilestoneTimeline
                  key={g.projectId}
                  title={g.title}
                  items={g.items}
                  action={
                    <>
                      <button
                        className="secondaryBtn"
                        type="button"
                        onClick={() => advance(g.projectId)}
                        disabled={!hasActive || allComplete}
                        title={allComplete ? "All milestones are completed" : !hasActive ? "No active milestone" : "Mark active milestone complete"}
                      >
                        Mark active complete
                      </button>
                    </>
                  }
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
