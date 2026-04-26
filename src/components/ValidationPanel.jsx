import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ValidationPanel({ errors, onDismiss }) {
  const [expanded, setExpanded] = useState(false);
  if (!errors || errors.length === 0) return null;

  const visibleErrors = expanded ? errors : errors.slice(0, 5);
  const hasMore = errors.length > 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="border-3 border-danger shadow-[4px_4px_0px_#DC2626] bg-danger/5"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b-3 border-danger bg-danger">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white text-danger border-2 border-white flex items-center justify-center font-black text-sm flex-shrink-0">
            !
          </div>
          <div>
            <p className="font-black text-sm uppercase tracking-widest text-white">
              Pre-Validation Failed
            </p>
            <p className="text-[10px] font-bold text-white/70 uppercase">
              {errors.length} row{errors.length !== 1 ? "s" : ""} need your attention before generating
            </p>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="w-7 h-7 border-2 border-white text-white flex items-center justify-center font-black text-sm hover:bg-white hover:text-danger transition-colors"
            aria-label="Dismiss validation errors"
          >
            ×
          </button>
        )}
      </div>

      {/* Error list */}
      <div className="divide-y-2 divide-danger/20">
        {visibleErrors.map((err, i) => (
          <div key={i} className="px-4 py-3 flex gap-4">
            <div className="flex-shrink-0 font-mono text-[10px] font-black text-danger/60 bg-danger/10 border border-danger/30 px-2 py-1 h-fit whitespace-nowrap">
              {err.rowIndex === -1 ? "FILE" : `ROW ${err.rowIndex}`}
            </div>
            <div className="min-w-0 flex-1">
              {err.name && (
                <p className="text-xs font-black text-ink truncate mb-1">
                  "{err.name}"
                </p>
              )}
              <ul className="space-y-0.5">
                {err.issues.map((issue, j) => (
                  <li key={j} className="text-xs text-danger font-semibold flex gap-2">
                    <span className="flex-shrink-0">→</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Show more / less */}
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full py-3 text-xs font-black uppercase tracking-widest border-t-3 border-danger text-danger hover:bg-danger/10 transition-colors"
        >
          {expanded
            ? "▲ Show Less"
            : `▼ Show ${errors.length - 5} More Issue${errors.length - 5 !== 1 ? "s" : ""}`}
        </button>
      )}

      {/* Action hint */}
      <div className="p-4 border-t-3 border-danger/20 bg-danger/5">
        <p className="text-[10px] font-black uppercase tracking-widest text-ink/50">
          Fix these rows in your Excel / CSV file and re-upload. Rows with errors will be skipped during generation.
        </p>
      </div>
    </motion.div>
  );
}