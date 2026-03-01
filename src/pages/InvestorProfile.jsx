import { useMemo, useState } from "react";
import { loadProfile, saveProfile } from "../mock/storage.js";
import "../styles/pages/roleDash.css";

export default function InvestorProfile() {
  const initial = useMemo(() => loadProfile(), []);
  const [form, setForm] = useState({
    name: initial.name || "",
    email: initial.email || "",
    phone: initial.phone || "",
    country: initial.country || "",
    notes: initial.notes || ""
  });
  const [saved, setSaved] = useState(false);

  function onChange(e) {
    const { name, value } = e.target;
    setSaved(false);
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function onSubmit(e) {
    e.preventDefault();
    saveProfile({ ...form, role: "investor" });
    setSaved(true);
  }

  return (
    <div className="dashPage">
      <div className="pageTop">
        <h1 className="pageTitle">Profile</h1>
      </div>

      <section className="section">
        <h2 className="sectionTitle">Profile management</h2>
        <p className="sectionSubtitle">Mock data only (saved to local storage). No database.</p>

        <div className="dashGrid" style={{ gridTemplateColumns: "1.4fr .8fr" }}>
          <div className="card">
            <form className="form" onSubmit={onSubmit}>
            <label className="field">
              <span>Full name</span>
              <input className="input" name="name" value={form.name} onChange={onChange} placeholder="Your name" />
            </label>

            <label className="field">
              <span>Email</span>
              <input
                className="input"
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                placeholder="you@example.com"
              />
            </label>

            <label className="field">
              <span>Phone</span>
              <input className="input" name="phone" value={form.phone} onChange={onChange} placeholder="+94…" />
            </label>

            <label className="field">
              <span>Country</span>
              <input className="input" name="country" value={form.country} onChange={onChange} placeholder="Sri Lanka" />
            </label>

            <label className="field">
              <span>Notes</span>
              <textarea
                className="input textarea"
                name="notes"
                rows={4}
                value={form.notes}
                onChange={onChange}
                placeholder="Preferences, risk appetite, etc."
              />
            </label>

            <div style={{ display: "flex", gap: ".75rem", alignItems: "center" }}>
              <button className="btn" type="submit">
                Save changes
              </button>
              {saved ? <span style={{ color: "var(--muted)" }}>Saved to local storage.</span> : null}
            </div>
            </form>
          </div>

          <aside className="card">
            <h3 style={{ marginTop: 0, marginBottom: ".5rem" }}>Quick info</h3>
            <div style={{ display: "grid", gap: ".65rem" }}>
              <div>
                <div style={{ color: "var(--muted)", fontSize: ".9rem" }}>Role</div>
                <div style={{ fontWeight: 650 }}>Investor</div>
              </div>
              <div>
                <div style={{ color: "var(--muted)", fontSize: ".9rem" }}>Storage</div>
                <div>Saved locally in your browser. Clearing storage resets this profile.</div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
