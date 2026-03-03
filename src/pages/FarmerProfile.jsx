import { useMemo, useState } from "react";
import { loadFarmerProfile, saveFarmerProfile } from "../mock/storage.js";
import { DataBackup } from "../components/DataBackup.jsx";
import "../styles/pages/roleDash.css";

export default function FarmerProfile() {
  const initial = useMemo(() => loadFarmerProfile(), []);
  const [form, setForm] = useState({
    name: initial.name || "",
    email: initial.email || "",
    phone: initial.phone || "",
    district: initial.district || "",
    bio: initial.bio || ""
  });
  const [saved, setSaved] = useState(false);

  function onChange(e) {
    const { name, value } = e.target;
    setSaved(false);
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function onSubmit(e) {
    e.preventDefault();
    saveFarmerProfile(form);
    setSaved(true);
  }

  return (
    <div className="dashPage">
      <div className="pageTop">
        <h1 className="pageTitle">Profile</h1>
      </div>

      <section className="section">
        <h2 className="sectionTitle">Profile management</h2>
        <p className="sectionSubtitle"></p>

        <div className="dashGrid" style={{ gridTemplateColumns: "1.4fr .8fr" }}>
          <div className="card">
            <form className="form" onSubmit={onSubmit}>
              <label className="field">
                <span>Full name</span>
                <input className="input" name="name" value={form.name} onChange={onChange} placeholder="Your name" />
              </label>

              <label className="field">
                <span>Email</span>
                <input className="input" name="email" type="email" value={form.email} onChange={onChange} placeholder="you@example.com" />
              </label>

              <label className="field">
                <span>Phone</span>
                <input className="input" name="phone" value={form.phone} onChange={onChange} placeholder="+94…" />
              </label>

              <label className="field">
                <span>District</span>
                <input className="input" name="district" value={form.district} onChange={onChange} placeholder="Kandy" />
              </label>

              <label className="field">
                <span>Short bio</span>
                <textarea className="input textarea" name="bio" rows={4} value={form.bio} onChange={onChange} placeholder="Farming focus, certifications, etc." />
              </label>

              <div style={{ display: "flex", gap: ".75rem", alignItems: "center" }}>
                <button className="btn" type="submit">Save changes</button>
                {saved ? <span style={{ color: "var(--muted)" }}>Saved to local storage.</span> : null}
              </div>
            </form>
          </div>

          
        </div>
      </section>
    </div>
  );
}
