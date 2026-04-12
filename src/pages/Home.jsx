import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { ROUTES } from "../routes/routePaths.js";
import logo from "../assets/logo.png";
import "../styles/pages/home.css";

// Responsive generated assets (build-time): AVIF/WebP/JPEG with mobile + desktop variants.
import slide1DesktopAvif from "../assets/slides/generated/mission-desktop.avif";
import slide1DesktopWebp from "../assets/slides/generated/mission-desktop.webp";
import slide1DesktopJpg from "../assets/slides/generated/mission-desktop.jpg";
import slide1MobileAvif from "../assets/slides/generated/mission-mobile.avif";
import slide1MobileWebp from "../assets/slides/generated/mission-mobile.webp";
import slide1MobileJpg from "../assets/slides/generated/mission-mobile.jpg";

import slide2DesktopAvif from "../assets/slides/generated/vision-desktop.avif";
import slide2DesktopWebp from "../assets/slides/generated/vision-desktop.webp";
import slide2DesktopJpg from "../assets/slides/generated/vision-desktop.jpg";
import slide2MobileAvif from "../assets/slides/generated/vision-mobile.avif";
import slide2MobileWebp from "../assets/slides/generated/vision-mobile.webp";
import slide2MobileJpg from "../assets/slides/generated/vision-mobile.jpg";

import slide3DesktopAvif from "../assets/slides/generated/howitworks-desktop.avif";
import slide3DesktopWebp from "../assets/slides/generated/howitworks-desktop.webp";
import slide3DesktopJpg from "../assets/slides/generated/howitworks-desktop.jpg";
import slide3MobileAvif from "../assets/slides/generated/howitworks-mobile.avif";
import slide3MobileWebp from "../assets/slides/generated/howitworks-mobile.webp";
import slide3MobileJpg from "../assets/slides/generated/howitworks-mobile.jpg";

import slide4DesktopAvif from "../assets/slides/generated/starts-desktop.avif";
import slide4DesktopWebp from "../assets/slides/generated/starts-desktop.webp";
import slide4DesktopJpg from "../assets/slides/generated/starts-desktop.jpg";
import slide4MobileAvif from "../assets/slides/generated/starts-mobile.avif";
import slide4MobileWebp from "../assets/slides/generated/starts-mobile.webp";
import slide4MobileJpg from "../assets/slides/generated/starts-mobile.jpg";

import slide5DesktopAvif from "../assets/slides/generated/about-desktop.avif";
import slide5DesktopWebp from "../assets/slides/generated/about-desktop.webp";
import slide5DesktopJpg from "../assets/slides/generated/about-desktop.jpg";
import slide5MobileAvif from "../assets/slides/generated/about-mobile.avif";
import slide5MobileWebp from "../assets/slides/generated/about-mobile.webp";
import slide5MobileJpg from "../assets/slides/generated/about-mobile.jpg";

import slide6DesktopAvif from "../assets/slides/generated/partners-desktop.avif";
import slide6DesktopWebp from "../assets/slides/generated/partners-desktop.webp";
import slide6DesktopJpg from "../assets/slides/generated/partners-desktop.jpg";
import slide6MobileAvif from "../assets/slides/generated/partners-mobile.avif";
import slide6MobileWebp from "../assets/slides/generated/partners-mobile.webp";
import slide6MobileJpg from "../assets/slides/generated/partners-mobile.jpg";

