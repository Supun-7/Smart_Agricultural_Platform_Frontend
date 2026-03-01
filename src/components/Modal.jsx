import "../styles/components/modal.css";

export function Modal({ open, title, children, onClose }) {
  return (
    <div className={`modal ${open ? "open" : ""}`} aria-hidden={!open}>
      <button type="button" className="modalOverlay" onClick={onClose} aria-label="Close modal" />
      <div className="modalCard" role="dialog" aria-modal="true">
        <div className="modalHeader">
          <h3 className="modalTitle">{title}</h3>
          <button type="button" className="modalClose" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="modalBody">{children}</div>
      </div>
    </div>
  );
}
