import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Ticker items ─────────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  "UPLOAD TEMPLATE",
  "IMPORT EXCEL",
  "ADJUST PLACEMENT",
  "GENERATE ALL",
  "DOWNLOAD ZIP",
  "ZERO MANUAL WORK",
  "BULK CERTIFICATES",
];

// ─── Hero cert cycling names ──────────────────────────────────────────────────
const CYCLE_NAMES = [
  "Kimberly Sarmiento",
  "John Rey Sasi",
  "Lykah Sarmiento",
  "Carlo Mendoza",
  "John Doe",
];

// ─── Steps data ───────────────────────────────────────────────────────────────
const STEPS = [
  {
    num: "01",
    icon: "🖼️",
    heading: "UPLOAD TEMPLATE",
    desc: "Drag & drop your certificate design as a PNG or JPG. Any size, any layout — CertGen works with it all.",
  },
  {
    num: "02",
    icon: "📊",
    heading: "IMPORT NAMES",
    desc: "Upload an Excel or CSV file. CertGen auto-detects the name column and loads every recipient instantly.",
  },
  {
    num: "03",
    icon: "⬇️",
    heading: "GENERATE & ZIP",
    desc: "Hit generate. Every certificate is rendered on-canvas and packaged into a single ZIP — ready to distribute.",
  },
];

// ─── Features ─────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: "🎯",
    title: "Pixel-Perfect Placement",
    desc: "Fine-tune name position with live preview sliders. X, Y, size, weight, color.",
  },
  {
    icon: "⚡",
    title: "Canvas Rendering",
    desc: "Pure browser-side canvas — no servers, no uploads, no waiting for a backend.",
  },
  {
    icon: "📦",
    title: "ZIP Download",
    desc: "All certificates neatly numbered and named, zipped automatically for distribution.",
  },
  {
    icon: "🔠",
    title: "Font Controls",
    desc: "Choose from multiple font families, weights, and color presets built for certificates.",
  },
];

// ─── Testimonials ─────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    text: "Used CertGen for our 300-person tech summit. What used to take a full day now takes literally 2 minutes. This tool is absurdly good.",
    initials: "JR",
    name: "Jamie Reyes",
    role: "Event Director, TechSummit PH",
    accent: false,
  },
  {
    text: "The live preview feature alone saves us so much back-and-forth. Upload, position, generate — every time, perfectly aligned.",
    initials: "AL",
    name: "Anna Lim",
    role: "Training Lead, MNL Corp",
    accent: true,
  },
  {
    text: "We issue 600+ certificates per semester. CertGen handles it all in under a minute and no data ever leaves my laptop. Incredible.",
    initials: "MC",
    name: "Mark Cruz",
    role: "Professor, State University",
    accent: false,
  },
];

// ─── Fade-up hook ─────────────────────────────────────────────────────────────
function useFadeUp() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

