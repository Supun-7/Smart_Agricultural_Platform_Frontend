import { useMemo, useState } from "react";
import { StatCard } from "../components/StatCard.jsx";
import { FarmerProjectCard } from "../components/FarmerProjectCard.jsx";
import { IconTrend, IconCoin, IconPercent, IconGrid } from "../components/icons.jsx";
import "../styles/pages/roleDash.css";

import { loadFarmerProjects } from "../mock/storage.js";

export default function FarmerProjects() {
  const [projects] = useState(() => loadFarmerProjects());

  const stats = useMemo(() => {
    const count = projects.length;
    const goal = projects.reduce((s, p) => s + Number(p.fundingGoal || 0), 0);
    const raised = projects.reduce((s, p) => s + Number(p.raised || 0), 0);
    const pct = goal > 0 ? Math.round((raised / goal) * 100) : 0;
    return { count, goal, raised, pct };
  }, [projects]);

  return (
    <div className="dashPage">
      <div className="pageTop">
        <h1 className="pageTitle">Active Projects</h1>
      </div>

      <section className="section">
        <h2 className="sectionTitle">Funding Overview</h2>
        <p className="sectionSubtitle"></p>

        <div className="statGrid">
          <StatCard variant="plain" kicker="Projects" value={String(stats.count)} icon={<IconGrid />} />
          <StatCard variant="plain" kicker="Total Goal" valueTop="LKR" value={stats.goal.toLocaleString()} icon={<IconCoin />} />
          <StatCard variant="green" kicker="Raised" valueTop="LKR" value={stats.raised.toLocaleString()} icon={<IconTrend />} />
          <StatCard variant="brown" kicker="Overall Funding" value={`${stats.pct}%`} sub="Across all projects" icon={<IconPercent />} />
        </div>
      </section>

      <section className="section">
        <h2 className="sectionTitle">Projects</h2>
        <p className="sectionSubtitle"></p>

        {projects.length === 0 ? (
          <div className="filterInput" style={{ padding: 16, borderRadius: 18, marginTop: 14 }}>
            No projects available.
          </div>
        ) : (
          <div className="cardGrid">
            {projects.map((p) => (
              <FarmerProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
