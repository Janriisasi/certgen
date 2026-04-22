const FONTS = [
  { label: "Georgia (Serif)", value: "Georgia, serif" },
  { label: "Times New Roman", value: "Times New Roman, Times, serif" },
  {
    label: "Palatino",
    value: "Palatino Linotype, Book Antiqua, Palatino, serif",
  },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Courier New", value: "Courier New, monospace" },
  { label: "Trebuchet MS", value: "Trebuchet MS, sans-serif" },
];

const WEIGHTS = [
  { label: "Normal", value: "normal" },
  { label: "Bold", value: "bold" },
  { label: "600", value: "600" },
  { label: "800", value: "800" },
];

function SliderRow({ label, value, min, max, step = 1, onChange, unit = "" }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="neo-label mb-0">{label}</label>
        <span className="font-mono text-xs font-bold bg-primary px-2 py-0.5 border-2 border-ink">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-ink h-2 cursor-pointer"
      />
      <div className="flex justify-between text-[10px] font-bold text-ink/40">
        <span>
          {min}
          {unit}
        </span>
        <span>
          {max}
          {unit}
        </span>
      </div>
    </div>
  );
}

export default function PlacementEditor({ placement, onChange }) {
  return (
    <div className="space-y-5">
      <SliderRow
        label="Horizontal Position (X)"
        value={placement.x}
        min={0}
        max={100}
        unit="%"
        onChange={(v) => onChange("x", v)}
      />
      <SliderRow
        label="Vertical Position (Y)"
        value={placement.y}
        min={0}
        max={100}
        unit="%"
        onChange={(v) => onChange("y", v)}
      />
      <SliderRow
        label="Font Size"
        value={placement.fontSize}
        min={12}
        max={200}
        unit="px"
        onChange={(v) => onChange("fontSize", v)}
      />

      <div className="grid grid-cols-2 gap-4">
        {/* Font Family */}
        <div className="space-y-1.5">
          <label className="neo-label">Font Family</label>
          <select
            value={placement.fontFamily}
            onChange={(e) => onChange("fontFamily", e.target.value)}
            className="neo-input text-xs pr-3"
          >
            {FONTS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        {/* Font Weight */}
        <div className="space-y-1.5">
          <label className="neo-label">Font Weight</label>
          <select
            value={placement.fontWeight}
            onChange={(e) => onChange("fontWeight", e.target.value)}
            className="neo-input text-xs pr-3"
          >
            {WEIGHTS.map((w) => (
              <option key={w.value} value={w.value}>
                {w.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Text Color */}
      <div className="space-y-1.5">
        <label className="neo-label">Text Color</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={placement.color}
            onChange={(e) => onChange("color", e.target.value)}
            className="w-12 h-12 border-3 border-ink cursor-pointer p-0.5 bg-surface"
          />
          <input
            type="text"
            value={placement.color}
            onChange={(e) => onChange("color", e.target.value)}
            className="neo-input font-mono text-sm flex-1"
            placeholder="#ffffff"
          />
        </div>
      </div>

      {/* Quick color presets */}
      <div className="space-y-1.5">
        <label className="neo-label">Quick Presets</label>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Black", value: "#1C293C" },
            { label: "White", value: "#FFFFFF" },
            { label: "Gold", value: "#B8860B" },
            { label: "Navy", value: "#001F5B" },
            { label: "Maroon", value: "#7B0000" },
          ].map((c) => (
            <button
              key={c.value}
              onClick={() => onChange("color", c.value)}
              className={`neo-btn px-3 py-1.5 text-[10px] uppercase tracking-widest
                ${placement.color === c.value ? "bg-primary" : "bg-surface hover:bg-primary/20"}`}
              style={c.value === "#FFFFFF" ? { background: "#fff" } : {}}
            >
              <span
                className="w-3 h-3 border-2 border-ink inline-block"
                style={{ background: c.value }}
              />
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}