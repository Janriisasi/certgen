import { motion } from "framer-motion";

function StatBox({ value, label, accent = "bg-primary" }) {
  return (
    <div className={`border-3 border-ink p-4 ${accent} flex flex-col items-center justify-center gap-1 min-w-[100px]`}>
      <span className="font-black text-2xl leading-none">{value}</span>
      <span className="font-bold text-[10px] uppercase tracking-widest text-ink/70 text-center">{label}</span>
    </div>
  );
}

export default function GenerationReport({ report, failedItems, onRetryFailed, onRegenerate, onReset, onDownloadPdf }) {
  if (!report) return null;

  const { successCount, failCount, elapsed, timeSaved, total } = report;
  const successRate = total > 0 ? Math.round((successCount / total) * 100) : 0;

  // Human-readable time saved
  const timeSavedLabel =
    timeSaved >= 60
      ? `${Math.floor(timeSaved / 60)}h ${timeSaved % 60}m saved`
      : `${timeSaved}m saved`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-3 border-ink shadow-[6px_6px_0px_#1C293C]"
    >
      {/* Header */}
      <div className={`p-5 border-b-3 border-ink ${failCount === 0 ? "bg-success" : "bg-warning"}`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-ink text-surface border-3 border-ink flex items-center justify-center font-black text-xl flex-shrink-0">
            {failCount === 0 ? "✓" : "⚠"}
          </div>
          <div>
            <p className="font-black text-lg uppercase tracking-tight text-white">
              {failCount === 0 ? "Generation Complete!" : "Completed with Warnings"}
            </p>
            <p className="text-white/80 text-xs font-bold uppercase tracking-widest">
              {failCount === 0
                ? "All certificates generated successfully."
                : `${failCount} certificate${failCount !== 1 ? "s" : ""} failed — retry them below.`}
            </p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="p-5 border-b-3 border-ink">
        <p className="text-[10px] font-black uppercase tracking-widest text-ink/50 mb-4">
          Generation Report
        </p>
        <div className="flex flex-wrap gap-3">
          <StatBox value={successCount} label="Successful" accent="bg-success/20" />
          {failCount > 0 && (
            <StatBox value={failCount} label="Failed" accent="bg-danger/20" />
          )}
          <StatBox value={`${elapsed}s`} label="Duration" accent="bg-primary/40" />
          <StatBox value={`${successRate}%`} label="Success Rate" accent="bg-surface" />
          <StatBox value={timeSavedLabel} label="Time Saved" accent="bg-primary" />
        </div>
      </div>

      {/* Failed items detail */}
      {failedItems && failedItems.length > 0 && (
        <div className="border-b-3 border-ink">
          <div className="p-4 bg-danger/5 border-b-2 border-danger/20">
            <p className="text-xs font-black uppercase tracking-widest text-danger">
              Failed Items ({failedItems.length})
            </p>
          </div>
          <div className="max-h-40 overflow-y-auto divide-y-2 divide-ink/10">
            {failedItems.map((item, i) => (
              <div key={i} className="px-4 py-2 flex gap-3 items-start">
                <span className="font-mono text-[10px] text-danger/60 font-bold flex-shrink-0 mt-0.5">
                  #{item.globalIndex + 2}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">{item.name}</p>
                  <p className="text-[10px] text-danger font-medium">{item.error}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="p-5 flex flex-wrap gap-3">
        {failedItems && failedItems.length > 0 && onRetryFailed && (
          <button
            onClick={onRetryFailed}
            className="neo-btn border-3 border-danger bg-danger text-white font-black text-xs uppercase tracking-widest px-5 py-2.5 hover:bg-danger/80 shadow-[3px_3px_0px_#991B1B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            ↺ Retry {failedItems.length} Failed
          </button>
        )}
        {onDownloadPdf && (
          <button
            onClick={onDownloadPdf}
            className="neo-btn border-3 border-ink bg-secondary text-white font-black text-xs uppercase tracking-widest px-5 py-2.5 shadow-[3px_3px_0px_#1C293C] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            📄 Export as PDF
          </button>
        )}
        {onRegenerate && (
          <button
            onClick={onRegenerate}
            className="neo-btn-primary text-xs px-5 py-2.5"
          >
            ↺ Re-generate ZIP
          </button>
        )}
        {onReset && (
          <button
            onClick={onReset}
            className="neo-btn-secondary text-xs px-5 py-2.5"
          >
            Start Over
          </button>
        )}
      </div>

      {/* Fun footer */}
      <div className="px-5 pb-4">
        <p className="text-[10px] font-bold text-ink/40 uppercase tracking-widest">
          🎉 You saved approximately {timeSavedLabel} of copy-pasting!
        </p>
      </div>
    </motion.div>
  );
}