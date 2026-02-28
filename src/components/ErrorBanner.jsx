import "../styles/components/errorBanner.css";

export function ErrorBanner({ title = "Something went wrong", message }) {
  if (!message) return null;
  return (
    <div className="errorBanner" role="alert">
      <strong className="errorTitle">{title}</strong>
      <div className="errorMsg">{message}</div>
    </div>
  );
}
