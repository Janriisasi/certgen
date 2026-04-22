import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";
import useCertGenerator from "./hooks/useCertGenerator";
import DropZone from "./components/DropZone";
import PlacementEditor from "./components/PlacementEditor";
import DelegateList from "./components/DelegateList";
import GenerateProgress from "./components/GenerateProgress";
import StepBadge from "./components/StepBadge";

// ─── Debounce helper ──────────────────────────────────────────────────────────
function useDebounce(fn, delay) {
  const timer = useRef(null);
  return (...args) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  };
}

export default function App({ onGoBack }) {
  const cert = useCertGenerator();
  const debouncedPreview = useDebounce(cert.updatePreview, 300);

  // Re-render preview whenever placement or previewName changes
  useEffect(() => {
    if (!cert.templateUrl) return;
    debouncedPreview(cert.previewName, cert.placement);
  }, [cert.placement, cert.previewName, cert.templateUrl]);

  const step1Done = !!cert.templateUrl;
  const step2Done = cert.delegates.length > 0;
  const step3Done = step1Done; // placement always available once template is set
  const readyToGenerate = step1Done && step2Done && !cert.generating;

  return (
    <div className="min-h-screen">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1C293C",
            color: "#FBFBF9",
            border: "3px solid #1C293C",
            borderRadius: "0",
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: "700",
            fontSize: "13px",
          },
          success: { iconTheme: { primary: "#FDC800", secondary: "#1C293C" } },
          error: { iconTheme: { primary: "#DC2626", secondary: "#FBFBF9" } },
        }}
      />

      {/* ── TOP BAR ───────────────────────────────────────────────────────── */}
      <header className="border-b-3 border-ink bg-ink text-surface sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/certgen.svg"
              alt="CertGen Logo"
              className="w-8 h-8 brightness-0 invert"
            />
            <span className="font-black uppercase tracking-widest text-sm">
              CertGen
            </span>
            <span className="hidden sm:block text-surface/40 text-xs font-mono">
              // Bulk E-Certificate Generator
            </span>
          </div>
          <div className="flex items-center gap-2">
            {onGoBack && (
              <button
                onClick={onGoBack}
                className="neo-btn bg-surface/10 text-surface border-surface/30 px-3 py-1.5 text-[10px] uppercase tracking-widest hover:bg-surface hover:text-ink"
              >
                Back
              </button>
            )}
            {cert.templateUrl && (
              <button
                onClick={cert.reset}
                className="neo-btn bg-surface/10 text-surface border-surface/30 px-3 py-1.5 text-[10px] uppercase tracking-widest hover:bg-surface hover:text-ink"
              >
                ↺ Reset
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="border-b-3 border-ink bg-primary">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-block neo-badge bg-ink text-primary mb-4">
              100% Free · No Sign-up · Runs in Browser
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
              Bulk
              <br />
              Certificate
              <br />
              Generator
            </h1>
          </div>
          <p className="max-w-xs text-sm font-semibold text-ink/70 md:text-right leading-relaxed">
            Upload your Excel list + certificate template. We overlay each name
            automatically. Download all as a ZIP.
          </p>
        </div>
      </section>

      {/* ── STEPS OVERVIEW (mobile-friendly) ─────────────────────────────── */}
      <div className="border-b-3 border-ink bg-surface">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap gap-6 items-center">
          <StepBadge
            number="1"
            label="Upload Template"
            active={!step1Done}
            done={step1Done}
          />
          <div className="w-8 h-0.5 bg-ink/20 hidden sm:block" />
          <StepBadge
            number="2"
            label="Upload Excel"
            active={step1Done && !step2Done}
            done={step2Done}
          />
          <div className="w-8 h-0.5 bg-ink/20 hidden sm:block" />
          <StepBadge
            number="3"
            label="Position Name"
            active={step1Done && step2Done}
            done={cert.done}
          />
          <div className="w-8 h-0.5 bg-ink/20 hidden sm:block" />
          <StepBadge
            number="4"
            label="Generate & Download"
            active={readyToGenerate}
            done={cert.done}
          />
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-8">
          {/* ── LEFT COLUMN ───────────────────────────────────────────────── */}
          <div className="space-y-6">
            {/* STEP 1 + 2 — Uploads */}
            <div className="neo-card">
              <div className="p-5 border-b-3 border-ink bg-ink text-surface">
                <p className="font-black text-xs uppercase tracking-widest">
                  Step 1 & 2 — Upload Files
                </p>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="neo-label mb-3">Certificate Template (PNG)</p>
                  <DropZone
                    accept="image/png,image/jpeg,image/jpg"
                    onFile={cert.loadTemplate}
                    file={cert.templateFile}
                    label="Drop Template Image"
                    hint="PNG — your Canva design exported"
                    icon="🖼️"
                  />
                </div>
                <div>
                  <p className="neo-label mb-3">Excel File (.xlsx / .csv)</p>
                  <DropZone
                    accept=".xlsx,.xls,.csv"
                    onFile={cert.loadExcel}
                    file={cert.excelFile}
                    label="Drop Excel / CSV"
                    hint="Must have a column with 'Name' in the header"
                    icon="📋"
                    disabled={!cert.templateUrl}
                  />
                </div>
              </div>

              {/* Excel format hint */}
              <div className="px-5 pb-5">
                <div className="border-3 border-ink/20 p-3 bg-ink/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-ink/60 mb-2">
                    Excel Format Example
                  </p>
                  <div className="overflow-x-auto">
                    <table className="text-xs font-mono border-collapse w-full">
                      <thead>
                        <tr className="bg-primary">
                          {["Name", "Church", "Role", "Payment"].map((h) => (
                            <td
                              key={h}
                              className="border-2 border-ink px-3 py-1 font-black uppercase text-[10px]"
                            >
                              {h}
                            </td>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["Maria Santos", "Capiz EC", "Camper", "Paid"],
                          ["Juan dela Cruz", "Hilltop BC", "Camper", "Paid"],
                        ].map((row, i) => (
                          <tr key={i} className="hover:bg-ink/5">
                            {row.map((cell, j) => (
                              <td
                                key={j}
                                className="border-2 border-ink/20 px-3 py-1 text-ink/70"
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[12px] text-black mt-2 font-medium background-clip-text bg-yellow-500">
                    Reminder: The system auto-detects any column containing the
                    word <b>Name</b>. Other columns are <b>IGNORED.</b>
                  </p>
                </div>
              </div>
            </div>

            {/* Delegates List */}
            <AnimatePresence>
              {cert.delegates.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                >
                  <DelegateList
                    delegates={cert.delegates}
                    excelMeta={cert.excelMeta}
                    onClear={() => {
                      cert.loadExcel &&
                        (() => {
                          // just clear state manually
                        })();
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* STEP 3 — Placement Editor */}
            <AnimatePresence>
              {cert.templateUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="neo-card"
                >
                  <div className="p-5 border-b-3 border-ink bg-ink text-surface">
                    <p className="font-black text-xs uppercase tracking-widest">
                      Step 3 — Position Name on Certificate
                    </p>
                  </div>
                  <div className="p-5">
                    <PlacementEditor
                      placement={cert.placement}
                      onChange={cert.updatePlacement}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* STEP 4 — Generate */}
            <AnimatePresence>
              {readyToGenerate && !cert.generating && !cert.done && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="neo-card border-primary bg-primary p-6"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-black text-lg uppercase tracking-tight">
                        Ready to Generate!
                      </p>
                      <p className="text-sm font-medium text-ink/70">
                        {cert.delegates.length} certificate
                        {cert.delegates.length !== 1 ? "s" : ""} will be created
                        and downloaded as a ZIP.
                      </p>
                    </div>
                    <button
                      onClick={cert.generateAll}
                      className="neo-btn-secondary whitespace-nowrap bg-ink text-primary border-ink hover:bg-ink/80 px-8 py-4 text-base"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                        />
                      </svg>
                      Generate & Download ZIP
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress */}
            <AnimatePresence>
              {(cert.generating || cert.done) && (
                <GenerateProgress progress={cert.progress} done={cert.done} />
              )}
            </AnimatePresence>

            {/* Done — re-download */}
            <AnimatePresence>
              {cert.done && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="neo-card p-5 bg-success/10 border-success flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div>
                    <p className="font-black uppercase tracking-widest text-success">
                      ✓ Certificates Generated
                    </p>
                    <p className="text-xs font-medium text-ink/60 mt-0.5">
                      Your ZIP was automatically downloaded. Want to regenerate
                      with different settings?
                    </p>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={cert.generateAll}
                      className="neo-btn-primary text-xs px-4 py-2"
                    >
                      ↺ Re-generate
                    </button>
                    <button
                      onClick={cert.reset}
                      className="neo-btn-secondary text-xs px-4 py-2"
                    >
                      Start Over
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── RIGHT COLUMN — LIVE PREVIEW ──────────────────────────────── */}
          <div className="xl:sticky xl:top-20 xl:self-start space-y-4">
            <div className="neo-card">
              <div className="p-4 border-b-3 border-ink bg-ink text-surface flex items-center justify-between">
                <p className="font-black text-xs uppercase tracking-widest">
                  Live Preview
                </p>
                {cert.templateUrl && (
                  <span className="text-[10px] font-mono text-surface/50">
                    {cert.templateDimensions.w} × {cert.templateDimensions.h}px
                  </span>
                )}
              </div>

              <div className="p-4 space-y-4">
                {/* Preview name input */}
                <div>
                  <label className="neo-label">Preview Name</label>
                  <input
                    type="text"
                    value={cert.previewName}
                    onChange={(e) => cert.setPreviewName(e.target.value)}
                    className="neo-input"
                    placeholder="Type a name to preview…"
                  />
                </div>

                {/* Preview canvas */}
                <div className="border-3 border-ink min-h-40 bg-ink/5 flex items-center justify-center overflow-hidden">
                  {cert.previewCanvas ? (
                    <img
                      src={cert.previewCanvas}
                      alt="Certificate preview"
                      className="w-full object-contain"
                    />
                  ) : cert.templateUrl ? (
                    <div className="text-center p-6">
                      <div className="w-10 h-10 border-3 border-ink bg-primary mx-auto flex items-center justify-center mb-3">
                        <svg
                          className="w-5 h-5 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                      </div>
                      <p className="text-xs font-bold uppercase tracking-widest text-ink/50">
                        Rendering…
                      </p>
                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <p className="text-4xl mb-3">🖼️</p>
                      <p className="text-xs font-bold uppercase tracking-widest text-ink/40">
                        Upload a template to preview
                      </p>
                    </div>
                  )}
                </div>

                {/* Download single preview */}
                {cert.previewCanvas && (
                  <a
                    href={cert.previewCanvas}
                    download={`preview_${cert.previewName || "cert"}.png`}
                    className="neo-btn-secondary w-full justify-center text-xs"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                      />
                    </svg>
                    Download Preview
                  </a>
                )}
              </div>
            </div>

            {/* Tips card */}
            <div className="neo-card">
              <div className="p-4 border-b-3 border-ink bg-primary">
                <p className="font-black text-xs uppercase tracking-widest">
                  Tips
                </p>
              </div>
              <div className="p-4 space-y-3">
                {[
                  {
                    icon: "🎨",
                    text: "Design in Canva → Export as PNG (high quality). Leave a blank area where the name goes.",
                  },
                  {
                    icon: "📊",
                    text: 'Excel column header must contain the word "name" (e.g. "Full Name", "Delegate Name"). Other columns are ignored.',
                  },
                  {
                    icon: "🎯",
                    text: "Use the Live Preview to fine-tune X/Y position before generating all certificates.",
                  },
                  {
                    icon: "📦",
                    text: "Certificates are numbered in the ZIP (001_Name.png) matching the order in your Excel.",
                  },
                  {
                    icon: "🔒",
                    text: "Everything runs in your browser. No files are uploaded to any server.",
                  },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex gap-3 text-xs">
                    <span className="flex-shrink-0">{icon}</span>
                    <p className="text-ink/70 font-medium leading-relaxed">
                      {text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="border-t-3 border-ink bg-ink text-surface mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/certgen.svg"
              alt="CertGen Logo"
              className="w-8 h-8 brightness-0 invert"
            />
            <span className="font-black text-xs uppercase tracking-widest">
              CertGen
            </span>
          </div>
          <p className="text-surface/40 text-xs font-mono">Created by Sasi</p>
        </div>
      </footer>
    </div>
  );
}