// ── Slide data ───────────────────────────────────────────────
const SLIDES = [
  {
    id: 0,
    image: {
      desktop: { avif: slide1DesktopAvif, webp: slide1DesktopWebp, jpg: slide1DesktopJpg },
      mobile: { avif: slide1MobileAvif, webp: slide1MobileWebp, jpg: slide1MobileJpg },
    },
    eyebrow: "Our Mission",
    title: "Connecting Capital\nWith Cultivation",
    desc: "Ceylon Harvest Capital bridges Sri Lankan investors with verified local farmers through transparent, performance-based contracts. Every rupee funds a real farm, a real family, a real future.",
    cta: "Start Investing",
    ctaRoute: ROUTES.register,
    accent: "#59c173",
    overlay: "rgba(11,15,12,.72)",
    stats: [
      { num: "340+",  label: "Verified Farms"    },
      { num: "Rs 48M", label: "Capital Deployed"  },
      { num: "9",     label: "Provinces Covered"  },
    ],
  },
  {
    id: 1,
    image: {
      desktop: { avif: slide2DesktopAvif, webp: slide2DesktopWebp, jpg: slide2DesktopJpg },
      mobile: { avif: slide2MobileAvif, webp: slide2MobileWebp, jpg: slide2MobileJpg },
    },
    eyebrow: "Our Vision",
    title: "Wealthy Farmer,\nSmart Investor",
    desc: "We envision a Sri Lanka where farmers earn what they deserve and investors grow their wealth alongside the harvest. Transparent contracts. Real returns. No middlemen.",
    cta: "Join as Farmer",
    ctaRoute: ROUTES.register,
    accent: "#c8a84b",
    overlay: "rgba(8,12,9,.75)",
    stats: [
      { num: "1,200+", label: "Active Investors" },
      { num: "24%",    label: "Avg Annual ROI"   },
      { num: "100%",   label: "Transparent"       },
    ],
  },
  {
    id: 2,
    image: {
      desktop: { avif: slide3DesktopAvif, webp: slide3DesktopWebp, jpg: slide3DesktopJpg },
      mobile: { avif: slide3MobileAvif, webp: slide3MobileWebp, jpg: slide3MobileJpg },
    },
    eyebrow: "How It Works",
    title: "Four Steps to\nYour First Harvest",
    desc: "Register, verify your identity, choose a farm to fund, and watch your returns grow with every milestone. Simple, secure, and completely transparent from seed to sale.",
    cta: "See All Steps",
    ctaRoute: ROUTES.register,
    accent: "#59c173",
    overlay: "rgba(11,15,12,.70)",
    stats: [
      { num: "8–24%",   label: "Annual Returns"      },
      { num: "30 Days", label: "To First Milestone"   },
      { num: "Zero",    label: "Hidden Fees"          },
    ],
  },
  {
    id: 3,
    image: {
      desktop: { avif: slide4DesktopAvif, webp: slide4DesktopWebp, jpg: slide4DesktopJpg },
      mobile: { avif: slide4MobileAvif, webp: slide4MobileWebp, jpg: slide4MobileJpg },
    },
    eyebrow: "Platform Growth",
    title: "Rs. 68 Million\nDeployed in 2025",
    desc: "From Rs. 12M in 2021 to Rs. 68M in 2025 — Ceylon Harvest Capital is the fastest-growing agricultural investment platform in Sri Lanka. Join before the next season begins.",
    cta: "View Opportunities",
    ctaRoute: ROUTES.register,
    accent: "#c8a84b",
    overlay: "rgba(8,10,8,.78)",
    stats: [
      { num: "468%",   label: "Growth Since 2021" },
      { num: "Rs 68M", label: "2025 Deployed"     },
      { num: "3,400+", label: "Farmers Helped"    },
    ],
  },
  {
    id: 4,
    image: {
      desktop: { avif: slide5DesktopAvif, webp: slide5DesktopWebp, jpg: slide5DesktopJpg },
      mobile: { avif: slide5MobileAvif, webp: slide5MobileWebp, jpg: slide5MobileJpg },
    },
    eyebrow: "About Us",
    title: "Built by Students,\nBacked by Vision",
    desc: "Developed by 2nd year Computer Science students at SLIIT, Ceylon Harvest Capital was born from a single belief — technology can make agriculture fair, transparent, and profitable for everyone.",
    cta: "Our Story",
    ctaRoute: ROUTES.register,
    accent: "#59c173",
    overlay: "rgba(11,15,12,.74)",
    stats: [
      { num: "SLIIT", label: "Founded At"  },
      { num: "2026",  label: "Launched"    },
      { num: "CS",    label: "Year 2 Team" },
    ],
  },
  {
    id: 5,
    image: {
      desktop: { avif: slide6DesktopAvif, webp: slide6DesktopWebp, jpg: slide6DesktopJpg },
      mobile: { avif: slide6MobileAvif, webp: slide6MobileWebp, jpg: slide6MobileJpg },
    },
    eyebrow: "Our Partners",
    title: "Trusted By\nSri Lanka's Best",
    desc: "Working alongside Sri Lanka's Ministry of Agriculture, Department of Agriculture, Bank of Ceylon, and leading financial institutions to ensure every investment is secure and compliant.",
    cta: "Partner With Us",
    ctaRoute: ROUTES.register,
    accent: "#c8a84b",
    overlay: "rgba(8,12,9,.76)",
    stats: [
      { num: "6+",   label: "Institutional Partners" },
      { num: "CBSL", label: "Compliant"              },
      { num: "SLSI", label: "Certified"              },
    ],
  },
];

