import { motion } from "framer-motion";

export default function GenerateProgress({ progress, done }) {
  const pct =
    progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="neo-card p-6 space-y-5"
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 border-3 border-ink flex items-center justify-center flex-shrink-0
          ${done ? "bg-success" : "bg-primary"}`}
        >
          {done ? (
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6 animate-spin"
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
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-black text-sm uppercase tracking-widest">
            {done ? "All Done! ZIP Downloaded." : "Generating Certificates…"}
          </p>
          {!done && progress.name && (
            <p className="text-xs text-ink/60 font-medium truncate mt-0.5">
              Processing: {progress.name}
            </p>
          )}
        </div>

        <div className="font-mono font-black text-lg flex-shrink-0">{pct}%</div>
      </div>

      {/* Progress bar */}
      <div className="border-3 border-ink h-8 relative overflow-hidden bg-surface">
        <motion.div
          className={`absolute inset-y-0 left-0 ${done ? "bg-success" : "bg-primary"}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ ease: "easeOut", duration: 0.3 }}
        >
          {!done && <div className="absolute inset-0 progress-stripe" />}
        </motion.div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono font-black text-xs uppercase tracking-widest mix-blend-difference text-white">
            {done ? "Complete" : `${progress.current} / ${progress.total}`}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
