import "../styles/components/loader.css";

export function Loader({ label = "Loading..." }) {
  return (
    <div className="loaderWrap" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <span className="loaderLabel">{label}</span>
    </div>
  );
}
