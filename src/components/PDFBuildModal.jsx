import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * PdfBuildModal
 * Shown during Phase 2 of PDF export (building the PDF in the worker).
 * Blocks all interaction via a backdrop — user cannot press anything until done.
 *
 * Props:
 *   open       boolean  — whether modal is visible
 *   current    number   — pages processed so far
 *   total      number   — total pages
 */
export default function PdfBuildModal({ open, current, total }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  // Estimate seconds remaining based on average pace so far
  const [startTime] = useState(() => Date.now());
  const [eta, setEta] = useState(null);

  useEffect(() => {
    if (!open) return;
    if (current === 0 || total === 0) { setEta(null); return; }
    const elapsed = (Date.now() - startTime) / 1000;
    const pace = elapsed / current; // seconds per page
    const remaining = Math.ceil(pace * (total - current));
    setEta(remaining);
  }, [current, open, total, startTime]);

  const etaLabel =
    eta === null
      ? "Calculating…"
      : eta <= 0
      ? "Almost done…"
      : eta >= 60
      ? `~${Math.floor(eta / 60)}m ${eta % 60}s remaining`
      : `~${eta}s remaining`;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* ── Backdrop — blurs the entire page and blocks all clicks ── */}
          <motion.div
            key="pdf-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-ink/60 backdrop-blur-sm"
            // pointer-events intentionally NOT disabled — we want it to block clicks
          />

          {/* ── Modal ── */}
          <motion.div
            key="pdf-modal"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-6 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-md border-3 border-ink shadow-[8px_8px_0px_#1C293C] bg-surface"
            >
              {/* Header */}
              <div className="flex items-center gap-4 p-5 border-b-3 border-ink bg-secondary">
                {/* Animated spinner icon */}
                <div className="w-12 h-12 border-3 border-white/40 bg-white/10 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-6 h-6 animate-spin text-white"
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
                <div>
                  <p className="font-black text-sm uppercase tracking-widest text-white">
                    Building PDF
                  </p>
                  <p className="text-white/70 text-[11px] font-bold uppercase tracking-widest mt-0.5">
                    Please wait — do not close this tab
                  </p>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {/* Big page counter */}
                <div className="border-3 border-ink bg-primary p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-ink/50 mb-1">
                      Pages Compiled
                    </p>
                    <p className="font-black text-3xl leading-none tabular-nums">
                      {current}
                      <span className="text-ink/30 text-xl"> / {total}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-ink/50 mb-1">
                      Time Remaining
                    </p>
                    <p className="font-black text-sm uppercase tracking-widest">
                      {etaLabel}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="border-3 border-ink h-8 relative overflow-hidden bg-ink/5">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-secondary"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ ease: "easeOut", duration: 0.3 }}
                    >
                      {/* Animated stripes */}
                      <div
                        className="absolute inset-0 opacity-20"
                        style={{
                          backgroundImage:
                            "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.4) 10px, rgba(255,255,255,0.4) 20px)",
                        }}
                      />
                    </motion.div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-mono font-black text-xs uppercase tracking-widest mix-blend-difference text-white">
                        {pct}%
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-ink/40">
                    <span>✓ {current} done</span>
                    <span>{total - current} remaining</span>
                  </div>
                </div>

                {/* Info note */}
                <div className="border-3 border-ink/20 bg-ink/5 p-3 flex gap-3 items-start">
                  <span className="text-base flex-shrink-0">🔒</span>
                  <p className="text-[11px] font-semibold text-ink/60 leading-relaxed">
                    PDF is being compiled in a background thread. All{" "}
                    <span className="font-black text-ink">{total}</span> certificates
                    will be packaged into a single file and downloaded automatically
                    when complete.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}