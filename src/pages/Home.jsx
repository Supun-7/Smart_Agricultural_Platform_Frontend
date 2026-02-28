import { useEffect, useState, useRef } from "react";
import logo from "../assets/logo.png";
import "../styles/pages/home.css";

/* ─────────────────────────────────────────────
   STAGE DATA — the CHC story
───────────────────────────────────────────── */
const STAGES = [
  {
    id: 0,
    icon: "💰",
    title: "Investor Funds the Farm",
    desc: "Investors choose from verified Sri Lankan farms and projects — paddy lands, greenhouses, agri-innovations. You decide where your capital grows. Every rupee goes directly to a real farmer with a real plan.",
    tags: ["Choose Your Farm", "Verified Projects", "Land & Innovation"],
    roi: "You Invest",
    roiSub: "Select · Fund · Track in real time",
    roiColor: "#59c173",
    treePhase: "seed",
  },
  {
    id: 1,
    icon: "📜",
    title: "Smart Contract. Public. Immutable.",
    desc: "The moment your investment is confirmed, a transparent contract is automatically generated and made visible to everyone — investor, farmer, and the public. No middlemen. No hidden terms. Full accountability on-chain.",
    tags: ["Auto-Generated", "Public Ledger", "Zero Middlemen", "Tamper-Proof"],
    roi: "100% Transparent",
    roiSub: "Contract visible to all parties always",
    roiColor: "#59c173",
    treePhase: "sapling",
  },
  {
    id: 2,
    icon: "🌾",
    title: "Farmers Earn by Performance",
    desc: "Funds are released to farmers in milestones — tied to real agricultural performance. Planting, growth, harvest. Farmers are motivated, accountable and rewarded fairly. Your investment grows as the crop does.",
    tags: ["Milestone Payments", "Performance-Based", "Fair to Farmers"],
    roi: "8–18% p.a.",
    roiSub: "Returns tied to real harvest performance",
    roiColor: "#c8a84b",
    treePhase: "tree",
  },
  {
    id: 3,
    icon: "📈",
    title: "Harvest Your Returns. Or Trade.",
    desc: "After the agreed period, you receive your ROI — profit from real harvests. Don't want to wait? You can sell your investor share on the open market at the current price. Your investment is liquid, flexible and always yours.",
    tags: ["ROI Payout", "Sell Your Share", "Market Price", "Your Choice"],
    roi: "30%+ Total ROI",
    roiSub: "Redeem returns · Or sell share anytime",
    roiColor: "#c8a84b",
    treePhase: "fruits",
  },
];

const STAGE_BREAKS = [0, 0.24, 0.50, 0.74];

/* ─────────────────────────────────────────────
   VISION DATA
───────────────────────────────────────────── */
const VISION_CARDS = [
  {
    icon: "🌍",
    title: "Our Vision",
    desc: "A Sri Lanka where every farmer owns a piece of the prosperity they create — and every investor is part of the harvest.",
  },
  {
    icon: "🎯",
    title: "Our Mission",
    desc: "To connect agricultural capital with farming talent through transparent, performance-driven investment contracts that work for both sides.",
  },
  {
    icon: "⚖️",
    title: "Our Promise",
    desc: "Full transparency, zero hidden fees, and returns that are earned from real soil — not speculation. Trust built from the ground up.",
  },
];

