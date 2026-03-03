import { Link } from "react-router-dom";
import { ROUTES } from "../routes/routePaths.js";
import "../styles/pages/notFound.css";

export default function NotFound() {
  return (
    <section className="nf">
      <h1 className="nfTitle">404</h1>
      <p className="nfText">That page doesn’t exist.</p>
      <Link className="btn" to={ROUTES.home}>Go home</Link>
    </section>
  );
}
