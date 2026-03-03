import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "../routes/routePaths.js";

import { StatCard } from "../components/StatCard.jsx";
import { FarmerLandCard } from "../components/FarmerLandCard.jsx";
import { FarmerProjectCard } from "../components/FarmerProjectCard.jsx";
import { MilestoneTimeline } from "../components/MilestoneTimeline.jsx";
import { Loader } from "../components/Loader.jsx";
import { CircularProgress } from "../components/CircularProgress.jsx";
import { LineChart } from "../components/LineChart.jsx";
import { KpiHeatmap } from "../components/KpiHeatmap.jsx";

import { IconClipboard, IconTrend, IconPercent, IconCoin } from "../components/icons.jsx";

import "../styles/pages/roleDash.css";

import {
  loadFarmerFunds,
  loadFarmerLands,
  loadFarmerMilestones,
  loadFarmerProfile,
  loadFarmerProjects,
  loadFarmerTransactions
} from "../mock/storage.js";
import { computeMilestoneCompletionPct, computePerformanceScore } from "../services/performanceScore.js";
import { useAuth } from "../hooks/useAuth.js";

function greetingForHour(h) {
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function buildGrowthSeries(txns) {
  // Cumulative released
  const released = txns
    .filter((t) => String(t.status || "").toLowerCase() === "released")
    .slice()
    .reverse();
  let acc = 0;
  const series = released.map((t) => {
    acc += Number(t.amount || 0);
    return acc;
  });
  return series.length ? series : [0, 0, 0, 0];
}

export default function FarmerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Simulated section loading for a premium feel.
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(t);
  }, []);

  const [profile, setProfile] = useState(() => loadFarmerProfile());
  const [lands, setLands] = useState(() => loadFarmerLands());
  const [projects, setProjects] = useState(() => loadFarmerProjects());
  const [milestoneGroups, setMilestoneGroups] = useState(() => loadFarmerMilestones());
  const [funds, setFunds] = useState(() => loadFarmerFunds());
  const [txns, setTxns] = useState(() => loadFarmerTransactions());

  // Enterprise: project filters (crop/location/status)
  const [q, setQ] = useState("");
  const [crop, setCrop] = useState("all");
  const [location, setLocation] = useState("all");
  const [status, setStatus] = useState("all");

  // Live-refresh when localStorage is updated by actions (e.g., completing milestones in modal)
  useEffect(() => {
    const refresh = () => {
      setProfile(loadFarmerProfile());
      setLands(loadFarmerLands());
      setProjects(loadFarmerProjects());
      setMilestoneGroups(loadFarmerMilestones());
      setFunds(loadFarmerFunds());
      setTxns(loadFarmerTransactions());
    };
    window.addEventListener("farmer:dataChanged", refresh);
    return () => window.removeEventListener("farmer:dataChanged", refresh);
  }, []);

  const firstName = useMemo(() => {
    const n = String(user?.fullName || profile.name || "").trim();
    return n ? n.split(/\s+/)[0] : "User";
  }, [user?.fullName, profile.name]);

  const greeting = useMemo(() => greetingForHour(new Date().getHours()), []);

  const completionPct = useMemo(() => computeMilestoneCompletionPct(milestoneGroups), [milestoneGroups]);
  const perfScore = useMemo(
    () => computePerformanceScore({ projects, milestoneGroups, transactions: txns }),
    [projects, milestoneGroups, txns]
  );

  const stats = useMemo(() => {
    const totalLands = lands.length;
    const activeProjects = projects.filter((p) => String(p.status || "").toLowerCase() === "active").length;
    const escrow = Number(funds.escrowBalance || 0);
    return { totalLands, activeProjects, escrow };
  }, [lands, projects, funds]);

  const currency = funds.currency || "LKR";
  const recentTxns = useMemo(() => txns.slice(0, 3), [txns]);

  // Elite: Revenue prediction calculator
  const totalAcres = useMemo(() => lands.reduce((s, l) => s + Number(l.acres || 0), 0), [lands]);
  const [yieldPerAcre, setYieldPerAcre] = useState(200);
  const [pricePerKg, setPricePerKg] = useState(520); // LKR/kg (example)
  const predictedRevenue = useMemo(() => {
    const y = Number(yieldPerAcre || 0);
    const p = Number(pricePerKg || 0);
    return Math.max(0, totalAcres * y * p);
  }, [totalAcres, yieldPerAcre, pricePerKg]);

  const growth = useMemo(() => buildGrowthSeries(txns), [txns]);

  const filterOptions = useMemo(() => {
    const uniq = (arr) => Array.from(new Set(arr.filter(Boolean)));
    return {
      crops: uniq(projects.map((p) => p.crop)),
      locations: uniq(projects.map((p) => p.location)),
      statuses: uniq(projects.map((p) => p.status))
    };
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const query = q.trim().toLowerCase();
    return projects.filter((p) => {
      const matchesQ = !query || String(p.title || "").toLowerCase().includes(query) || String(p.id || "").toLowerCase().includes(query);
      const matchesCrop = crop === "all" || String(p.crop || "").toLowerCase() === crop;
      const matchesLoc = location === "all" || String(p.location || "").toLowerCase() === location;
      const matchesStatus = status === "all" || String(p.status || "").toLowerCase() === status;
      return matchesQ && matchesCrop && matchesLoc && matchesStatus;
    });
  }, [projects, q, crop, location, status]);

  const filteredMilestoneGroups = useMemo(() => {
    const ids = new Set(filteredProjects.map((p) => String(p.id)));
    return milestoneGroups.filter((g) => ids.has(String(g.projectId)));
  }, [filteredProjects, milestoneGroups]);

  return (
    <div className="dashPage">
      <div className="pageTop" style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 className="pageTitle">
            {String(user?.role || "").toLowerCase() === "investor" ? "Investor Dashboard" : "Farmer Dashboard"}
          </h1>
          <p className="sectionSubtitle" style={{ marginTop: 6 }}>
            {greeting}, <strong>{firstName}</strong>.
          </p>
        </div>

        <div className="noPrint" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link className="secondaryBtn" to={`${ROUTES.farmerReport}?print=1`}>
            Export PDF report
          </Link>
          <button className="secondaryBtn" type="button" onClick={() => navigate(ROUTES.farmerMilestones)}>
            Update milestones
          </button>
        </div>
      </div>

      <section className="section">
        <h2 className="sectionTitle">Overview</h2>
        <p className="sectionSubtitle"></p>

        {loading ? (
          <div style={{ marginTop: 18 }}>
            <Loader label="Loading your overview…" />
          </div>
        ) : (
          <div className="statGrid">
            <StatCard variant="plain" kicker="Registered Lands" value={String(stats.totalLands)} icon={<IconClipboard />} />
            <StatCard variant="green" kicker="Active Projects" value={String(stats.activeProjects)} icon={<IconTrend />} />
            <StatCard variant="brown" kicker="Milestone Completion" value={`${completionPct}%`} sub="Across projects" icon={<IconPercent />} />
            <StatCard
              variant="plain"
              kicker="Escrow Balance"
              valueTop={currency}
              value={Number(stats.escrow || 0).toLocaleString()}
              icon={<IconCoin />}
            />
          </div>
        )}

        <div className="cardGrid" style={{ marginTop: 18 }}>
          <div className="filterInput" style={{ padding: 16, borderRadius: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 900 }}>Performance Score</div>
                <div style={{ opacity: 0.7, fontSize: 13 }}>Completion + escrow health + activity</div>
              </div>
              <div className="cap" style={{ opacity: 0.7 }}>Elite KPI</div>
            </div>
            <div style={{ marginTop: 12 }}>
              <CircularProgress value={perfScore} label="KPI" />
            </div>
          </div>

          <div className="filterInput" style={{ padding: 16, borderRadius: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 900 }}>Financial Growth</div>
                <div style={{ opacity: 0.7, fontSize: 13 }}>Cumulative released funds</div>
              </div>
              <div className="cap" style={{ opacity: 0.7 }}>{currency}</div>
            </div>
            <div style={{ marginTop: 12 }}>
              <LineChart data={growth} />
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="sectionTitle">Revenue Prediction</h2>
        <p className="sectionSubtitle"></p>

        <div className="cardGrid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
          <div className="filterInput" style={{ padding: 16, borderRadius: 18 }}>
            <div style={{ fontWeight: 900 }}>Calculator</div>
            <div style={{ opacity: 0.7, fontSize: 13, marginTop: 4 }}>Total acres detected: {totalAcres.toFixed(1)}</div>

            <div className="modalGrid2" style={{ marginTop: 12 }}>
              <label className="filterField">
                Yield per acre (kg)
                <input className="filterInput" type="number" min="0" value={yieldPerAcre} onChange={(e) => setYieldPerAcre(e.target.value)} />
              </label>
              <label className="filterField">
                Price per kg ({currency})
                <input className="filterInput" type="number" min="0" value={pricePerKg} onChange={(e) => setPricePerKg(e.target.value)} />
              </label>
            </div>

            <div style={{ marginTop: 14, fontWeight: 950, fontSize: 22 }}>
              {currency} {predictedRevenue.toLocaleString()}
            </div>
            <div style={{ opacity: 0.7, fontSize: 12, marginTop: 4 }}>This is a local estimate (demo).</div>
          </div>

          <div className="filterInput" style={{ padding: 16, borderRadius: 18 }}>
            <div style={{ fontWeight: 900 }}>How it works</div>
            <div style={{ opacity: 0.78, marginTop: 10, fontSize: 14 }}>
              Revenue = <strong>total acres</strong> × <strong>yield per acre</strong> × <strong>price per kg</strong>.
              <div style={{ marginTop: 10 }}>
                Tip: Adjust price per kg to simulate market changes.
              </div>
            </div>
            <div className="noPrint" style={{ marginTop: 14 }}>
              <Link className="secondaryBtn" to={ROUTES.farmerLands}>Review lands</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="sectionTitle">KPI Heatmap</h2>
        <p className="sectionSubtitle">Multi-project milestone mapping (completed/active/pending).</p>
        <div style={{ marginTop: 18 }}>
          <KpiHeatmap projects={filteredProjects} milestoneGroups={filteredMilestoneGroups} />
        </div>
      </section>

      <section className="section">
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h2 className="sectionTitle">Registered Lands</h2>
            <p className="sectionSubtitle">Your land plots stored in this browser.</p>
          </div>
          <Link className="secondaryBtn" to={ROUTES.farmerLands}>
            Manage lands
          </Link>
        </div>

        {lands.length === 0 ? (
          <p className="sectionSubtitle" style={{ marginTop: 14 }}>
            No registered lands yet.
          </p>
        ) : (
          <div className="cardGrid">
            {lands.slice(0, 4).map((l) => (
              <FarmerLandCard key={l.id} land={l} />
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h2 className="sectionTitle">Active Projects</h2>
            <p className="sectionSubtitle">Funding progress and expected completion timelines.</p>
          </div>
          <Link className="secondaryBtn" to={ROUTES.farmerProjects}>
            Open projects
          </Link>
        </div>

        <div className="filterRow" style={{ marginTop: 14 }}>
          <input
            className="filterInput"
            placeholder="Search project (name / id)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search project"
          />
          <select className="filterSelect" value={crop} onChange={(e) => setCrop(e.target.value)} aria-label="Filter by crop">
            <option value="all">All crops</option>
            {filterOptions.crops.map((c) => (
              <option key={c} value={String(c).toLowerCase()}>
                {c}
              </option>
            ))}
          </select>
          <select className="filterSelect" value={location} onChange={(e) => setLocation(e.target.value)} aria-label="Filter by location">
            <option value="all">All locations</option>
            {filterOptions.locations.map((l) => (
              <option key={l} value={String(l).toLowerCase()}>
                {l}
              </option>
            ))}
          </select>
          <select className="filterSelect" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
            <option value="all">All status</option>
            {filterOptions.statuses.map((s) => (
              <option key={s} value={String(s).toLowerCase()}>
                {s}
              </option>
            ))}
          </select>
          <button
            className="secondaryBtn"
            type="button"
            onClick={() => {
              setQ("");
              setCrop("all");
              setLocation("all");
              setStatus("all");
            }}
          >
            Clear
          </button>
        </div>

        {filteredProjects.length === 0 ? (
          <p className="sectionSubtitle" style={{ marginTop: 14 }}>
            No active projects to show.
          </p>
        ) : (
          <div className="cardGrid">
            {filteredProjects.map((p) => (
              <FarmerProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h2 className="sectionTitle">Milestone Progress</h2>
            <p className="sectionSubtitle">Track and release funds by completing active milestones.</p>
          </div>
          <Link className="secondaryBtn" to={ROUTES.farmerMilestones}>
            View milestones
          </Link>
        </div>

        {filteredMilestoneGroups.length === 0 ? (
          <p className="sectionSubtitle" style={{ marginTop: 14 }}>No milestones available.</p>
        ) : (
          <div className="cardGrid">
            {filteredMilestoneGroups.map((g) => (
              <MilestoneTimeline key={g.projectId} title={g.title} items={g.items} />
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h2 className="sectionTitle">Recent Funds Activity</h2>
            <p className="sectionSubtitle">Latest escrow deposits and milestone releases.</p>
          </div>
          <Link className="secondaryBtn" to={ROUTES.farmerFunds}>
            Open funds
          </Link>
        </div>

        <div className="cardGrid" style={{ marginTop: 18 }}>
          {recentTxns.map((t) => (
            <div key={t.id} className="filterInput" style={{ padding: 16, borderRadius: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <strong>{t.status}</strong>
                <span className="cap">{t.date}</span>
              </div>
              <div style={{ marginTop: 6, opacity: 0.9 }}>{t.description}</div>
              <div style={{ marginTop: 10, fontWeight: 900 }}>
                {currency} {Number(t.amount || 0).toLocaleString()}
              </div>
              <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>Ref: {t.id}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