/* ─────────────────────────────────────────────
   PARTICLES
───────────────────────────────────────────── */
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${10 + (i * 37 + 13) % 80}%`,
  top: `${5 + (i * 53 + 7) % 50}%`,
  size: 2 + (i % 3),
  delay: `${(i * 0.7) % 4}s`,
  duration: `${3 + (i % 3)}s`,
}));

/* ─────────────────────────────────────────────
   FIELD ROW
───────────────────────────────────────────── */
function FieldRow({ height }) {
  return (
    <div className="field-row">
      {Array.from({ length: 30 }, (_, i) => (
        <div key={i} className="stalk">
          <div className="stalk-head" />
          <div className="stalk-body" style={{ height }} />
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   HERO FARMER
───────────────────────────────────────────── */
function HeroFarmer() {
  return (
    <svg width="130" height="220" viewBox="0 0 130 220"
      xmlns="http://www.w3.org/2000/svg"
      style={{ animation: "farmerLean 2s ease-in-out infinite" }}>
      <defs>
        <radialGradient id="skinHF" cx="50%" cy="40%">
          <stop offset="0%" stopColor="#e8a87c" />
          <stop offset="100%" stopColor="#c07840" />
        </radialGradient>
      </defs>
      <ellipse cx="58" cy="218" rx="36" ry="6" fill="rgba(0,0,0,.22)" />
      <ellipse cx="58" cy="46" rx="50" ry="11" fill="#d4a830" />
      <ellipse cx="58" cy="36" rx="30" ry="15" fill="#c09020" />
      <rect x="28" y="36" width="60" height="10" fill="#c09020" />
      <rect x="28" y="44" width="60" height="4" fill="#7a5010" opacity=".5" />
      <ellipse cx="58" cy="64" rx="20" ry="22" fill="url(#skinHF)" />
      <ellipse cx="44" cy="69" rx="6" ry="4" fill="rgba(220,100,80,.22)" />
      <ellipse cx="72" cy="69" rx="6" ry="4" fill="rgba(220,100,80,.22)" />
      <ellipse cx="51" cy="62" rx="2.5" ry="3" fill="#1a1208" />
      <ellipse cx="65" cy="62" rx="2.5" ry="3" fill="#1a1208" />
      <path d="M76 56 Q79 50 82 56 Q82 61 79 63 Q76 61 76 56Z"
        fill="rgba(100,180,255,.6)" />
      <path d="M50 72 Q58 77 66 72" stroke="#2a1a0a" strokeWidth="1.5"
        fill="none" strokeLinecap="round" />
      <rect x="52" y="84" width="12" height="10" fill="url(#skinHF)" />
      <path d="M22 96 Q32 86 52 90 L58 100 L64 90 Q84 86 94 96 L96 168 L20 168 Z"
        fill="#4a9a3c" />
      <path d="M22 96 Q32 86 52 90 L50 168 L20 168 Z" fill="rgba(0,0,0,.07)" />
      <g style={{ transformOrigin: "22px 98px", animation: "hoeSwing 1.4s ease-in-out infinite" }}>
        <path d="M22 98 Q6 118 4 142" stroke="#4a9a3c" strokeWidth="14"
          strokeLinecap="round" fill="none" />
        <path d="M4 142 Q2 154 4 166" stroke="url(#skinHF)" strokeWidth="8"
          strokeLinecap="round" fill="none" />
        <line x1="4" y1="164" x2="28" y2="210"
          stroke="#8B6010" strokeWidth="5" strokeLinecap="round" />
        <path d="M14 202 Q28 192 42 202 L40 214 Q28 208 16 214 Z"
          fill="#8a8a8a" stroke="#666" strokeWidth="1" />
        <circle cx="36" cy="208" r="2" fill="#8B6010" opacity=".6" />
        <circle cx="44" cy="214" r="1.5" fill="#6a4a08" opacity=".5" />
      </g>
      <path d="M94 98 Q108 115 110 138" stroke="#4a9a3c" strokeWidth="14"
        strokeLinecap="round" fill="none" />
      <path d="M110 138 Q112 150 110 162" stroke="url(#skinHF)" strokeWidth="8"
        strokeLinecap="round" fill="none" />
      <path d="M20 168 L28 218 L50 218 L58 192 L66 218 L88 218 L96 168 Z"
        fill="#6B4C11" />
      <ellipse cx="38" cy="218" rx="14" ry="5" fill="#2a1a08" />
      <ellipse cx="78" cy="218" rx="14" ry="5" fill="#2a1a08" />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   GROWING TREE
───────────────────────────────────────────── */
function GrowingTree({ progress }) {
  const s0 = Math.min(progress / 0.26, 1);
  const s1 = Math.max(0, Math.min((progress - 0.22) / 0.26, 1));
  const s2 = Math.max(0, Math.min((progress - 0.46) / 0.28, 1));
  const s3 = Math.max(0, Math.min((progress - 0.68) / 0.22, 1));
  const s4 = Math.max(0, Math.min((progress - 0.82) / 0.18, 1));

  const TRUNK = 300;

  const branches = [
    { d: "M160 310 Q118 268 88 240", len: 94, delay: 0.00 },
    { d: "M160 310 Q202 268 232 240", len: 94, delay: 0.08 },
    { d: "M160 268 Q108 228 78 198", len: 104, delay: 0.14 },
    { d: "M160 268 Q212 228 242 198", len: 104, delay: 0.20 },
    { d: "M160 228 Q118 192 98 162", len: 88, delay: 0.10 },
    { d: "M160 228 Q202 192 222 162", len: 88, delay: 0.18 },
    { d: "M160 196 Q138 168 126 144", len: 72, delay: 0.06 },
    { d: "M160 196 Q182 168 194 144", len: 72, delay: 0.13 },
    { d: "M160 170 Q148 152 142 134", len: 52, delay: 0.17 },
    { d: "M160 170 Q172 152 178 134", len: 52, delay: 0.22 },
  ];

  const leaves = [
    { cx: 108, cy: 222, rx: 50, ry: 40 },
    { cx: 212, cy: 222, rx: 50, ry: 40 },
    { cx: 92, cy: 180, rx: 46, ry: 36 },
    { cx: 228, cy: 180, rx: 46, ry: 36 },
    { cx: 104, cy: 144, rx: 40, ry: 32 },
    { cx: 216, cy: 144, rx: 40, ry: 32 },
    { cx: 130, cy: 124, rx: 32, ry: 26 },
    { cx: 190, cy: 124, rx: 32, ry: 26 },
    { cx: 160, cy: 112, rx: 36, ry: 28 },
  ];

  const fruits = [
    { cx: 86, cy: 228, r: 12, c1: "#ff6b35", c2: "#c83010", d: 0.00 },
    { cx: 234, cy: 228, r: 12, c1: "#ff6b35", c2: "#c83010", d: 0.12 },
    { cx: 74, cy: 186, r: 11, c1: "#e84a1a", c2: "#b02808", d: 0.06 },
    { cx: 246, cy: 186, r: 11, c1: "#ff8c42", c2: "#d06020", d: 0.18 },
    { cx: 96, cy: 150, r: 10, c1: "#ff6b35", c2: "#c83010", d: 0.09 },
    { cx: 224, cy: 150, r: 10, c1: "#e84a1a", c2: "#b02808", d: 0.15 },
    { cx: 124, cy: 128, r: 9, c1: "#ff8c42", c2: "#d06020", d: 0.03 },
    { cx: 196, cy: 128, r: 9, c1: "#ff6b35", c2: "#c83010", d: 0.21 },
    { cx: 144, cy: 114, r: 8, c1: "#c8a84b", c2: "#906010", d: 0.12 },
    { cx: 176, cy: 114, r: 8, c1: "#ff6b35", c2: "#c83010", d: 0.08 },
    { cx: 160, cy: 106, r: 8, c1: "#e84a1a", c2: "#b02808", d: 0.05 },
    { cx: 66, cy: 210, r: 9, c1: "#ff8c42", c2: "#d06020", d: 0.17 },
    { cx: 254, cy: 210, r: 9, c1: "#ff6b35", c2: "#c83010", d: 0.13 },
  ];

  const coins = [
    { cx: 84, cy: 216, d: 0.0 },
    { cx: 236, cy: 216, d: 0.7 },
    { cx: 72, cy: 174, d: 1.3 },
    { cx: 248, cy: 174, d: 0.4 },
    { cx: 160, cy: 100, d: 1.0 },
  ];

  // Contract visual (stage 2 — s1 area)
  const showContract = s1 > 0.3 && s2 < 0.6;
  const contractOpacity = showContract
    ? Math.min((s1 - 0.3) / 0.3, 1) * Math.max(0, 1 - (s2 - 0.3) / 0.3)
    : 0;

  return (
    <svg viewBox="0 0 320 580" xmlns="http://www.w3.org/2000/svg" className="tree-svg">
      <defs>
        <linearGradient id="trunkG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7a5a20" />
          <stop offset="100%" stopColor="#3d2808" />
        </linearGradient>
        <radialGradient id="leafG" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#6dbf50" />
          <stop offset="70%" stopColor="#3d8c2a" />
          <stop offset="100%" stopColor="#2a6018" />
        </radialGradient>
        <radialGradient id="seedG" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#a07830" />
          <stop offset="100%" stopColor="#6a4a10" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="contractGlow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Ground */}
      <ellipse cx="160" cy="548" rx="88" ry="11"
        fill="rgba(89,193,115,.12)" />
      <line x1="60" y1="542" x2="260" y2="542"
        stroke="rgba(89,193,115,.18)" strokeWidth="1.5" />

      {/* Roots */}
      {[
        { d: "M160 542 Q140 556 118 560", len: 50 },
        { d: "M160 542 Q180 556 202 560", len: 50 },
        { d: "M156 544 Q136 564 120 570", len: 56 },
        { d: "M164 544 Q184 564 200 570", len: 56 },
      ].map((r, i) => (
        <path key={i} d={r.d}
          stroke="#5a3a0a" strokeWidth="3" fill="none" strokeLinecap="round"
          strokeDasharray={r.len} strokeDashoffset={r.len * (1 - s0)}
          opacity={s0 * 0.65} />
      ))}

      {/* Seed */}
      {s0 < 0.55 && (
        <g opacity={Math.max(0, 1 - s0 * 2.2)}>
          <ellipse cx="160" cy="532" rx="14" ry="10" fill="url(#seedG)" />
          <ellipse cx="157" cy="529" rx="4" ry="3" fill="rgba(255,255,255,.2)" />
        </g>
      )}

      {/* Sprout */}
      {s0 > 0.25 && (
        <g opacity={Math.min((s0 - 0.25) * 3.5, 1) * (s2 < 0.1 ? 1 : Math.max(0, 1 - s2 * 5))}>
          <line x1="160" y1="540" x2="160" y2="510"
            stroke="#59c173" strokeWidth="3" strokeLinecap="round" />
          <path d="M160 516 Q148 506 142 496 Q155 500 160 516" fill="#5ab845" />
          <path d="M160 516 Q172 506 178 496 Q165 500 160 516" fill="#4aa835" />
        </g>
      )}

      {/* Sapling */}
      {s1 > 0 && (
        <g opacity={s1 * (s2 < 0.35 ? 1 : Math.max(0, 1 - (s2 - 0.35) * 4))}>
          <line x1="160" y1="542" x2="160" y2={542 - s1 * 130}
            stroke="#5a8a30" strokeWidth="5" strokeLinecap="round" />
          {s1 > 0.3 && <>
            <path d="M160 480 Q136 460 126 438 Q154 448 160 480"
              fill="#5ab845" opacity={s1} />
            <path d="M160 480 Q184 460 194 438 Q166 448 160 480"
              fill="#4aa835" opacity={s1} />
            <path d="M160 456 Q142 440 134 422 Q158 432 160 456"
              fill="#6bc850" opacity={s1 * 0.8} />
            <path d="M160 456 Q178 440 186 422 Q162 432 160 456"
              fill="#5ab840" opacity={s1 * 0.8} />
          </>}
        </g>
      )}

      {/* ── CONTRACT VISUAL (stage 2) ── */}
      {contractOpacity > 0 && (
        <g opacity={contractOpacity}
          style={{ animation: "contractPulse 2.5s ease-in-out infinite" }}
          filter="url(#contractGlow)">
          {/* Contract document floating above sapling */}
          <rect x="108" y="360" width="104" height="130" rx="8"
            fill="rgba(10,20,40,.85)"
            stroke="rgba(89,193,115,.6)" strokeWidth="1.5" />
          {/* Top bar */}
          <rect x="108" y="360" width="104" height="18" rx="8"
            fill="rgba(89,193,115,.2)" />
          <rect x="108" y="370" width="104" height="8"
            fill="rgba(89,193,115,.2)" />
          {/* Lock icon */}
          <rect x="150" y="364" width="20" height="14" rx="4"
            fill="none" stroke="#59c173" strokeWidth="1.5" />
          <rect x="155" y="368" width="10" height="8" rx="1" fill="#59c173" />
          <rect x="154" y="360" width="12" height="10" rx="6"
            fill="none" stroke="#59c173" strokeWidth="1.5" />
          {/* Lines of contract text */}
          {[0, 1, 2, 3, 4, 5].map(i => (
            <rect key={i}
              x={116} y={386 + i * 14} rx="2"
              width={i === 5 ? 52 : 88} height="5"
              fill={`rgba(89,193,115,${0.25 - i * 0.02})`} />
          ))}
          {/* Verified badge */}
          <circle cx="160" cy="466" r="14"
            fill="rgba(89,193,115,.15)"
            stroke="#59c173" strokeWidth="1.5" />
          <path d="M153 466 L158 472 L168 460"
            stroke="#59c173" strokeWidth="2"
            fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {/* PUBLIC label */}
          <text x="160" y="498"
            textAnchor="middle" fontSize="7"
            fill="rgba(89,193,115,.8)" fontWeight="700" letterSpacing="1.5">
            PUBLIC CONTRACT
          </text>
        </g>
      )}

      {/* Trunk */}
      <path d="M160 542 Q155 480 158 420 Q156 360 160 300 Q158 248 160 178"
        stroke="url(#trunkG)" strokeWidth="18" fill="none" strokeLinecap="round"
        strokeDasharray={TRUNK} strokeDashoffset={TRUNK * (1 - s2)} />
      {s2 > 0.4 && [0, 1, 2, 3].map(i => (
        <path key={i}
          d={`M157 ${492 - i * 82} Q162 ${482 - i * 82} 158 ${470 - i * 82}`}
          stroke="rgba(0,0,0,.2)" strokeWidth="1.5" fill="none"
          opacity={Math.min((s2 - 0.4) * 3, 1)} />
      ))}

      {/* Branches */}
      {branches.map((b, i) => {
        const bp = Math.max(0, Math.min((s3 - b.delay) / (1 - b.delay * 0.4), 1));
        return (
          <path key={i} d={b.d}
            stroke="#5a3a10" strokeWidth={6 - Math.floor(i / 2)}
            fill="none" strokeLinecap="round"
            strokeDasharray={b.len} strokeDashoffset={b.len * (1 - bp)} />
        );
      })}

      {/* Canopy */}
      {leaves.map((l, i) => {
        const lp = Math.max(0, Math.min((s3 - i * 0.04) / 0.6, 1));
        return (
          <ellipse key={i}
            cx={l.cx} cy={l.cy} rx={l.rx * lp} ry={l.ry * lp}
            fill="url(#leafG)" opacity={lp * 0.88}
            style={{
              animation: lp > 0.8
                ? `leafRustle ${2.5 + i * 0.3}s ease-in-out ${i * 0.2}s infinite`
                : "none"
            }} />
        );
      })}

      {/* Fruits */}
      {fruits.map((f, i) => {
        const fp = Math.max(0, Math.min((s4 - f.d) / (1 - f.d * 0.5), 1));
        const fid = `fg${i}`;
        return (
          <g key={i} filter={fp > 0.9 ? "url(#glow)" : undefined}>
            <defs>
              <radialGradient id={fid} cx="35%" cy="30%">
                <stop offset="0%" stopColor={f.c1} />
                <stop offset="100%" stopColor={f.c2} />
              </radialGradient>
            </defs>
            <circle cx={f.cx} cy={f.cy} r={f.r * fp}
              fill={`url(#fg${i})`}
              style={{
                animation: fp > 0.9
                  ? `fruitSway ${2.2 + i * 0.15}s ease-in-out ${i * 0.18}s infinite`
                  : "none"
              }} />
            {fp > 0.7 && (
              <ellipse
                cx={f.cx - f.r * 0.25} cy={f.cy - f.r * 0.3}
                rx={f.r * 0.3 * fp} ry={f.r * 0.2 * fp}
                fill="rgba(255,255,255,.35)" />
            )}
            {fp > 0.6 && (
              <line x1={f.cx} y1={f.cy - f.r}
                x2={f.cx + 2} y2={f.cy - f.r - 5}
                stroke="#3a6010" strokeWidth="1.5" opacity={fp} />
            )}
          </g>
        );
      })}

      {/* Coins */}
      {s4 > 0.5 && coins.map((c, i) => (
        <g key={i} style={{ animation: `coinPop 2.2s ease-in-out ${c.d}s infinite` }}>
          <ellipse cx={c.cx} cy={c.cy} rx="8" ry="5" fill="#c8a84b" />
          <ellipse cx={c.cx} cy={c.cy - 1} rx="7" ry="4" fill="#e8c86a" />
          <text x={c.cx} y={c.cy + 1.5}
            textAnchor="middle" fontSize="5" fill="#8a6010" fontWeight="bold">$</text>
        </g>
      ))}

      {/* ROI crown label */}
      {s4 > 0.85 && (
        <g opacity={(s4 - 0.85) / 0.15} style={{ animation: "countUp 0.5s ease both" }}>
          <rect x="108" y="68" width="104" height="34" rx="17"
            fill="rgba(200,168,75,.16)"
            stroke="rgba(200,168,75,.45)" strokeWidth="1.5" />
          <text x="160" y="87" textAnchor="middle"
            fontSize="11" fill="#c8a84b" fontWeight="800" letterSpacing=".5">
            30%+ ROI
          </text>
          <text x="160" y="97" textAnchor="middle"
            fontSize="7.5" fill="rgba(200,168,75,.6)">
            Real Harvest Returns
          </text>
        </g>
      )}
    </svg>
  );
}

