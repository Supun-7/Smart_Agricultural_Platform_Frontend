import "../styles/preloader.css";
import logo from "../assets/logo.png";

export default function Preloader({ show }) {
  return (
    <div className={`preloader ${show ? "show" : "hide"}`} aria-hidden={!show}>
      <div className="preloader-card">
        <div className="preloader-glow" />
        <img className="preloader-logo" src={logo} alt="CHC" />
        <div className="preloader-text">Loading Ceylon Harvest Capital…</div>
        <div className="preloader-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>
  );
}