// ── Hero Slider ──────────────────────────────────────────────
const SLIDE_INTERVAL_MS = 6000;
const TRANSITION_MS = 520;
const MOBILE_BREAKPOINT = 768;

function HeroSlider({ user }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [incoming, setIncoming] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [viewportBucket, setViewportBucket] = useState(
    typeof window !== "undefined" && window.innerWidth <= MOBILE_BREAKPOINT ? "mobile" : "desktop"
  );
  const [formatOrder, setFormatOrder] = useState(["webp", "jpg"]);

  const timerRef = useRef(null);
  const transitionRef = useRef(null);
  const loadedUrlsRef = useRef(new Set());
  const decodePromisesRef = useRef(new Map());
  const chosenUrlRef = useRef(new Map());
  const failedFormatRef = useRef(new Set());

  const detectFormatSupport = (format) => {
    try {
      const canvas = document.createElement("canvas");
      return canvas.toDataURL(`image/${format}`).startsWith(`data:image/${format}`);
    } catch {
      return false;
    }
  };

  const computeFormatOrder = () => {
    const order = [];
    if (detectFormatSupport("avif")) order.push("avif");
    if (detectFormatSupport("webp")) order.push("webp");
    order.push("jpg");
    return order;
  };

  const getCandidateFormats = () => {
    const dedup = [];
    for (const fmt of formatOrder) {
      if (!failedFormatRef.current.has(fmt) && !dedup.includes(fmt)) dedup.push(fmt);
    }
    if (!dedup.includes("jpg")) dedup.push("jpg");
    return dedup;
  };

  const getSlideUrl = (index, bucket) => {
    const cacheKey = `${index}:${bucket}`;
    const cached = chosenUrlRef.current.get(cacheKey);
    if (cached) return cached;

    const slide = SLIDES[index];
    for (const fmt of getCandidateFormats()) {
      const url = slide.image?.[bucket]?.[fmt];
      if (url) {
        chosenUrlRef.current.set(cacheKey, url);
        return url;
      }
    }

    const fallback = slide.image?.[bucket]?.jpg || slide.image?.desktop?.jpg;
    chosenUrlRef.current.set(cacheKey, fallback);
    return fallback;
  };

  const preloadUrl = async (url) => {
    if (!url) return;
    if (loadedUrlsRef.current.has(url)) return;
    if (decodePromisesRef.current.has(url)) return decodePromisesRef.current.get(url);

    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      img.loading = "eager";
      img.decoding = "async";
      img.src = url;
      img.onload = async () => {
        try {
          if (typeof img.decode === "function") await img.decode();
        } catch {
          // Ignore decode failure and continue with loaded resource.
        }
        loadedUrlsRef.current.add(url);
        decodePromisesRef.current.delete(url);
        resolve(url);
      };
      img.onerror = () => {
        decodePromisesRef.current.delete(url);
        reject(new Error(`Failed to load ${url}`));
      };
    });

    decodePromisesRef.current.set(url, promise);
    return promise;
  };

  const preloadSlide = async (index, bucket) => {
    const slide = SLIDES[index];
    const cacheKey = `${index}:${bucket}`;

    for (const fmt of getCandidateFormats()) {
      const url = slide.image?.[bucket]?.[fmt];
      if (!url) continue;
      try {
        await preloadUrl(url);
        chosenUrlRef.current.set(cacheKey, url);
        return url;
      } catch {
        failedFormatRef.current.add(fmt);
      }
    }

    const fallback = slide.image?.[bucket]?.jpg || slide.image?.desktop?.jpg;
    await preloadUrl(fallback);
    chosenUrlRef.current.set(cacheKey, fallback);
    return fallback;
  };

  const preloadUpcoming = async (centerIndex, bucket) => {
    const targets = [centerIndex, (centerIndex + 1) % SLIDES.length, (centerIndex + 2) % SLIDES.length];
    await Promise.allSettled(targets.map((idx) => preloadSlide(idx, bucket)));
  };

  const restartAuto = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      void changeTo((activeIndex + 1) % SLIDES.length);
    }, SLIDE_INTERVAL_MS);
  };

  const changeTo = async (targetIndex) => {
    if (targetIndex === activeIndex || isTransitioning) return;
    const url = await preloadSlide(targetIndex, viewportBucket);
    setIncoming({ index: targetIndex, url });
    setIsTransitioning(true);
    clearTimeout(transitionRef.current);
    transitionRef.current = setTimeout(() => {
      setActiveIndex(targetIndex);
      setIncoming(null);
      setIsTransitioning(false);
      setAnimKey((k) => k + 1);
    }, TRANSITION_MS);
  };

  const goTo = (index) => {
    void changeTo(index);
    restartAuto();
  };

  const next = () => goTo((activeIndex + 1) % SLIDES.length);
  const prev = () => goTo((activeIndex - 1 + SLIDES.length) % SLIDES.length);

  useEffect(() => {
    setFormatOrder(computeFormatOrder());
  }, []);

  useEffect(() => {
    const onResize = () => {
      setViewportBucket(window.innerWidth <= MOBILE_BREAKPOINT ? "mobile" : "desktop");
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    void preloadUpcoming(activeIndex, viewportBucket);
  }, [activeIndex, viewportBucket, formatOrder]);

  useEffect(() => {
    restartAuto();
    return () => {
      clearInterval(timerRef.current);
      clearTimeout(transitionRef.current);
    };
  }, [activeIndex, viewportBucket, formatOrder, isTransitioning]);

  const slide = SLIDES[activeIndex];
  const activeUrl = getSlideUrl(activeIndex, viewportBucket);
  const incomingSlide = incoming ? SLIDES[incoming.index] : null;

  return (
    <section className="heroSlider">
      <div className="heroBgLayer heroBgLayerActive">
        <img
          className="heroBgImg"
          src={activeUrl}
          alt=""
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      </div>

      {incoming && (
        <div className={`heroBgLayer heroBgLayerIncoming ${isTransitioning ? "isVisible" : ""}`}>
          <img className="heroBgImg" src={incoming.url} alt="" loading="eager" decoding="async" />
        </div>
      )}

      <div className="heroOverlay" style={{ background: incomingSlide?.overlay || slide.overlay }} />

      <div className="heroSliderInner" key={`content-${animKey}`}>
        <div className="heroContent">
          <span className="heroEyebrow" style={{ color: slide.accent }}>
            {slide.eyebrow}
          </span>

          <h1 className="heroTitle">
            {slide.title.split("\n").map((line, i) => (
              <span key={i}>{line}<br /></span>
            ))}
          </h1>

          <p className="heroDesc">{slide.desc}</p>

          <div className="heroStats">
            {slide.stats.map((s, i) => (
              <div key={i} className="heroStat">
                <div className="heroStatNum" style={{ color: slide.accent }}>
                  {s.num}
                </div>
                <div className="heroStatLabel">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="heroCtas">
            {!user ? (
              <>
                <Link
                  className="heroBtnPrimary"
                  to={slide.ctaRoute}
                  style={{ background: slide.accent, color: "#0b0f0c" }}
                >
                  {slide.cta} →
                </Link>
                <Link className="heroBtnGhost" to={ROUTES.login}>
                  Login
                </Link>
              </>
            ) : (
              <Link
                className="heroBtnPrimary"
                to={ROUTES.gate}
                style={{ background: slide.accent, color: "#0b0f0c" }}
              >
                Go to Dashboard →
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="heroControls">
        <button className="heroArrow" onClick={prev} aria-label="Previous">←</button>
        <div className="heroDots">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              className={"heroDot" + (i === activeIndex ? " active" : "")}
              style={i === activeIndex ? { background: slide.accent, transform: "scale(1.4)" } : {}}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
        <button className="heroArrow" onClick={next} aria-label="Next">→</button>
      </div>

      <div className="heroCounter">
        <span style={{ color: slide.accent }}>{String(activeIndex + 1).padStart(2, "0")}</span>
        <span className="heroCounterSep" />
        <span>{String(SLIDES.length).padStart(2, "0")}</span>
      </div>

      <div className="heroProgressBar">
        <div
          className="heroProgressFill"
          key={`prog-${activeIndex}`}
          style={{ background: slide.accent }}
        />
      </div>
    </section>
  );
}
// ── Stats Bar ────────────────────────────────────────────────
function StatsBar() {
  return (
    <div className="statsBar">
      {[
        { num: "340+",   label: "Farms Funded"           },
        { num: "Rs 48M", label: "Capital Deployed"        },
        { num: "24%",    label: "Avg Annual ROI"          },
        { num: "1,200+", label: "Active Investors"        },
        { num: "100%",   label: "Transparent Contracts"   },
      ].map((s, i) => (
        <div key={i} className="statItem">
          <div className="statNum">{s.num}</div>
          <div className="statLabel">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Footer ───────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="siteFooter">
      <div className="footerTop">

        {/* Brand col */}
        <div className="footerBrand">
          <div className="footerLogoRow">
            <img src={logo} alt="CHC"
              style={{ width: 36, height: 36, objectFit: "contain" }} />
            <span className="footerBrandName">Ceylon Harvest Capital</span>
          </div>
          <p className="footerBrandDesc">
            Sri Lanka's transparent agricultural investment platform.
            Connecting investors with verified farmers through
            performance-based smart contracts.
          </p>
          <div className="footerBadge">
            🌿 SLIIT · Computer Science · 2026
          </div>
        </div>

        {/* Platform links */}
        <div className="footerCol">
          <h4 className="footerColTitle">Platform</h4>
          <Link className="footerLink" to={ROUTES.register}>Register as Investor</Link>
          <Link className="footerLink" to={ROUTES.register}>Register as Farmer</Link>
          <Link className="footerLink" to={ROUTES.login}>Login</Link>
          <a className="footerLink" href="#">How It Works</a>
          <a className="footerLink" href="#">Investment Guide</a>
        </div>

        {/* Support */}
        <div className="footerCol">
          <h4 className="footerColTitle">Support</h4>
          <a className="footerLink" href="#">Contact Us</a>
          <a className="footerLink" href="#">Registration Guide</a>
          <a className="footerLink" href="#">How to Pay</a>
          <a className="footerLink" href="#">KYC Requirements</a>
          <a className="footerLink" href="#">FAQs</a>
        </div>

        {/* Legal */}
        <div className="footerCol">
          <h4 className="footerColTitle">Legal</h4>
          <a className="footerLink" href="#">Privacy Policy</a>
          <a className="footerLink" href="#">Terms &amp; Conditions</a>
          <a className="footerLink" href="#">Investment Disclaimer</a>
          <a className="footerLink" href="#">Cookie Policy</a>
          <a className="footerLink" href="#">Compliance</a>
        </div>

        {/* Payments */}
        <div className="footerCol">
          <h4 className="footerColTitle">Payment Methods</h4>
          <div className="footerPayments">
            {["Visa", "Mastercard", "Bank Transfer", "CEFT", "PayHere"].map(p => (
              <span key={p} className="footerPayBadge">{p}</span>
            ))}
          </div>
          <div style={{ marginTop: "1rem" }}>
            <h4 className="footerColTitle">Regulated By</h4>
            <div className="footerPayments">
              {["CBSL", "SEC", "SLSI"].map(p => (
                <span key={p} className="footerRegBadge">{p}</span>
              ))}
            </div>
          </div>
        </div>

      </div>

      <div className="footerDivider" />

      <div className="footerBottom">
        <span className="footerCopy">
          © 2026 Ceylon Harvest Capital. All rights reserved.
        </span>
        <span className="footerDev">
          Developed by SLIIT 2nd Year Computer Science Students
        </span>
        <div className="footerBottomLinks">
          <a className="footerSmLink" href="#">Privacy</a>
          <a className="footerSmLink" href="#">Terms</a>
          <a className="footerSmLink" href="#">Contact</a>
        </div>
      </div>
    </footer>
  );
}

// ── Main Home ────────────────────────────────────────────────
export default function Home() {
  const { user } = useAuth();
  return (
    <main style={{ paddingTop: 0 }}>
      <HeroSlider user={user} />
      <StatsBar />
      <Footer />
    </main>
  );
}