/* ─────────────────────────────────────────────
   FOUNDER SVG
───────────────────────────────────────────── */
function FounderSVG() {
  return (
    <svg width="120" height="200" viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="skinFo" cx="50%" cy="40%">
          <stop offset="0%" stopColor="#d4956a" />
          <stop offset="100%" stopColor="#b07040" />
        </radialGradient>
      </defs>
      {/* Hair */}
      <ellipse cx="60" cy="24" rx="22" ry="10" fill="#2a2218" />
      <rect x="38" y="24" width="44" height="8" fill="#2a2218" />
      <path d="M46 18 Q52 14 56 24" stroke="#888" strokeWidth="1.5" opacity=".4" />
      <path d="M68 18 Q74 14 76 24" stroke="#888" strokeWidth="1.5" opacity=".4" />
      {/* Head */}
      <ellipse cx="60" cy="46" rx="22" ry="24" fill="url(#skinFo)" />
      <ellipse cx="46" cy="60" rx="5" ry="3.5" fill="rgba(200,80,60,.18)" />
      <ellipse cx="74" cy="60" rx="5" ry="3.5" fill="rgba(200,80,60,.18)" />
      <ellipse cx="52" cy="42" rx="3" ry="3.5" fill="#1a1208" />
      <ellipse cx="68" cy="42" rx="3" ry="3.5" fill="#1a1208" />
      <ellipse cx="51" cy="41" rx="1" ry="1" fill="white" />
      <ellipse cx="67" cy="41" rx="1" ry="1" fill="white" />
      <path d="M48 34 Q54 31 60 34" stroke="#1a1208" strokeWidth="1.8"
        fill="none" strokeLinecap="round" />
      <path d="M60 34 Q66 31 72 34" stroke="#1a1208" strokeWidth="1.8"
        fill="none" strokeLinecap="round" />
      <path d="M50 54 Q60 63 70 54" stroke="#2a1a0a" strokeWidth="1.5"
        fill="rgba(255,255,255,.18)" strokeLinecap="round" />
      <path d="M48 62 Q60 72 72 62 Q68 70 60 73 Q52 70 48 62 Z"
        fill="#3a2a18" opacity=".22" />
      {/* Neck */}
      <rect x="54" y="68" width="12" height="10" fill="url(#skinFo)" />
      {/* Suit */}
      <path d="M18 90 Q28 76 48 66 L54 68 L60 80 L66 68 L72 66 Q92 76 102 90 L104 170 L16 170 Z"
        fill="#1a2744" />
      <path d="M48 66 L54 68 L60 80 L66 68 L72 66 L72 90 L48 90 Z" fill="#f0ede8" />
      <path d="M60 68 L56 78 L60 94 L64 78 Z" fill="#c8a84b" />
      <path d="M56 78 L60 75 L64 78 L60 81 Z" fill="#a08030" />
      <path d="M54 90 L48 66 L54 72 L60 80 Z" fill="#2a3d6a" />
      <path d="M66 90 L72 66 L66 72 L60 80 Z" fill="#2a3d6a" />
      <circle cx="76" cy="98" r="4" fill="#c8a84b" />
      <circle cx="75" cy="97" r="2" fill="#e8d070" />
      <path d="M18 92 Q8 112 8 140" stroke="#1a2744" strokeWidth="12"
        strokeLinecap="round" fill="none" />
      <ellipse cx="8" cy="144" rx="8" ry="7" fill="url(#skinFo)" />
      <path d="M102 92 Q112 112 112 140" stroke="#1a2744" strokeWidth="12"
        strokeLinecap="round" fill="none" />
      <ellipse cx="112" cy="144" rx="8" ry="7" fill="url(#skinFo)" />
      <path d="M16 170 L24 198 L46 198 L60 172 L74 198 L96 198 L104 170 Z"
        fill="#141e38" />
      <ellipse cx="34" cy="198" rx="14" ry="5" fill="#0a0a0a" />
      <ellipse cx="86" cy="198" rx="14" ry="5" fill="#0a0a0a" />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   GROWTH SECTION
───────────────────────────────────────────── */
function GrowthSection() {
  const [progress, setProgress] = useState(0);
  const canvasRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const total = canvasRef.current.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      setProgress(Math.max(0, Math.min(scrolled / total, 1)));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const stageIndex =
    progress < STAGE_BREAKS[1] ? 0 :
      progress < STAGE_BREAKS[2] ? 1 :
        progress < STAGE_BREAKS[3] ? 2 : 3;

  const segWidths = STAGE_BREAKS.map((start, i) => {
    const end = STAGE_BREAKS[i + 1] ?? 1;
    if (progress <= start) return "0%";
    if (progress >= end) return "100%";
    return `${((progress - start) / (end - start)) * 100}%`;
  });

  return (
    <div className="scroll-canvas" ref={canvasRef}>
      <div className="sticky-container">

        {/* Top progress bar */}
        <div className="stage-progress-bar">
          {STAGES.map((_, i) => (
            <div key={i} className="bar-seg">
              <div className="bar-fill" style={{ width: segWidths[i] }} />
            </div>
          ))}
        </div>

        <GrowingTree progress={progress} />

        <div className="info-panel" style={{ height: 340 }}>
          <div className="progress-dots">
            {STAGES.map((_, i) => (
              <div key={i} className={`dot
                ${i === stageIndex ? "active" : ""}
                ${i < stageIndex ? "done" : ""}`} />
            ))}
          </div>

          {STAGES.map((s, i) => (
            <div key={i} className={`stage-card ${i === stageIndex ? "active" : ""}`}>
              <div className="card">
                <div className="stage-num">Step {s.id + 1} of 4</div>
                <div className="stage-icon-row">
                  <span className="stage-icon">{s.icon}</span>
                  <h2>{s.title}</h2>
                </div>
                <p>{s.desc}</p>
                <div className="stage-tags">
                  {s.tags.map((t, j) => (
                    <span key={j} className={`tag ${j >= 2 ? "gold" : ""}`}>{t}</span>
                  ))}
                </div>
                <div className="roi-pill">
                  <div className="roi-num" style={{ color: s.roiColor }}>{s.roi}</div>
                  <div className="roi-label">{s.roiSub}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   VISION SECTION
───────────────────────────────────────────── */
function VisionSection() {
  return (
    <section className="vision-section">
      <div className="vision-header">
        <span className="overline">Why Ceylon Harvest Capital</span>
        <h2>Built on Trust.<br />Grown from the Ground.</h2>
        <p>
          We are not a bank. We are not a fund. We are a bridge —
          between the farmer who knows the land, and the investor who believes in it.
        </p>
      </div>

      {/* 3 vision cards */}
      <div className="vision-grid">
        {VISION_CARDS.map((v, i) => (
          <div key={i} className="vision-card">
            <div className="vision-card-icon">{v.icon}</div>
            <h3>{v.title}</h3>
            <p>{v.desc}</p>
          </div>
        ))}
      </div>

      {/* Founder strip */}
      <div className="founder-row">
        <div className="founder-avatar">
          <FounderSVG />
        </div>
        <div className="founder-text">
          <span className="overline">From the Founder</span>
          <blockquote>
            "I grew up watching my grandfather farm the same paddy field his father farmed.
            He worked harder than anyone I knew and had less than most.
            Ceylon Harvest Capital exists to change that. One transparent contract at a time."
          </blockquote>
          <div className="founder-name">Gehan Perera</div>
          <div className="founder-title-text">Founder & CEO, Ceylon Harvest Capital</div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   STATS BAR
───────────────────────────────────────────── */
function StatsBar() {
  return (
    <div className="stats-bar">
      {[
        { num: "340+", label: "Farms Funded", gold: false },
        { num: "Rs 48M", label: "Capital Deployed", gold: true },
        { num: "24%", label: "Avg. Annual ROI", gold: true },
        { num: "1,200+", label: "Active Investors", gold: false },
        { num: "100%", label: "Contract Transparency", gold: false },
      ].map((s, i) => (
        <div key={i} className="stat-item">
          <div className={`stat-num ${s.gold ? "gold" : ""}`}>{s.num}</div>
          <div className="stat-label">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   HOME
───────────────────────────────────────────── */
export default function Home() {
  return (
    <main>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-field">
          {[60, 52, 46, 42, 38].map((h, i) => (
            <FieldRow key={i} height={h} />
          ))}
        </div>

        <div className="hero-farmer">
          <HeroFarmer />
        </div>

        <div className="hero-particles">
          {PARTICLES.map((p) => (
            <div key={p.id} className="particle" style={{
              left: p.left, top: p.top,
              width: p.size, height: p.size,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }} />
          ))}
        </div>

        <div className="hero-content">
          <img src={logo} alt="CHC" className="hero-logo" />
          <h1 className="hero-title">Ceylon Harvest Capital</h1>
          <p className="hero-sub">Wealthy Farmer! Smart Investor!</p>
          <a href="#how" className="btn hero-cta">See How It Works ↓</a>
        </div>

        <div className="hero-scroll-hint">SCROLL</div>
      </section>
      <StatsBar />
      <div id="how">
        <GrowthSection />
      </div>
      <VisionSection />
    </main>
  );
}