import "../styles/components/projectCard.css";

export function ProjectCard({ project, action }) {
  return (
    <article className="card">
      <div className="cardHeader">
        <h3 className="cardTitle">{project.title}</h3>
        <span className={`pill pill_${project.status || "approved"}`}>{project.status || "approved"}</span>
      </div>

      <dl className="metaGrid">
        <div className="metaItem">
          <dt>Crop</dt>
          <dd>{project.crop_type}</dd>
        </div>
        <div className="metaItem">
          <dt>Location</dt>
          <dd>{project.location}</dd>
        </div>
        <div className="metaItem">
          <dt>Budget</dt>
          <dd>LKR {Number(project.budget).toLocaleString()}</dd>
        </div>
      </dl>

      {project.details ? <p className="cardBody">{project.details}</p> : null}

      {action ? <div className="cardActions">{action}</div> : null}
    </article>
  );
}
