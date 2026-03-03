import { useEffect, useMemo, useState } from "react";

export function CircularProgress({ value = 0, label = "" }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const [anim, setAnim] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = anim;
    const to = pct;
    const duration = 650;

    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      const next = Math.round(from + (to - from) * eased);
      setAnim(next);
      if (p < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pct]);

  const radius = 56;
  const circumference = useMemo(() => 2 * Math.PI * radius, [radius]);
  const offset = circumference - (anim / 100) * circumference;

  return (
    <div style={{ display: "grid", justifyItems: "center", gap: 8 }}>
      <svg width="148" height="148" aria-label={label} role="img">
        {/* Use a neutral track that works on both light dashboard shell + dark theme */}
        <circle cx="74" cy="74" r={radius} stroke="rgba(24,35,27,.14)" strokeWidth="12" fill="none" />
        <circle
          cx="74"
          cy="74"
          r={radius}
          stroke="var(--brand)"
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset .15s ease" }}
        />
        {/* Explicit fill for strong contrast inside the light dashboard shell */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dy=".32em"
          fill="rgba(24,35,27,.92)"
          style={{ fontWeight: 950, fontSize: 24, paintOrder: "stroke", stroke: "rgba(244,241,234,.85)", strokeWidth: 2 }}
        >
          {anim}%
        </text>
      </svg>
      {label ? <div style={{ opacity: 0.75, fontSize: 12 }}>{label}</div> : null}
    </div>
  );
}
