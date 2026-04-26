import { motion } from "framer-motion";

const CHUNK_SIZE = 15;

export default function GenerateProgress({ progress, done }) {
  const pct =
    progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

  const currentChunk = progress.total > 0
    ? Math.ceil(progress.current / CHUNK_SIZE)
    : 0;
  const totalChunks = progress.total > 0
    ? Math.ceil(progress.total / CHUNK_SIZE)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-3 border-ink shadow-[4px_4px_0px_#1C293C] bg-surface"
    >
      {/* Header row */}
      <div className="flex items-center gap-4 p-5 border-b-3 border-ink">
        <div
          className={`w-12 h-12 border-3 border-ink flex items-center justify-center flex-shrink-0 transition-colors
          ${done ? "bg-success" : "bg-primary"}`}
        >
          {done ? (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          ) : (
            <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-black text-sm uppercase tracking-widest">
            {done ? "Generation Complete — Packaging ZIP…" : "Generating Certificates…"}
          </p>
          {!done && progress.name && (
            <p className="text-xs text-ink/60 font-medium truncate mt-0.5">
              Processing: <span className="font-bold text-ink">{progress.name}</span>
            </p>
          )}
          {!done && totalChunks > 0 && (
            <p className="text-[10px] font-bold text-ink/40 uppercase tracking-widest mt-0.5">
              Batch {currentChunk} of {totalChunks} · {CHUNK_SIZE} per batch · Web Worker active
            </p>
          )}
        </div>

        <div className="font-mono font-black text-2xl flex-shrink-0 leading-none">
          {pct}%
        </div>
      </div>

      {/* Progress bar */}
      <div className="p-5 space-y-3">
        <div className="border-3 border-ink h-10 relative overflow-hidden bg-ink/5">
          <motion.div
            className={`absolute inset-y-0 left-0 ${done ? "bg-success" : "bg-primary"}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ ease: "easeOut", duration: 0.25 }}
          >
            {!done && (
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.15) 10px, rgba(0,0,0,0.15) 20px)",
                }}
              />
            )}
          </motion.div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono font-black text-xs uppercase tracking-widest mix-blend-difference text-white">
              {done ? "Complete" : `${progress.current} / ${progress.total}`}
            </span>
          </div>
        </div>

        {/* Sub-stats */}
        {!done && progress.total > 0 && (
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-ink/40">
            <span>✓ {progress.current} done</span>
            <span>{progress.total - progress.current} remaining</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}