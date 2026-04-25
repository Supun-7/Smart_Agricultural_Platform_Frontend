import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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

function validate(values, t) {
  const errors = {};

  if (!values.projectName.trim()) errors.projectName = t("landRegistration.validation.projectName");
  if (!values.location.trim()) errors.location = t("landRegistration.validation.location");
  if (!values.sizeAcres || Number(values.sizeAcres) <= 0) errors.sizeAcres = t("landRegistration.validation.sizeAcres");
  if (!values.cropType.trim()) errors.cropType = t("landRegistration.validation.cropType");
  if (!values.description.trim()) errors.description = t("landRegistration.validation.description");
  else if (values.description.trim().length < 20) errors.description = t("landRegistration.validation.descriptionMin");
  if (!values.imageUrls.trim()) errors.imageUrls = t("landRegistration.validation.imageUrls");
  if (!values.totalValue || Number(values.totalValue) <= 0) errors.totalValue = t("landRegistration.validation.totalValue");
  if (!values.minimumInvestment || Number(values.minimumInvestment) <= 0) errors.minimumInvestment = t("landRegistration.validation.minInvestment");
  if (
    values.totalValue &&
    values.minimumInvestment &&
    Number(values.minimumInvestment) > Number(values.totalValue)
  ) {
    errors.minimumInvestment = t("landRegistration.validation.minExceedsTotal");
  }

  return errors;
}

export default function FarmerLandRegistration() {
  const { t } = useTranslation();
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

    const nextErrors = validate(form, t);
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
      setSuccess(t("landRegistration.success"));
      setForm(initialForm);
      setTimeout(() => navigate(ROUTES.farmerDashboard), 1000);
    } catch (err) {
      setApiError(err.message || t("landRegistration.errorGeneric"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="landRegistrationPage">
      <div className="container landRegistrationInner">
        <div className="landRegistrationHeader card">
          <div>
            <span className="farmerDashboardEyebrow">{t("landRegistration.eyebrow")}</span>
            <h1 className="landRegistrationTitle">{t("landRegistration.title")}</h1>
            <p className="landRegistrationSub">
              {t("landRegistration.subtitle")}
            </p>
          </div>
          <button
            type="button"
            className="btn btnGhost"
            onClick={() => navigate(ROUTES.farmerDashboard)}
          >
            {t("landRegistration.backBtn")}
          </button>
        </div>

        <form className="card landRegistrationForm" onSubmit={handleSubmit}>
          <div className="landRegistrationSection">
            <div>
              <h2>{t("landRegistration.details.title")}</h2>
              <p>{t("landRegistration.details.p")}</p>
            </div>

            <div className="landRegistrationGrid">
              <div className="field">
                <label htmlFor="projectName">{t("landRegistration.labels.projectName")}</label>
                <input
                  id="projectName"
                  className="input"
                  value={form.projectName}
                  onChange={(e) => updateField("projectName", e.target.value)}
                  placeholder={t("landRegistration.placeholders.projectName")}
                />
                {errors.projectName && <span className="landFormError">{errors.projectName}</span>}
              </div>

              <div className="field">
                <label htmlFor="location">{t("landRegistration.labels.location")}</label>
                <input
                  id="location"
                  className="input"
                  value={form.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  placeholder={t("landRegistration.placeholders.location")}
                />
                {errors.location && <span className="landFormError">{errors.location}</span>}
              </div>

              <div className="field">
                <label htmlFor="sizeAcres">{t("landRegistration.labels.sizeAcres")}</label>
                <input
                  id="sizeAcres"
                  type="number"
                  min="0.1"
                  step="0.1"
                  className="input"
                  value={form.sizeAcres}
                  onChange={(e) => updateField("sizeAcres", e.target.value)}
                  placeholder={t("landRegistration.placeholders.sizeAcres")}
                />
                {errors.sizeAcres && <span className="landFormError">{errors.sizeAcres}</span>}
              </div>

              <div className="field">
                <label htmlFor="cropType">{t("landRegistration.labels.cropType")}</label>
                <input
                  id="cropType"
                  className="input"
                  value={form.cropType}
                  onChange={(e) => updateField("cropType", e.target.value)}
                  placeholder={t("landRegistration.placeholders.cropType")}
                />
                {errors.cropType && <span className="landFormError">{errors.cropType}</span>}
              </div>

              <div className="field">
                <label htmlFor="totalValue">{t("landRegistration.labels.totalValue")}</label>
                <input
                  id="totalValue"
                  type="number"
                  min="1"
                  step="0.01"
                  className="input"
                  value={form.totalValue}
                  onChange={(e) => updateField("totalValue", e.target.value)}
                  placeholder={t("landRegistration.placeholders.totalValue")}
                />
                {errors.totalValue && <span className="landFormError">{errors.totalValue}</span>}
              </div>

              <div className="field">
                <label htmlFor="minimumInvestment">{t("landRegistration.labels.minimumInvestment")}</label>
                <input
                  id="minimumInvestment"
                  type="number"
                  min="1"
                  step="0.01"
                  className="input"
                  value={form.minimumInvestment}
                  onChange={(e) => updateField("minimumInvestment", e.target.value)}
                  placeholder={t("landRegistration.placeholders.minimumInvestment")}
                />
                {errors.minimumInvestment && <span className="landFormError">{errors.minimumInvestment}</span>}
              </div>
            </div>

            <div className="field">
              <label htmlFor="description">{t("landRegistration.labels.description")}</label>
              <textarea
                id="description"
                className="input textarea"
                rows={5}
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder={t("landRegistration.placeholders.description")}
              />
              {errors.description && <span className="landFormError">{errors.description}</span>}
            </div>
          </div>

          <div className="landRegistrationSection">
            <div>
              <h2>{t("landRegistration.images.title")}</h2>
              <p>{t("landRegistration.images.p")}</p>
            </div>

            <MultiFileUploadField
              label={t("landRegistration.images.label")}
              accept="image/*"
              maxFiles={5}
              onUploaded={(value) => updateField("imageUrls", value)}
              uploadFn={(file, i) => uploadFarmerFile(file, user.userId, `listing-photo-${i + 1}`)}
            />

            <div className="landRegistrationHint">
              {t("landRegistration.images.hint")} <strong>{uploadedImageCount}</strong>
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
              {t("landRegistration.actions.cancel")}
            </button>
            <button type="submit" className="btn" disabled={submitting}>
              {submitting ? t("landRegistration.actions.submitting") : t("landRegistration.actions.submit")}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
