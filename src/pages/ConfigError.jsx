import "../styles/pages/configError.css";

export default function ConfigError({ message }) {
  return (
    <div className="cfgWrap">
      <div className="cfgCard">
        <h1 className="cfgTitle">Configuration required</h1>
        <p className="cfgText">{message}</p>

        <div className="cfgSteps">
          <h2 className="cfgSubTitle">Fix</h2>
          <ol>
            <li>Create a <code>.env</code> file in the project root</li>
            <li>Copy values from <code>.env.example</code></li>
            <li>Restart the dev server (<code>Ctrl + C</code>, then <code>npm run dev</code>)</li>
          </ol>
        </div>

        <pre className="cfgCode">
{`VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_PUBLIC_KEY`}
        </pre>
      </div>
    </div>
  );
}
