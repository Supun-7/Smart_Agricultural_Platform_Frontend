const KEYS = [
  "role",
  "theme",
  "farmer_profile",
  "farmer_lands",
  "farmer_projects",
  "farmer_milestones",
  "farmer_funds",
  "farmer_transactions"
];

export function DataBackup() {
  function exportJSON() {
    const payload = {};
    KEYS.forEach((k) => (payload[k] = localStorage.getItem(k)));
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "chc-farmer-backup.json";
    a.click();
  }

  async function importJSON(file) {
    const text = await file.text();
    const payload = JSON.parse(text);
    Object.entries(payload).forEach(([k, v]) => {
      if (!KEYS.includes(k)) return;
      if (v === null || v === undefined) localStorage.removeItem(k);
      else localStorage.setItem(k, v);
    });
    // Force farmer-only
    localStorage.setItem("role", "farmer");
    location.reload();
  }

  return (
    <div className="filterInput" style={{ padding: 16, borderRadius: 18 }}>
      <div style={{ fontWeight: 900 }}>Backup & Restore</div>
      <div style={{ opacity: 0.75, fontSize: 13, marginTop: 4 }}>
        Export your local data as JSON or restore it on another device.
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
        <button className="secondaryBtn" type="button" onClick={exportJSON}>
          Export backup
        </button>

        <label className="secondaryBtn" style={{ cursor: "pointer" }}>
          Import backup
          <input
            type="file"
            accept="application/json"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importJSON(f);
              e.target.value = "";
            }}
          />
        </label>
      </div>
    </div>
  );
}
