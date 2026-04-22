import { useState } from "react";

export default function DelegateList({ delegates, excelMeta, onClear }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? delegates : delegates.slice(0, 8);

  if (!delegates.length) return null;

  return (
    <div className="neo-card">
      <div className="flex items-center justify-between p-4 border-b-3 border-ink bg-primary">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-ink text-primary border-2 border-ink flex items-center justify-center font-black text-sm">
            {delegates.length}
          </div>
          <div>
            <p className="font-black text-sm uppercase tracking-widest">
              Names Loaded
            </p>
            <p className="font-black text-xs uppercase">
              Check the names before generating certificates.
            </p>
            {excelMeta && (
              <p className="text-[10px] font-bold text-ink/60 uppercase">
                Column: "{excelMeta.headers[excelMeta.nameColIndex]}"
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="divide-y-2 divide-ink/10 max-h-64 overflow-y-auto">
        {visible.map((name, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary/10 transition-colors"
          >
            <span className="font-mono text-[10px] font-bold text-ink/40 w-6 text-right flex-shrink-0">
              {i + 1}
            </span>
            <span className="text-sm font-semibold truncate">{name}</span>
          </div>
        ))}
      </div>

      {delegates.length > 8 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full py-3 text-xs font-black uppercase tracking-widest border-t-3 border-ink hover:bg-primary/20 transition-colors"
        >
          {expanded ? "▲ Show Less" : `▼ Show ${delegates.length - 8} More`}
        </button>
      )}
    </div>
  );
}
