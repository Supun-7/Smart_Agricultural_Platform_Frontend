import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { gateApi, investorApi, farmerApi } from "../services/api";
import { ROUTES } from "../routes/routePaths";
import { uploadKycFile, uploadFarmerFile } from "../services/uploadService";
import "../styles/pages/gate.css";

// ─────────────────────────────────────────────────────────────
// FILE UPLOAD FIELD
// ─────────────────────────────────────────────────────────────
function FileUploadField({ label, labelSi, accept = "image/*,.pdf", required, onUploaded, uploadFn }) {
  const [status,   setStatus]   = useState("idle");
  const [fileName, setFileName] = useState("");
  const [error,    setError]    = useState("");

  async function handleChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setStatus("uploading");
    setError("");
    try {
      const url = await uploadFn(file);
      setStatus("done");
      onUploaded(url);
    } catch (err) {
      setStatus("error");
      setError(err.message);
    }
  }

  return (
    <div className="field">
      <span style={{ display: "flex", flexDirection: "column", gap: ".1rem" }}>
        <span>
          {label}
          {required && <span className="gateRequired"> *</span>}
        </span>
        {labelSi && (
          <span style={{ fontSize: ".78rem", color: "var(--muted)", fontWeight: 400 }}>
            {labelSi}
          </span>
        )}
      </span>

      <label className={`uploadBox ${status}`}>
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          style={{ display: "none" }}
          disabled={status === "uploading"}
        />
        <div className="uploadInner">
          {status === "idle" && (
            <>
              <span className="uploadIcon">📎</span>
              <span className="uploadText">Click to upload</span>
              <span className="uploadHint">
                {accept.includes("pdf") ? "PDF or image" : "Image file"}
              </span>
            </>
          )}
          {status === "uploading" && (
            <>
              <div className="uploadSpin" />
              <span className="uploadText">Uploading…</span>
            </>
          )}
          {status === "done" && (
            <>
              <span style={{ fontSize: "1.4rem" }}>✅</span>
              <span className="uploadText" style={{ color: "var(--brand)" }}>
                {fileName}
              </span>
              <span className="uploadHint">Click to replace</span>
            </>
          )}
          {status === "error" && (
            <>
              <span style={{ fontSize: "1.4rem" }}>❌</span>
              <span className="uploadText" style={{ color: "var(--danger)" }}>
                Failed — click to retry
              </span>
            </>
          )}
        </div>
      </label>

      {error && (
        <span style={{ fontSize: ".8rem", color: "var(--danger)" }}>{error}</span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MULTI FILE UPLOAD FIELD — top level, NOT inside FileUploadField
// ─────────────────────────────────────────────────────────────
function MultiFileUploadField({ label, labelSi, accept = "image/*", onUploaded, uploadFn, maxFiles = 5 }) {
  const [files,     setFiles]     = useState([]);
  const [uploading, setUploading] = useState(false);

  async function handleChange(e) {
    const selected = Array.from(e.target.files).slice(0, maxFiles);
    if (!selected.length) return;

    setUploading(true);
    const results = [];

    for (let i = 0; i < selected.length; i++) {
      const file = selected[i];
      try {
        const url = await uploadFn(file, i);
        results.push({ name: file.name, status: "done", url });
      } catch (err) {
        results.push({ name: file.name, status: "error", url: "", error: err.message });
      }
    }

    setFiles(results);
    setUploading(false);

    const urls = results
      .filter(r => r.status === "done")
      .map(r => r.url)
      .join(",");

    onUploaded(urls);
  }

  const status = uploading ? "uploading" : files.length ? "done" : "idle";

  return (
    <div className="field">
      <span style={{ display: "flex", flexDirection: "column", gap: ".1rem" }}>
        <span>{label}</span>
        {labelSi && (
          <span style={{ fontSize: ".78rem", color: "var(--muted)", fontWeight: 400 }}>
            {labelSi}
          </span>
        )}
      </span>

      <label className={`uploadBox ${status}`}>
        <input
          type="file"
          accept={accept}
          multiple
          onChange={handleChange}
          style={{ display: "none" }}
          disabled={uploading}
        />
        <div className="uploadInner">
          {status === "idle" && (
            <>
              <span className="uploadIcon">🖼️</span>
              <span className="uploadText">
                Click to upload up to {maxFiles} photos
              </span>
              <span className="uploadHint">
                ඡායාරූප {maxFiles}ක් දක්වා උඩුගත කරන්න
              </span>
            </>
          )}
          {status === "uploading" && (
            <>
              <div className="uploadSpin" />
              <span className="uploadText">Uploading… / උඩුගත කරමින්…</span>
            </>
          )}
          {status === "done" && (
            <>
              <span style={{ fontSize: "1.4rem" }}>✅</span>
              <span className="uploadText" style={{ color: "var(--brand)" }}>
                {files.filter(f => f.status === "done").length} photo(s) uploaded
              </span>
              <span className="uploadHint">Click to upload more / තවත් එකතු කරන්න</span>
            </>
          )}
        </div>
      </label>

      {files.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: ".25rem", marginTop: ".3rem" }}>
          {files.map((f, i) => (
            <div key={i} style={{
              fontSize: ".8rem",
              color: f.status === "done" ? "var(--brand)" : "var(--danger)",
              display: "flex", gap: ".4rem",
            }}>
              <span>{f.status === "done" ? "✓" : "✗"}</span>
              <span>{f.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LOADING
// ─────────────────────────────────────────────────────────────
function GateLoading() {
  return (
    <div className="gateWrap">
      <div className="gateCard">
        <div className="gateSpin" />
        <p className="gateSub">Checking your access…</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// INVESTOR KYC FORM — 3 sections
// ─────────────────────────────────────────────────────────────
function InvestorKycForm({ onSubmitted }) {
  const { token, user } = useAuth();

  const TOTAL = 3;
  const [section, setSection] = useState(1);

  const [title,       setTitle]       = useState("Mr");
  const [firstName,   setFirstName]   = useState("");
  const [lastName,    setLastName]    = useState("");
  const [age,         setAge]         = useState("");
  const [nationality, setNationality] = useState("Sri Lankan");

  const [occupation, setOccupation] = useState("");
  const [address,    setAddress]    = useState("");
  const [idType,     setIdType]     = useState("NIC");
  const [idNumber,   setIdNumber]   = useState("");

  const [idFrontUrl,     setIdFrontUrl]     = useState("");
  const [idBackUrl,      setIdBackUrl]      = useState("");
  const [utilityBillUrl, setUtilityBillUrl] = useState("");
  const [bankStmtUrl,    setBankStmtUrl]    = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");

  function canProceed() {
    if (section === 1) return firstName.trim() && lastName.trim() && age && nationality.trim();
    if (section === 2) return occupation.trim() && address.trim() && idNumber.trim();
    if (section === 3) return idFrontUrl && idBackUrl && utilityBillUrl && bankStmtUrl;
    return true;
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      await investorApi.submitKyc(token, {
        title, firstName, lastName,
        age: parseInt(age),
        nationality,
        currentOccupation: occupation,
        address, idType, idNumber,
        idFrontUrl, idBackUrl,
        utilityBillUrl, bankStmtUrl,
      });
      onSubmitted();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const LABELS = ["Personal", "Contact & ID", "Documents"];

  return (
    <div className="gateWrap">
      <div className="gateCard">

        <div style={{ textAlign: "center" }}>
          <div className="gateIcon">📋</div>
          <h2 className="gateTitle">KYC Verification</h2>
          <p className="gateSub">Complete all sections to verify your identity</p>
          <p className="gateSub">You must be at least 18 years old to register</p>
        </div>

        <div className="gateProgress">
          {LABELS.map((label, i) => (
            <div key={i} className="gateProgressItem">
              <div className={`gateProgressDot ${
                i + 1 < section  ? "done"   :
                i + 1 === section ? "active" : "inactive"
              }`}>
                {i + 1 < section ? "✓" : i + 1}
              </div>
              <span className={`gateProgressLabel ${
                i + 1 <= section ? "active" : "inactive"
              }`}>
                {label}
              </span>
            </div>
          ))}
          <div className={`gateProgressLine line1 ${section > 1 ? "done" : "inactive"}`} />
          <div className={`gateProgressLine line2 ${section > 2 ? "done" : "inactive"}`} />
        </div>

        <div className="gateDivider" />

        {section === 1 && (
          <div className="form">
            <div className="gateSectionTitle">Personal Details</div>
            <div className="field">
              <span>Title</span>
              <select className="input" value={title} onChange={e => setTitle(e.target.value)}>
                {["Mr","Mrs","Miss","Ms","Dr","Rev"].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="gateGrid2">
              <div className="field">
                <span>First Name <span className="gateRequired">*</span></span>
                <input className="input" type="text" placeholder="e.g. Nimal"
                  value={firstName} onChange={e => setFirstName(e.target.value)} required />
              </div>
              <div className="field">
                <span>Last Name <span className="gateRequired">*</span></span>
                <input className="input" type="text" placeholder="e.g. Silva"
                  value={lastName} onChange={e => setLastName(e.target.value)} required />
              </div>
            </div>
            <div className="gateGrid13">
              <div className="field">
                <span>Age <span className="gateRequired">*</span></span>
                <input className="input" type="number" placeholder="35"
                  value={age} onChange={e => setAge(e.target.value)}
                  min="18" max="100" required />
              </div>
              <div className="field">
                <span>Nationality <span className="gateRequired">*</span></span>
                <input className="input" type="text" placeholder="e.g. Sri Lankan"
                  value={nationality} onChange={e => setNationality(e.target.value)} required />
              </div>
            </div>
          </div>
        )}

        {section === 2 && (
          <div className="form">
            <div className="gateSectionTitle">Contact &amp; Identity</div>
            <div className="field">
              <span>Current Occupation <span className="gateRequired">*</span></span>
              <input className="input" type="text" placeholder="e.g. Business Owner"
                value={occupation} onChange={e => setOccupation(e.target.value)} required />
            </div>
            <div className="field">
              <span>Residential Address <span className="gateRequired">*</span></span>
              <textarea className="input textarea" rows={3}
                placeholder="Full address including city and postal code"
                value={address} onChange={e => setAddress(e.target.value)} required />
            </div>
            <div className="gateGrid13">
              <div className="field">
                <span>ID Type <span className="gateRequired">*</span></span>
                <select className="input" value={idType} onChange={e => setIdType(e.target.value)}>
                  <option value="NIC">NIC</option>
                  <option value="PASSPORT">Passport</option>
                </select>
              </div>
              <div className="field">
                <span>
                  {idType === "NIC" ? "NIC Number" : "Passport Number"}
                  <span className="gateRequired"> *</span>
                </span>
                <input className="input" type="text"
                  placeholder={idType === "NIC" ? "e.g. 199012345678" : "e.g. N1234567"}
                  value={idNumber} onChange={e => setIdNumber(e.target.value)} required />
              </div>
            </div>
          </div>
        )}

        {section === 3 && (
          <div className="form">
            <div className="gateSectionTitle">Document Uploads</div>
            <p className="gateSectionNote">
              All documents must be clear and legible.
              Bank statement must be within the last 6 months.
            </p>
            <FileUploadField
              label={`${idType} — Front Page`}
              accept="image/*,.pdf" required
              onUploaded={setIdFrontUrl}
              uploadFn={file => uploadKycFile(file, user.userId, "id-front")}
            />
            <FileUploadField
              label={`${idType} — Back Page`}
              accept="image/*,.pdf" required
              onUploaded={setIdBackUrl}
              uploadFn={file => uploadKycFile(file, user.userId, "id-back")}
            />
            <FileUploadField
              label="Utility Bill"
              accept=".pdf,image/*" required
              onUploaded={setUtilityBillUrl}
              uploadFn={file => uploadKycFile(file, user.userId, "utility-bill")}
            />
            <FileUploadField
              label="Bank Statement (within 6 months)"
              accept=".pdf,image/*" required
              onUploaded={setBankStmtUrl}
              uploadFn={file => uploadKycFile(file, user.userId, "bank-statement")}
            />
          </div>
        )}

        {error && <div className="gateError">{error}</div>}
        <div className="gateDivider" />

        <div className="gateNavRow">
          {section > 1 && (
            <button className="btn btnBlock btnGhost"
              onClick={() => setSection(s => s - 1)}>
              ← Back
            </button>
          )}
          {section < TOTAL && (
            <button className="btn btnBlock"
              onClick={() => setSection(s => s + 1)}
              disabled={!canProceed()}>
              Continue →
            </button>
          )}
          {section === TOTAL && (
            <button className="btn btnBlock"
              onClick={handleSubmit}
              disabled={submitting || !canProceed()}>
              {submitting ? "Submitting…" : "Submit KYC Application"}
            </button>
          )}
        </div>

        <p className="gateStepNote">
          Step {section} of {TOTAL} — Fields marked
          <span className="gateRequired"> *</span> are required
        </p>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FARMER REGISTRATION FORM — bilingual සිංහල / English
// ─────────────────────────────────────────────────────────────
function FarmerRegistrationForm({ onSubmitted }) {
  const { token, user } = useAuth();

  const TOTAL = 3;
  const [section, setSection] = useState(1);

  const [farmerName,       setFarmerName]       = useState("");
  const [surname,          setSurname]          = useState("");
  const [familyName,       setFamilyName]       = useState("");
  const [nicNumber,        setNicNumber]        = useState("");
  const [address,          setAddress]          = useState("");
  const [farmAddress,      setFarmAddress]      = useState("");
  const [farmLocation,     setFarmLocation]     = useState("");
  const [yearStarted,      setYearStarted]      = useState("");
  const [landSizeAcres,    setLandSizeAcres]    = useState("");
  const [cropTypes,        setCropTypes]        = useState("");
  const [landMeasurements, setLandMeasurements] = useState("");
  const [nicFrontUrl,      setNicFrontUrl]      = useState("");
  const [nicBackUrl,       setNicBackUrl]       = useState("");
  const [landPhotoUrls,    setLandPhotoUrls]    = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");

  function canProceed() {
    if (section === 1)
      return farmerName.trim() && surname.trim() && nicNumber.trim() && address.trim();
    if (section === 2)
      return farmAddress.trim() && farmLocation.trim() && yearStarted && cropTypes.trim();
    if (section === 3)
      return nicFrontUrl && nicBackUrl;
    return true;
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      await farmerApi.submitApplication(token, {
        farmerName, surname, familyName,
        nicNumber, address, farmAddress, farmLocation,
        yearStarted:   parseInt(yearStarted),
        landSizeAcres: landSizeAcres ? parseFloat(landSizeAcres) : null,
        cropTypes, landMeasurements,
        nicFrontUrl, nicBackUrl, landPhotoUrls,
      });
      onSubmitted();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function BiLabel({ en, si, required }) {
    return (
      <span style={{ display: "flex", flexDirection: "column", gap: ".1rem" }}>
        <span>
          {en}
          {required && <span className="gateRequired"> *</span>}
        </span>
        <span style={{ fontSize: ".78rem", color: "var(--muted)", fontWeight: 400 }}>
          {si}
        </span>
      </span>
    );
  }

  const LABELS = ["Personal / පෞද්ගලික", "Farm / ගොවිපල", "Documents / ලේඛන"];

  return (
    <div className="gateWrap">
      <div className="gateCard">

        <div style={{ textAlign: "center" }}>
          <div className="gateIcon">🌾</div>
          <h2 className="gateTitle">Farm Registration</h2>
          <p style={{ margin: 0, fontSize: "1rem", color: "var(--muted)", fontWeight: 500 }}>
            ගොවිපල ලියාපදිංචිය
          </p>
          <p className="gateSub" style={{ marginTop: ".4rem" }}>
            Complete all sections to register your farm
          </p>
        </div>

        <div className="gateProgress">
          {LABELS.map((label, i) => (
            <div key={i} className="gateProgressItem">
              <div className={`gateProgressDot ${
                i + 1 < section  ? "done"   :
                i + 1 === section ? "active" : "inactive"
              }`}>
                {i + 1 < section ? "✓" : i + 1}
              </div>
              <span className={`gateProgressLabel ${
                i + 1 <= section ? "active" : "inactive"
              }`}
                style={{ fontSize: ".65rem", textAlign: "center", maxWidth: 70 }}
              >
                {label}
              </span>
            </div>
          ))}
          <div className={`gateProgressLine line1 ${section > 1 ? "done" : "inactive"}`} />
          <div className={`gateProgressLine line2 ${section > 2 ? "done" : "inactive"}`} />
        </div>

        <div className="gateDivider" />

        {section === 1 && (
          <div className="form">
            <div className="gateSectionTitle">
              Personal Details — පෞද්ගලික තොරතුරු
            </div>
            <div className="gateGrid2">
              <div className="field">
                <BiLabel en="First Name" si="මුල් නම" required />
                <input className="input" type="text"
                  placeholder="e.g. Kamal / කමල්"
                  value={farmerName} onChange={e => setFarmerName(e.target.value)} required />
              </div>
              <div className="field">
                <BiLabel en="Surname" si="අවසාන නම" required />
                <input className="input" type="text"
                  placeholder="e.g. Perera / පෙරේරා"
                  value={surname} onChange={e => setSurname(e.target.value)} required />
              </div>
            </div>
            <div className="field">
              <BiLabel en="Family / Clan Name" si="පවුලේ නම / ගෝත්‍ර නාමය" />
              <input className="input" type="text"
                placeholder="e.g. Bandara / බණ්ඩාර"
                value={familyName} onChange={e => setFamilyName(e.target.value)} />
            </div>
            <div className="field">
              <BiLabel en="NIC Number" si="ජාතික හැඳුනුම්පත් අංකය" required />
              <input className="input" type="text"
                placeholder="e.g. 199012345678"
                value={nicNumber} onChange={e => setNicNumber(e.target.value)} required />
            </div>
            <div className="field">
              <BiLabel en="Home Address" si="නිවාස ලිපිනය" required />
              <textarea className="input textarea" rows={3}
                placeholder="No. 12, Kandy Road, Kurunegala..."
                value={address} onChange={e => setAddress(e.target.value)} required />
            </div>
          </div>
        )}

        {section === 2 && (
          <div className="form">
            <div className="gateSectionTitle">
              Farm Details — ගොවිපල තොරතුරු
            </div>
            <div className="field">
              <BiLabel en="Farm Address" si="ගොවිපල ලිපිනය" required />
              <textarea className="input textarea" rows={2}
                placeholder="Farm location full address..."
                value={farmAddress} onChange={e => setFarmAddress(e.target.value)} required />
            </div>
            <div className="field">
              <BiLabel en="District / Province" si="දිස්ත්‍රික්කය / පළාත" required />
              <input className="input" type="text"
                placeholder="e.g. Kurunegala, North Western Province"
                value={farmLocation} onChange={e => setFarmLocation(e.target.value)} required />
            </div>
            <div className="gateGrid2">
              <div className="field">
                <BiLabel en="Year Started Farming" si="ගොවිතැන් ආරම්භ කළ වර්ෂය" required />
                <input className="input" type="number" placeholder="e.g. 2005"
                  value={yearStarted} onChange={e => setYearStarted(e.target.value)}
                  min="1950" max={new Date().getFullYear()} required />
              </div>
              <div className="field">
                <BiLabel en="Land Size (acres)" si="ඉඩම් ප්‍රමාණය (අක්කර)" />
                <input className="input" type="number" placeholder="e.g. 2.5"
                  value={landSizeAcres} onChange={e => setLandSizeAcres(e.target.value)}
                  min="0" step="0.1" />
              </div>
            </div>
            <div className="field">
              <BiLabel en="Current Crops / Food Farming" si="වර්තමාන බෝග / ආහාර වගාව" required />
              <input className="input" type="text"
                placeholder="e.g. Paddy, Vegetables / වී, එළවළු"
                value={cropTypes} onChange={e => setCropTypes(e.target.value)} required />
            </div>
            <div className="field">
              <BiLabel en="Land Measurements / Boundaries" si="ඉඩම් මිනුම් / සීමා" />
              <textarea className="input textarea" rows={2}
                placeholder="e.g. North 120ft, South 120ft, East 80ft, West 80ft"
                value={landMeasurements} onChange={e => setLandMeasurements(e.target.value)} />
            </div>
          </div>
        )}

        {section === 3 && (
          <div className="form">
            <div className="gateSectionTitle">
              Document Uploads — ලේඛන උඩුගත කිරීම
            </div>
            <p className="gateSectionNote">
              Please upload clear photos. /
              කරුණාකර පැහැදිලි ඡායාරූප උඩුගත කරන්න.
            </p>
            <FileUploadField
              label="NIC — Front"
              labelSi="ජාතික හැඳුනුම්පත — ඉදිරිපස"
              accept="image/*,.pdf" required
              onUploaded={setNicFrontUrl}
              uploadFn={file => uploadFarmerFile(file, user.userId, "nic-front")}
            />
            <FileUploadField
              label="NIC — Back"
              labelSi="ජාතික හැඳුනුම්පත — පිටුපස"
              accept="image/*,.pdf" required
              onUploaded={setNicBackUrl}
              uploadFn={file => uploadFarmerFile(file, user.userId, "nic-back")}
            />
            <MultiFileUploadField
              label="Land Photos (with measurements visible)"
              labelSi="ඉඩම් ඡායාරූප (මිනුම් පෙනෙන ආකාරයෙන්)"
              accept="image/*"
              maxFiles={5}
              onUploaded={setLandPhotoUrls}
              uploadFn={(file, i) =>
                uploadFarmerFile(file, user.userId, `land-photo-${i + 1}`)
              }
            />
          </div>
        )}

        {error && <div className="gateError">{error}</div>}
        <div className="gateDivider" />

        <div className="gateNavRow">
          {section > 1 && (
            <button className="btn btnBlock btnGhost"
              onClick={() => setSection(s => s - 1)}>
              ← Back / ආපසු
            </button>
          )}
          {section < TOTAL && (
            <button className="btn btnBlock"
              onClick={() => setSection(s => s + 1)}
              disabled={!canProceed()}>
              Continue / ඉදිරියට →
            </button>
          )}
          {section === TOTAL && (
            <button className="btn btnBlock"
              onClick={handleSubmit}
              disabled={submitting || !canProceed()}>
              {submitting
                ? "Submitting… / ඉදිරිපත් කරමින්…"
                : "Submit Registration / ලියාපදිංචිය ඉදිරිපත් කරන්න"}
            </button>
          )}
        </div>

        <p className="gateStepNote">
          Step {section} of {TOTAL} — Fields marked
          <span className="gateRequired"> *</span> are required /
          <span style={{ fontSize: ".72rem" }}> * සලකුණු කළ කොටස් අනිවාර්ය වේ</span>
        </p>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PENDING SCREEN
// ─────────────────────────────────────────────────────────────
function PendingScreen({ role }) {
  return (
    <div className="gateWrap">
      <div className="gateCard">
        <div className="gateIcon">⏳</div>
        <div className="gateBadge gateBadgePending">Under Review</div>
        <h2 className="gateTitle">Thank you for your patience</h2>
        <p className="gateSub">
          {role === "INVESTOR"
            ? "Your KYC documents have been received and are being reviewed by our compliance team."
            : "Your farm registration has been received and is being reviewed by our team."}
        </p>
        <div className="gateDivider" />
        <div className="gateSteps">
          {[
            "Submission received ✓",
            "Admin review in progress…",
            "You will be notified upon approval",
          ].map((s, i) => (
            <div key={i} className="gateStep">
              <span className="gateStepNum">{i + 1}</span>
              <span>{s}</span>
            </div>
          ))}
        </div>
        <p className="gateSub" style={{ fontSize: ".82rem" }}>
          Typical review time: 1–2 business days
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FAILED SCREEN
// ─────────────────────────────────────────────────────────────
function FailedScreen({ role, reason, onResubmit }) {
  return (
    <div className="gateWrap">
      <div className="gateCard">
        <div className="gateIcon">❌</div>
        <div className="gateBadge gateBadgeFailed">Not Approved</div>
        <h2 className="gateTitle">
          {role === "INVESTOR" ? "KYC Verification Failed" : "Farm Registration Rejected"}
        </h2>
        <p className="gateSub">
          Your submission was not approved. Please review the reason below and resubmit.
        </p>
        {reason && (
          <div className="gateReason">
            <div className="gateReasonLabel">Reason from admin</div>
            {reason}
          </div>
        )}
        <div className="gateActions">
          <button className="btn btnBlock" onClick={onResubmit}>
            {role === "INVESTOR" ? "Resubmit KYC Documents" : "Resubmit Farm Registration"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ERROR SCREEN
// ─────────────────────────────────────────────────────────────
function ErrorScreen({ message, onRetry, onSignOut }) {
  return (
    <div className="gateWrap">
      <div className="gateCard">
        <div className="gateIcon">⚠️</div>
        <h2 className="gateTitle">Something went wrong</h2>
        <div className="gateError">{message}</div>
        <div className="gateActions">
          <button className="btn btnBlock" onClick={onRetry}>Try again</button>
          <button className="btn btnBlock btnGhost" onClick={onSignOut}>Sign out</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN GATE PAGE
// ─────────────────────────────────────────────────────────────
export default function GatePage() {
  const { token, role, signOut } = useAuth();
  const navigate = useNavigate();

  const [checking,  setChecking]  = useState(true);
  const [gateState, setGateState] = useState(null);
  const [error,     setError]     = useState("");

  async function checkGate() {
    setChecking(true);
    setError("");
    try {
      const result = await gateApi.check(token);
      setGateState(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    if (!token) {
      navigate(ROUTES.login, { replace: true });
      return;
    }
    checkGate();
  }, [token]);

  useEffect(() => {
    if (!gateState) return;
    if (gateState.status === "PROCEED") {
      const dest = {
        FARMER:   ROUTES.farmer,
        INVESTOR: ROUTES.investor,
        AUDITOR:  ROUTES.auditor,
        ADMIN:    ROUTES.admin,
      }[role] ?? ROUTES.home;
      navigate(dest, { replace: true });
    }
  }, [gateState, role, navigate]);

  if (checking)   return <GateLoading />;
  if (error)      return <ErrorScreen message={error} onRetry={checkGate} onSignOut={signOut} />;
  if (!gateState) return <GateLoading />;

  const { status, reason } = gateState;

  if (status === "NOT_SUBMITTED") {
    return role === "INVESTOR"
      ? <InvestorKycForm        onSubmitted={checkGate} />
      : <FarmerRegistrationForm onSubmitted={checkGate} />;
  }

  if (status === "PENDING") return <PendingScreen role={role} />;

  if (status === "FAILED") return (
    <FailedScreen
      role={role}
      reason={reason}
      onResubmit={() => { setGateState(null); setChecking(false); }}
    />
  );

  return <GateLoading />;
}