import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MultiFileUploadField } from "../../components/FileUploadField.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { ROUTES } from "../../routes/routePaths.js";
import { farmerApi } from "../../services/api.js";
import { uploadFarmerFile } from "../../services/uploadService.js";
import "../../styles/pages/farmer/landRegistration.css";

const initialForm = {
  projectName: "",
  location: "",
  sizeAcres: "",
  cropType: "",
  description: "",
  imageUrls: "",
  totalValue: "",
  minimumInvestment: "",
};

function validate(values) {
  const errors = {};

  if (!values.projectName.trim()) errors.projectName = "Land name is required";
  if (!values.location.trim()) errors.location = "Location is required";
  if (!values.sizeAcres || Number(values.sizeAcres) <= 0) errors.sizeAcres = "Land size must be greater than 0";
  if (!values.cropType.trim()) errors.cropType = "Crop type is required";
  if (!values.description.trim()) errors.description = "Description is required";
  else if (values.description.trim().length < 20) errors.description = "Description must be at least 20 characters";
  if (!values.imageUrls.trim()) errors.imageUrls = "Please upload at least one image";
  if (!values.totalValue || Number(values.totalValue) <= 0) errors.totalValue = "Total value must be greater than 0";
  if (!values.minimumInvestment || Number(values.minimumInvestment) <= 0) errors.minimumInvestment = "Minimum investment must be greater than 0";
  if (
    values.totalValue &&
    values.minimumInvestment &&
    Number(values.minimumInvestment) > Number(values.totalValue)
  ) {
    errors.minimumInvestment = "Minimum investment cannot exceed total value";
  }

  return errors;
}

export default function FarmerLandRegistration() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState("");

  const uploadedImageCount = useMemo(
    () => form.imageUrls.split(",").filter(Boolean).length,
    [form.imageUrls]
  );

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setApiError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;

    const nextErrors = validate(form);
    setErrors(nextErrors);
    setApiError("");
    setSuccess("");

    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await farmerApi.createLand(token, {
        ...form,
        sizeAcres: Number(form.sizeAcres),
        totalValue: Number(form.totalValue),
        minimumInvestment: Number(form.minimumInvestment),
      });
      setSuccess("Land registration submitted successfully. Your listing is now visible to investors.");
      setForm(initialForm);
      setTimeout(() => navigate(ROUTES.farmerDashboard), 1000);
    } catch (err) {
      setApiError(err.message || "Failed to submit land registration.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="landRegistrationPage">
      <div className="container landRegistrationInner">
        <div className="landRegistrationHeader card">
          <div>
            <span className="farmerDashboardEyebrow">Farmer Land Registration</span>
            <h1 className="landRegistrationTitle">Create a new investment listing</h1>
            <p className="landRegistrationSub">
              Add your agricultural land details, upload images, and publish it to the investor opportunities page.
            </p>
          </div>
          <button
            type="button"
            className="btn btnGhost"
            onClick={() => navigate(ROUTES.farmerDashboard)}
          >
            Back to dashboard
          </button>
        </div>

        <form className="card landRegistrationForm" onSubmit={handleSubmit}>
          <div className="landRegistrationSection">
            <div>
              <h2>Land details</h2>
              <p>These details will be shown to investors in the listing page.</p>
            </div>

            <div className="landRegistrationGrid">
              <div className="field">
                <label htmlFor="projectName">Land name *</label>
                <input
                  id="projectName"
                  className="input"
                  value={form.projectName}
                  onChange={(e) => updateField("projectName", e.target.value)}
                  placeholder="e.g. Green Valley Paddy Land"
                />
                {errors.projectName && <span className="landFormError">{errors.projectName}</span>}
              </div>

              <div className="field">
                <label htmlFor="location">Location *</label>
                <input
                  id="location"
                  className="input"
                  value={form.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  placeholder="e.g. Kurunegala, North Western Province"
                />
                {errors.location && <span className="landFormError">{errors.location}</span>}
              </div>

              <div className="field">
                <label htmlFor="sizeAcres">Size (acres) *</label>
                <input
                  id="sizeAcres"
                  type="number"
                  min="0.1"
                  step="0.1"
                  className="input"
                  value={form.sizeAcres}
                  onChange={(e) => updateField("sizeAcres", e.target.value)}
                  placeholder="e.g. 3.5"
                />
                {errors.sizeAcres && <span className="landFormError">{errors.sizeAcres}</span>}
              </div>

              <div className="field">
                <label htmlFor="cropType">Crop type *</label>
                <input
                  id="cropType"
                  className="input"
                  value={form.cropType}
                  onChange={(e) => updateField("cropType", e.target.value)}
                  placeholder="e.g. Paddy, Corn, Vegetables"
                />
                {errors.cropType && <span className="landFormError">{errors.cropType}</span>}
              </div>

              <div className="field">
                <label htmlFor="totalValue">Project value (LKR) *</label>
                <input
                  id="totalValue"
                  type="number"
                  min="1"
                  step="0.01"
                  className="input"
                  value={form.totalValue}
                  onChange={(e) => updateField("totalValue", e.target.value)}
                  placeholder="e.g. 1500000"
                />
                {errors.totalValue && <span className="landFormError">{errors.totalValue}</span>}
              </div>

              <div className="field">
                <label htmlFor="minimumInvestment">Minimum investment (LKR) *</label>
                <input
                  id="minimumInvestment"
                  type="number"
                  min="1"
                  step="0.01"
                  className="input"
                  value={form.minimumInvestment}
                  onChange={(e) => updateField("minimumInvestment", e.target.value)}
                  placeholder="e.g. 50000"
                />
                {errors.minimumInvestment && <span className="landFormError">{errors.minimumInvestment}</span>}
              </div>
            </div>

            <div className="field">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                className="input textarea"
                rows={5}
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Describe the land, cultivation plan, accessibility, soil quality, irrigation, and why investors should fund it."
              />
              {errors.description && <span className="landFormError">{errors.description}</span>}
            </div>
          </div>

          <div className="landRegistrationSection">
            <div>
              <h2>Images</h2>
              <p>Upload clear land images. These will be stored in Supabase Storage and saved in the database as listing assets.</p>
            </div>

            <MultiFileUploadField
              label="Land photos"
              accept="image/*"
              maxFiles={5}
              onUploaded={(value) => updateField("imageUrls", value)}
              uploadFn={(file, i) => uploadFarmerFile(file, user.userId, `listing-photo-${i + 1}`)}
            />

            <div className="landRegistrationHint">
              Uploaded images: <strong>{uploadedImageCount}</strong>
            </div>
            {errors.imageUrls && <span className="landFormError">{errors.imageUrls}</span>}
          </div>

          {apiError && <div className="landFormAlert landFormAlertError">{apiError}</div>}
          {success && <div className="landFormAlert landFormAlertSuccess">{success}</div>}

          <div className="landRegistrationActions">
            <button
              type="button"
              className="btn btnGhost"
              onClick={() => navigate(ROUTES.farmerDashboard)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn" disabled={submitting}>
              {submitting ? "Submitting..." : "Create land listing"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
