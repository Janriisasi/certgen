export default function StepBadge({ number, label, active, done }) {
  return (
    <div
      className={`flex items-center gap-3 ${active ? "opacity-100" : done ? "opacity-100" : "opacity-40"}`}
    >
      <div
        className={`w-9 h-9 border-3 border-ink flex items-center justify-center font-black text-sm flex-shrink-0 transition-colors
          ${done ? "bg-success text-white" : active ? "bg-primary text-ink" : "bg-surface text-ink"}`}
      >
        {done ? (
          <svg
            className="w-4 h-4"
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
          number
        )}
      </div>
      <span className="font-bold text-sm uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}