// ─── FadeUp wrapper component ─────────────────────────────────────────────────
function FadeUp({ children, delay = 0, className = "" }) {
  const [ref, visible] = useFadeUp();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Cert Mockup ──────────────────────────────────────────────────────────────
function CertMockup() {
  const [nameIdx, setNameIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setNameIdx((i) => (i + 1) % CYCLE_NAMES.length);
        setVisible(true);
      }, 400);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      className="w-full max-w-[460px] bg-white border-4 border-white"
      style={{ boxShadow: "12px 12px 0 #FDC800", aspectRatio: "1.414/1" }}
    >
      <div className="w-full h-full flex flex-col items-center justify-center p-10">
        {/* Header */}
        <div className="w-full text-center border-b-2 border-[#1C293C] pb-4 mb-6">
          <p
            className="text-[9px] font-bold uppercase tracking-[4px] text-[#1C293C] opacity-50"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            CERTGEN ORGANIZATION
          </p>
          <p
            className="text-[22px] tracking-[4px] text-[#1C293C] mt-1"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            CERTIFICATE OF COMPLETION
          </p>
        </div>

        <p className="text-[10px] font-medium uppercase tracking-[3px] text-[#1C293C] opacity-50 mb-2">
          This certificate is proudly awarded to
        </p>

        <AnimatePresence mode="wait">
          <motion.p
            key={nameIdx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-[36px] tracking-[3px] text-[#1C293C]"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            {CYCLE_NAMES[nameIdx]}
          </motion.p>
        </AnimatePresence>

        <p className="text-[9px] font-medium text-center opacity-50 mt-4 leading-relaxed max-w-[260px]">
          In recognition of outstanding achievement and successful completion of
          the required program.
        </p>

        {/* Footer */}
        <div className="w-full flex justify-between items-end mt-6 pt-4 border-t-2 border-[#1C293C]">
          <div className="text-center">
            <div className="w-[100px] border-t-2 border-[#1C293C] pt-1 text-[8px] font-bold uppercase tracking-[2px] opacity-50">
              Director
            </div>
          </div>
          <div
            className="w-[44px] h-[44px] border-[3px] border-[#1C293C] rounded-full flex items-center justify-center text-[9px] text-center leading-tight"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            CERT
            <br />
            GEN
          </div>
          <div className="text-center">
            <div className="w-[100px] border-t-2 border-[#1C293C] pt-1 text-[8px] font-bold uppercase tracking-[2px] opacity-50">
              Date
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Ticker ───────────────────────────────────────────────────────────────────
function Ticker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="border-b-[3px] border-[#1C293C] bg-[#FDC800] overflow-hidden py-[14px]">
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{ width: "max-content" }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-4 text-[12px] font-bold uppercase tracking-[3px] flex-shrink-0"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            <span className="w-2 h-2 bg-[#1C293C] inline-block flex-shrink-0" />
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Main Landing Page ────────────────────────────────────────────────────────
export default function LandingPage({ onLaunchApp, onPrivacy }) {
  return (
    <div
      className="min-h-screen text-[#1C293C] overflow-x-hidden"
      style={{
        backgroundColor: "#FBFBF9",
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(28,41,60,0.07) 1px, transparent 0)",
        backgroundSize: "24px 24px",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* ── NAV ── */}
      <nav className="border-b-[3px] border-[#1C293C] bg-[#FBFBF9] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className="text-[28px] tracking-[3px]"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              CertGen
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="#how"
              className="text-[11px] font-bold uppercase tracking-[2px] px-4 py-2 border-[3px] border-transparent hover:border-[#1C293C] hover:bg-[#FDC800] transition-all duration-100 hidden sm:block"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              How It Works
            </a>
            <a
              href="#features"
              className="text-[11px] font-bold uppercase tracking-[2px] px-4 py-2 border-[3px] border-transparent hover:border-[#1C293C] hover:bg-[#FDC800] transition-all duration-100 hidden sm:block"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              Features
            </a>
            <button
              onClick={onLaunchApp}
              className="text-[11px] font-bold uppercase tracking-[2px] px-5 py-[10px] bg-[#FDC800] border-[3px] border-[#1C293C] transition-all duration-100 active:translate-x-1 active:translate-y-1 active:shadow-none"
              style={{
                fontFamily: "'Space Mono', monospace",
                boxShadow: "4px 4px 0 #1C293C",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translate(-2px,-2px)";
                e.currentTarget.style.boxShadow = "6px 6px 0 #1C293C";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "";
                e.currentTarget.style.boxShadow = "4px 4px 0 #1C293C";
              }}
            >
              Start Now
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        className="border-b-[3px] border-[#1C293C]"
        style={{ minHeight: "calc(100vh - 64px)" }}
      >
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2">
          {/* Left */}
          <div className="py-20 lg:border-r-[3px] border-[#1C293C] flex flex-col justify-center gap-8 lg:pr-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-[3px] bg-[#1C293C]" />
              <span
                className="text-[11px] font-bold uppercase tracking-[4px]"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                Bulk Certificate Generator
              </span>
            </div>

            <h1
              className="leading-[0.9] tracking-[2px]"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(72px, 8vw, 120px)",
              }}
            >
              CERT
              <br />
              <span
                style={{
                  color: "#FDC800",
                  WebkitTextStroke: "3px #1C293C",
                }}
              >
                GEN
              </span>
            </h1>

            <p className="text-[18px] font-medium leading-[1.6] max-w-[480px] opacity-75">
              Upload a template. Drop an Excel file. Download a ZIP with every
              certificate perfectly generated — in seconds.
            </p>

            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={onLaunchApp}
                className="inline-flex items-center gap-3 text-[13px] font-bold uppercase tracking-[2px] px-9 py-[18px] bg-[#1C293C] text-[#FDC800] border-[3px] border-[#1C293C] transition-all duration-100"
                style={{
                  fontFamily: "'Space Mono', monospace",
                  boxShadow: "10px 10px 0 #1C293C",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translate(-3px,-3px)";
                  e.currentTarget.style.boxShadow = "13px 13px 0 #1C293C";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = "10px 10px 0 #1C293C";
                }}
              >
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 3l14 9-14 9V3z"
                  />
                </svg>
                Start Generating
              </button>
              <a
                href="#how"
                className="inline-flex items-center gap-3 text-[13px] font-bold uppercase tracking-[2px] px-9 py-[18px] bg-[#FBFBF9] text-[#1C293C] border-[3px] border-[#1C293C] transition-all duration-100 hover:bg-[#FDC800]"
                style={{
                  fontFamily: "'Space Mono', monospace",
                  boxShadow: "10px 10px 0 #1C293C",
                }}
              >
                See How It Works →
              </a>
            </div>

            {/* Stats */}
            <div className="flex gap-6 pt-4 border-t-[3px] border-[#1C293C]">
              {[
                { num: "500+", label: "Certs / Batch" },
                { num: "<60s", label: "Per Run" },
                { num: "0", label: "Manual Work" },
              ].map((s, i) => (
                <div
                  key={s.label}
                  className={`flex flex-col gap-1 ${i > 0 ? "pl-6 border-l-[3px] border-[#1C293C]" : ""}`}
                >
                  <span
                    className="text-[36px] leading-none tracking-[2px]"
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                  >
                    {s.num}
                  </span>
                  <span
                    className="text-[10px] font-bold uppercase tracking-[2px] opacity-50"
                    style={{ fontFamily: "'Space Mono', monospace" }}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Mockup */}
          <div className="hidden lg:flex items-center justify-center p-16 bg-[#1C293C] relative overflow-hidden">
            {/* BG text */}
            <span
              className="absolute text-[200px] text-white opacity-[0.03] tracking-[10px] whitespace-nowrap pointer-events-none"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%) rotate(-15deg)",
              }}
            >
              CERTGEN
            </span>

            {/* Floating badge */}
            <motion.div
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-10 right-10 bg-[#FDC800] border-[3px] border-white px-4 py-3 text-[10px] font-bold uppercase tracking-[2px] leading-[1.5]"
              style={{
                fontFamily: "'Space Mono', monospace",
                transform: "rotate(-2deg)",
              }}
            >
              ✦ NOW LIVE
              <br />
              FREE TO USE
            </motion.div>

            <CertMockup />
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <Ticker />

      {/* ── HOW IT WORKS ── */}
      <section className="border-b-[3px] border-[#1C293C]" id="how">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <p
            className="text-[11px] font-bold uppercase tracking-[4px] opacity-50 mb-4"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Process
          </p>
          <h2
            className="leading-[0.95] tracking-[2px] mb-16"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(48px, 5vw, 72px)",
            }}
          >
            THREE STEPS.
            <br />
            DONE.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 border-[3px] border-[#1C293C]">
            {STEPS.map((step, i) => (
              <FadeUp key={step.num} delay={i * 0.1}>
                <div
                  className={`p-12 relative group transition-all duration-150 cursor-default
                    ${i < STEPS.length - 1 ? "border-b-[3px] md:border-b-0 md:border-r-[3px] border-[#1C293C]" : ""}
                  `}
                  style={{ height: "100%" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#FDC800";
                    e.currentTarget.style.transform = "translate(-3px,-3px)";
                    e.currentTarget.style.boxShadow = "10px 10px 0 #1C293C";
                    e.currentTarget.style.zIndex = "1";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "";
                    e.currentTarget.style.transform = "";
                    e.currentTarget.style.boxShadow = "";
                    e.currentTarget.style.zIndex = "";
                  }}
                >
                  <span
                    className="absolute top-6 right-8 text-[80px] leading-none opacity-[0.08] pointer-events-none select-none"
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                  >
                    {step.num}
                  </span>
                  <div className="w-14 h-14 bg-[#FDC800] border-[3px] border-[#1C293C] flex items-center justify-center text-[24px] mb-6 group-hover:bg-[#1C293C] transition-colors">
                    {step.icon}
                  </div>
                  <h3
                    className="text-[28px] tracking-[2px] mb-3"
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                  >
                    {step.heading}
                  </h3>
                  <p className="text-[14px] font-medium leading-[1.6] opacity-65">
                    {step.desc}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="border-b-[3px] border-[#1C293C]" id="features">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2">
          {/* Left */}
          <div className="py-24 border-b-[3px] lg:border-b-0 lg:border-r-[3px] border-[#1C293C] lg:pr-16">
            <p
              className="text-[11px] font-bold uppercase tracking-[4px] opacity-50 mb-4"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              Features
            </p>
            <h2
              className="leading-[0.95] tracking-[2px] mb-10"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(48px, 5vw, 72px)",
              }}
            >
              BUILT FOR
              <br />
              REAL WORK.
            </h2>

            <div className="grid grid-cols-2 border-[3px] border-[#1C293C]">
              {FEATURES.map((f, i) => (
                <div
                  key={f.title}
                  className={`p-7 transition-colors cursor-default hover:bg-[#FDC800]
                    ${i % 2 === 0 ? "border-r-[3px] border-[#1C293C]" : ""}
                    ${i < 2 ? "border-b-[3px] border-[#1C293C]" : ""}
                  `}
                >
                  <div className="text-[28px] mb-3">{f.icon}</div>
                  <div
                    className="text-[12px] font-bold uppercase tracking-[2px] mb-2"
                    style={{ fontFamily: "'Space Mono', monospace" }}
                  >
                    {f.title}
                  </div>
                  <p className="text-[13px] leading-[1.6] opacity-60">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="flex flex-col">
            {/* Big panel */}
            <div
              className="flex-1 p-16 relative overflow-hidden flex flex-col justify-end border-b-[3px] border-[#1C293C]"
              style={{ background: "#432DD7", minHeight: "340px" }}
            >
              <span
                className="absolute text-[280px] leading-none opacity-[0.06] pointer-events-none select-none"
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  top: "-40px",
                  right: "-20px",
                }}
              >
                ∞
              </span>
              <p
                className="text-[10px] font-bold uppercase tracking-[4px] text-white opacity-50 mb-3"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                Privacy First
              </p>
              <h3
                className="text-[56px] leading-[0.95] tracking-[2px] text-white mb-4"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                100% CLIENT-SIDE PROCESSING
              </h3>
              <p className="text-[15px] text-white opacity-70 leading-[1.6] max-w-[340px]">
                Your data never leaves your browser. No servers, no accounts, no
                data storage. Just you and your certificates.
              </p>
            </div>

            {/* Counter */}
            <div className="p-12 bg-[#FDC800]">
              <div
                className="text-[88px] leading-none tracking-[4px]"
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  WebkitTextStroke: "3px #1C293C",
                  color: "transparent",
                }}
              >
                500+
              </div>
              <p
                className="text-[11px] font-bold uppercase tracking-[3px] opacity-60"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                Certificates in one batch
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="border-b-[3px] border-[#1C293C]">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <p
            className="text-[11px] font-bold uppercase tracking-[4px] opacity-50 mb-4"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            Testimonials
          </p>
          <h2
            className="leading-[0.95] tracking-[2px] mb-16"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(48px, 5vw, 72px)",
            }}
          >
            LOVED BY
            <br />
            ORGANIZERS.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <FadeUp key={t.name} delay={i * 0.1}>
                <div
                  className="border-[3px] border-[#1C293C] p-8 transition-all duration-100 cursor-default"
                  style={{
                    background: t.accent ? "#FDC800" : "#FBFBF9",
                    boxShadow: "4px 4px 0 #1C293C",
                    transform: t.accent ? "translateY(-12px)" : "none",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = t.accent
                      ? "translate(-3px, calc(-12px - 3px))"
                      : "translate(-3px,-3px)";
                    e.currentTarget.style.boxShadow = "10px 10px 0 #1C293C";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = t.accent
                      ? "translateY(-12px)"
                      : "";
                    e.currentTarget.style.boxShadow = "4px 4px 0 #1C293C";
                  }}
                >
                  <div
                    className="text-[72px] leading-[0.8] opacity-15 mb-2"
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                  >
                    "
                  </div>
                  <p className="text-[15px] font-medium leading-[1.65] mb-6 opacity-85">
                    {t.text}
                  </p>
                  <div className="flex items-center gap-3 pt-5 border-t-2 border-[#1C293C]">
                    <div
                      className="w-10 h-10 border-[3px] border-[#1C293C] flex items-center justify-center text-[16px] tracking-[1px] bg-[#1C293C] text-[#FDC800] flex-shrink-0"
                      style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                    >
                      {t.initials}
                    </div>
                    <div>
                      <p
                        className="text-[11px] font-bold uppercase tracking-[2px]"
                        style={{ fontFamily: "'Space Mono', monospace" }}
                      >
                        {t.name}
                      </p>
                      <p className="text-[11px] opacity-50 mt-[2px]">
                        {t.role}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        className="py-24 border-b-[3px] border-[#1C293C]"
        style={{ background: "#1C293C" }}
      >
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr_auto] items-center gap-16">
          <div>
            <h2
              className="leading-[0.95] tracking-[2px] text-[#FBFBF9]"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(48px, 6vw, 88px)",
              }}
            >
              STOP DOING
              <br />
              IT <span style={{ color: "#FDC800" }}>MANUALLY.</span>
            </h2>
            <p className="text-[16px] text-[#FBFBF9] opacity-50 mt-5 max-w-[480px] leading-[1.6]">
              Every minute spent copy-pasting names into certificates is a
              minute wasted. CertGen does it all — for free, forever.
            </p>
          </div>

          <button
            onClick={onLaunchApp}
            className="inline-flex items-center gap-3 text-[14px] font-bold uppercase tracking-[2px] px-12 py-6 bg-[#FDC800] text-[#1C293C] border-[3px] border-[#FDC800] transition-all duration-100 whitespace-nowrap"
            style={{
              fontFamily: "'Space Mono', monospace",
              boxShadow: "8px 8px 0 rgba(253,200,0,0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.borderColor = "#fff";
              e.currentTarget.style.transform = "translate(-4px,-4px)";
              e.currentTarget.style.boxShadow = "12px 12px 0 #FDC800";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#FDC800";
              e.currentTarget.style.borderColor = "#FDC800";
              e.currentTarget.style.transform = "";
              e.currentTarget.style.boxShadow = "8px 8px 0 rgba(253,200,0,0.3)";
            }}
          >
            Launch CertGen Free
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-between gap-6">
          <span
            className="text-[24px] tracking-[3px]"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            CertGen
          </span>
          <span
            className="text-[11px] font-bold uppercase tracking-[2px] opacity-40"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            © 2026 CertGen — Created by Sasi
          </span>
          <div className="flex gap-6">
            {["Privacy"].map((l) =>
              l === "Privacy" ? (
                <button
                  key={l}
                  onClick={onPrivacy}
                  className="text-[10px] font-bold uppercase tracking-[2px] text-[#1C293C] opacity-50 hover:opacity-100 transition-opacity bg-transparent border-none cursor-pointer"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  {l}
                </button>
              ) : (
                <a
                  key={l}
                  href="#"
                  className="text-[10px] font-bold uppercase tracking-[2px] text-[#1C293C] opacity-50 hover:opacity-100 transition-opacity no-underline"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  {l}
                </a>
              ),
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
