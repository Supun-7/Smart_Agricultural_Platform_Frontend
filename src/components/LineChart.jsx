import { useEffect, useRef } from "react";

export function LineChart({ data = [], height = 220 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    const cssWidth = canvas.parentElement ? canvas.parentElement.clientWidth : 420;
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${height}px`;
    canvas.width = Math.floor(cssWidth * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.scale(dpr, dpr);

    const w = cssWidth;
    const h = height;
    ctx.clearRect(0, 0, w, h);

    const vals = data.length ? data : [0, 0, 0, 0];
    const max = Math.max(...vals, 1);
    const pad = 18;

    // Grid
    ctx.strokeStyle = "rgba(255,255,255,.08)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad + (i * (h - pad * 2)) / 4;
      ctx.beginPath();
      ctx.moveTo(pad, y);
      ctx.lineTo(w - pad, y);
      ctx.stroke();
    }

    // Line
    const stepX = (w - pad * 2) / (vals.length - 1 || 1);
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(89,193,115,.95)";

    vals.forEach((v, i) => {
      const x = pad + i * stepX;
      const y = h - pad - (v / max) * (h - pad * 2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Points
    ctx.fillStyle = "rgba(89,193,115,.95)";
    vals.forEach((v, i) => {
      const x = pad + i * stepX;
      const y = h - pad - (v / max) * (h - pad * 2);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [data, height]);

  return (
    <div style={{ width: "100%" }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
