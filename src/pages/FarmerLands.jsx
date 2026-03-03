import { useMemo, useState } from "react";
import { StatCard } from "../components/StatCard.jsx";
import { FarmerLandCard } from "../components/FarmerLandCard.jsx";
import { Modal } from "../components/Modal.jsx";
import { ErrorBanner } from "../components/ErrorBanner.jsx";
import { IconClipboard, IconCheck, IconClock, IconTrend } from "../components/icons.jsx";
import "../styles/pages/roleDash.css";

import { loadFarmerLands, saveFarmerLands } from "../mock/storage.js";

function nextId() {
  return `LAND-${String(Date.now()).slice(-6)}`;
}

export default function FarmerLands() {
  const [lands, setLands] = useState(() => loadFarmerLands());

  const stats = useMemo(() => {
    const total = lands.length;
    const active = lands.filter((l) => String(l.status || "").toLowerCase() === "active").length;
    const inProgress = lands.filter((l) => String(l.status || "").toLowerCase() === "in progress").length;
    const completed = lands.filter((l) => String(l.status || "").toLowerCase() === "completed").length;
    return { total, active, inProgress, completed };
  }, [lands]);

  const [open, setOpen] = useState(false);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({
    name: "",
    location: "",
    acres: "",
    crop: "",
    status: "Active",
    yieldTarget: "",
    season: ""
  });

  function onChange(e) {
    const { name, value } = e.target;
    setErr("");
    setForm((p) => ({ ...p, [name]: value }));
  }

  function openModal() {
    setErr("");
    setForm({
      name: "",
      location: "",
      acres: "",
      crop: "",
      status: "Active",
      yieldTarget: "",
      season: ""
    });
    setOpen(true);
  }

  function submit(e) {
    e.preventDefault();
    setErr("");

    if (!form.name.trim()) return setErr("Land name is required.");
    if (!form.location.trim()) return setErr("Location is required.");
    if (!form.crop.trim()) return setErr("Crop type is required.");
    if (!form.acres || Number(form.acres) <= 0) return setErr("Enter a valid acreage.");

    const next = [
      {
        id: nextId(),
        name: form.name.trim(),
        location: form.location.trim(),
        acres: Number(form.acres),
        crop: form.crop.trim(),
        status: form.status,
        yieldTarget: form.yieldTarget.trim(),
        season: form.season.trim()
      },
      ...lands
    ];

    setLands(next);
    saveFarmerLands(next);
    setOpen(false);
  }

  return (
    <div className="dashPage">
      <div className="pageTop" style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 className="pageTitle">Registered Lands</h1>
          <p className="sectionSubtitle" style={{ marginTop: 6 }}>
            Manage your land plots 
          </p>
        </div>

        <button className="primaryBtn" type="button" onClick={openModal}>
          Register new land
        </button>
      </div>

      <section className="section">
        <h2 className="sectionTitle">Overview</h2>
        <p className="sectionSubtitle">Quick stats for your registered lands.</p>

        <div className="statGrid">
          <StatCard variant="plain" kicker="Total Lands" value={String(stats.total)} icon={<IconClipboard />} />
          <StatCard variant="green" kicker="Active" value={String(stats.active)} icon={<IconCheck />} />
          <StatCard variant="brown" kicker="In Progress" value={String(stats.inProgress)} icon={<IconClock />} />
          <StatCard variant="plain" kicker="Completed" value={String(stats.completed)} icon={<IconTrend />} />
        </div>
      </section>

      <section className="section">
        <h2 className="sectionTitle">Your Lands</h2>
        <p className="sectionSubtitle">Cards are responsive and desktop-first.</p>

        {lands.length === 0 ? (
          <div className="filterInput" style={{ padding: 16, borderRadius: 18, marginTop: 14 }}>
            No lands registered yet. Click <strong>Register new land</strong> to add one.
          </div>
        ) : (
          <div className="cardGrid">
            {lands.map((l) => (
              <FarmerLandCard key={l.id} land={l} />
            ))}
          </div>
        )}
      </section>

      <Modal open={open} title="Register Land" onClose={() => setOpen(false)}>
        <ErrorBanner message={err} />

        <form className="form" onSubmit={submit}>
          <label className="filterField">
            <span>Land name</span>
            <input className="filterInput" name="name" value={form.name} onChange={onChange} placeholder="e.g. Green Valley Plot" />
          </label>

          <div className="modalGrid2">
            <label className="filterField">
              <span>Location</span>
              <input className="filterInput" name="location" value={form.location} onChange={onChange} placeholder="e.g. Kandy" />
            </label>
            <label className="filterField">
              <span>Acreage</span>
              <input className="filterInput" name="acres" type="number" min="0.1" step="0.1" value={form.acres} onChange={onChange} placeholder="e.g. 5" />
            </label>
          </div>

          <div className="modalGrid2">
            <label className="filterField">
              <span>Crop type</span>
              <input className="filterInput" name="crop" value={form.crop} onChange={onChange} placeholder="e.g. Organic Tea" />
            </label>
            <label className="filterField">
              <span>Status</span>
              <select className="filterSelect" name="status" value={form.status} onChange={onChange}>
                <option>Active</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </label>
          </div>

          <div className="modalGrid2">
            <label className="filterField">
              <span>Yield target (optional)</span>
              <input className="filterInput" name="yieldTarget" value={form.yieldTarget} onChange={onChange} placeholder="e.g. 200kg" />
            </label>
            <label className="filterField">
              <span>Season (optional)</span>
              <input className="filterInput" name="season" value={form.season} onChange={onChange} placeholder="e.g. 2026 Q2" />
            </label>
          </div>

          <button className="primaryBtn" type="submit">Save land</button>
        </form>
      </Modal>
    </div>
  );
}
