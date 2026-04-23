import { useState, useEffect, useRef } from "react";

// ─── Google Fonts grouped by category ────────────────────────────────────────
// Each font is loaded dynamically from Google Fonts API
const FONT_GROUPS = [
  {
    group: "✦ Serif",
    fonts: [
      { label: "Playfair Display", value: "'Playfair Display', Georgia, serif" },
      { label: "Cormorant Garamond", value: "'Cormorant Garamond', Georgia, serif" },
      { label: "EB Garamond", value: "'EB Garamond', Georgia, serif" },
      { label: "Libre Baskerville", value: "'Libre Baskerville', Georgia, serif" },
      { label: "Lora", value: "'Lora', Georgia, serif" },
      { label: "Merriweather", value: "'Merriweather', Georgia, serif" },
      { label: "Crimson Text", value: "'Crimson Text', Georgia, serif" },
      { label: "Gentium Book Plus", value: "'Gentium Book Plus', Georgia, serif" },
      { label: "Source Serif 4", value: "'Source Serif 4', Georgia, serif" },
      { label: "Bitter", value: "'Bitter', Georgia, serif" },
      { label: "Gelasio", value: "'Gelasio', Georgia, serif" },
      { label: "Zilla Slab", value: "'Zilla Slab', Georgia, serif" },
      { label: "Georgia (System)", value: "Georgia, serif" },
      { label: "Times New Roman (System)", value: "Times New Roman, Times, serif" },
    ],
  },
  {
    group: "✦ Sans-Serif",
    fonts: [
      { label: "Montserrat", value: "'Montserrat', Arial, sans-serif" },
      { label: "Raleway", value: "'Raleway', Arial, sans-serif" },
      { label: "Nunito", value: "'Nunito', Arial, sans-serif" },
      { label: "Poppins", value: "'Poppins', Arial, sans-serif" },
      { label: "Inter", value: "'Inter', Arial, sans-serif" },
      { label: "Lato", value: "'Lato', Arial, sans-serif" },
      { label: "Open Sans", value: "'Open Sans', Arial, sans-serif" },
      { label: "Roboto", value: "'Roboto', Arial, sans-serif" },
      { label: "Oswald", value: "'Oswald', Arial, sans-serif" },
      { label: "Work Sans", value: "'Work Sans', Arial, sans-serif" },
      { label: "Josefin Sans", value: "'Josefin Sans', Arial, sans-serif" },
      { label: "Cabin", value: "'Cabin', Arial, sans-serif" },
      { label: "Exo 2", value: "'Exo 2', Arial, sans-serif" },
      { label: "Urbanist", value: "'Urbanist', Arial, sans-serif" },
      { label: "DM Sans", value: "'DM Sans', Arial, sans-serif" },
      { label: "Arial (System)", value: "Arial, Helvetica, sans-serif" },
      { label: "Verdana (System)", value: "Verdana, Geneva, sans-serif" },
    ],
  },
  {
    group: "✦ Display / Decorative",
    fonts: [
      { label: "Cinzel", value: "'Cinzel', serif" },
      { label: "Cinzel Decorative", value: "'Cinzel Decorative', serif" },
      { label: "Uncial Antiqua", value: "'Uncial Antiqua', serif" },
      { label: "MedievalSharp", value: "'MedievalSharp', serif" },
      { label: "Poiret One", value: "'Poiret One', sans-serif" },
      { label: "Philosopher", value: "'Philosopher', serif" },
      { label: "Spectral", value: "'Spectral', serif" },
      { label: "Abril Fatface", value: "'Abril Fatface', serif" },
      { label: "Alfa Slab One", value: "'Alfa Slab One', serif" },
      { label: "Playfair Display SC", value: "'Playfair Display SC', serif" },
      { label: "Yeseva One", value: "'Yeseva One', serif" },
      { label: "Bebas Neue", value: "'Bebas Neue', sans-serif" },
      { label: "Righteous", value: "'Righteous', sans-serif" },
      { label: "Satisfy", value: "'Satisfy', cursive" },
    ],
  },
  {
    group: "✦ Script / Handwriting",
    fonts: [
      { label: "Great Vibes", value: "'Great Vibes', cursive" },
      { label: "Parisienne", value: "'Parisienne', cursive" },
      { label: "Tangerine", value: "'Tangerine', cursive" },
      { label: "Dancing Script", value: "'Dancing Script', cursive" },
      { label: "Pacifico", value: "'Pacifico', cursive" },
      { label: "Sacramento", value: "'Sacramento', cursive" },
      { label: "Pinyon Script", value: "'Pinyon Script', cursive" },
      { label: "Clicker Script", value: "'Clicker Script', cursive" },
      { label: "Italianno", value: "'Italianno', cursive" },
      { label: "Lobster", value: "'Lobster', cursive" },
      { label: "Allura", value: "'Allura', cursive" },
      { label: "Alex Brush", value: "'Alex Brush', cursive" },
      { label: "Kaushan Script", value: "'Kaushan Script', cursive" },
      { label: "Petit Formal Script", value: "'Petit Formal Script', cursive" },
    ],
  },
  {
    group: "✦ Monospace",
    fonts: [
      { label: "JetBrains Mono", value: "'JetBrains Mono', monospace" },
      { label: "Space Mono", value: "'Space Mono', monospace" },
      { label: "Roboto Mono", value: "'Roboto Mono', monospace" },
      { label: "Source Code Pro", value: "'Source Code Pro', monospace" },
      { label: "Courier New (System)", value: "Courier New, monospace" },
    ],
  },
];

// Flat list for searching
const ALL_FONTS = FONT_GROUPS.flatMap((g) => g.fonts);

// Extract Google Font names (non-system fonts) for the @import URL
const GOOGLE_FONT_NAMES = [
  "Playfair+Display", "Cormorant+Garamond", "EB+Garamond", "Libre+Baskerville",
  "Lora", "Merriweather", "Crimson+Text", "Gentium+Book+Plus", "Source+Serif+4",
  "Bitter", "Gelasio", "Zilla+Slab",
  "Montserrat", "Raleway", "Nunito", "Poppins", "Inter", "Lato", "Open+Sans",
  "Roboto", "Oswald", "Work+Sans", "Josefin+Sans", "Cabin", "Exo+2",
  "Urbanist", "DM+Sans",
  "Cinzel", "Cinzel+Decorative", "Uncial+Antiqua", "Poiret+One", "Philosopher",
  "Spectral", "Abril+Fatface", "Alfa+Slab+One", "Playfair+Display+SC",
  "Yeseva+One", "Bebas+Neue", "Righteous", "Satisfy",
  "Great+Vibes", "Parisienne", "Tangerine", "Dancing+Script", "Pacifico",
  "Sacramento", "Pinyon+Script", "Clicker+Script", "Italianno", "Lobster",
  "Allura", "Alex+Brush", "Kaushan+Script", "Petit+Formal+Script",
  "JetBrains+Mono", "Space+Mono", "Roboto+Mono", "Source+Code+Pro",
];

// Inject Google Fonts link tag once
function injectGoogleFonts() {
  if (document.getElementById("gfonts-cert")) return;
  const link = document.createElement("link");
  link.id = "gfonts-cert";
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?${GOOGLE_FONT_NAMES.map(
    (f) => `family=${f}:ital,wght@0,400;0,700;1,400`
  ).join("&")}&display=swap`;
  document.head.appendChild(link);
}

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
          {value}{unit}
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
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

// Custom font picker dropdown
function FontPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const currentFont = ALL_FONTS.find((f) => f.value === value) || ALL_FONTS[0];

  const filtered = search.trim()
    ? ALL_FONTS.filter((f) =>
        f.label.toLowerCase().includes(search.toLowerCase())
      )
    : null;

  const handleSelect = (font) => {
    onChange(font.value);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className="relative" ref={ref}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="neo-input flex items-center justify-between gap-2 text-left cursor-pointer"
      >
        <span
          style={{ fontFamily: currentFont.value, fontSize: "15px" }}
          className="truncate flex-1"
        >
          {currentFont.label}
        </span>
        <svg
          className={`w-3 h-3 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 neo-card shadow-neo-lg max-h-80 flex flex-col">
          {/* Search */}
          <div className="p-2 border-b-2 border-ink">
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search fonts…"
              className="neo-input py-2 text-xs"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Font list */}
          <div className="overflow-y-auto flex-1">
            {filtered ? (
              // Search results (flat)
              filtered.length > 0 ? (
                filtered.map((font) => (
                  <FontOption
                    key={font.value}
                    font={font}
                    selected={value === font.value}
                    onSelect={handleSelect}
                  />
                ))
              ) : (
                <p className="text-center text-xs font-bold text-ink/40 py-6 uppercase tracking-widest">
                  No fonts found
                </p>
              )
            ) : (
              // Grouped list
              FONT_GROUPS.map((group) => (
                <div key={group.group}>
                  <div className="px-3 py-1.5 bg-ink text-surface text-[9px] font-black uppercase tracking-widest sticky top-0">
                    {group.group}
                  </div>
                  {group.fonts.map((font) => (
                    <FontOption
                      key={font.value}
                      font={font}
                      selected={value === font.value}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>
              ))
            )}
          </div>

          {/* Footer count */}
          <div className="border-t-2 border-ink px-3 py-1.5 text-[9px] font-bold text-ink/40 uppercase tracking-widest bg-surface">
            {ALL_FONTS.length} fonts available
          </div>
        </div>
      )}
    </div>
  );
}

function FontOption({ font, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(font)}
      className={`w-full text-left px-3 py-2.5 flex items-center gap-3 border-b border-ink/10
        hover:bg-primary/20 transition-colors
        ${selected ? "bg-primary border-l-3 border-l-ink" : ""}`}
    >
      <span
        style={{ fontFamily: font.value, fontSize: "17px", lineHeight: 1.2 }}
        className="flex-1 truncate"
      >
        {font.label}
      </span>
      {selected && (
        <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l6.879-6.879a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </button>
  );
}

export default function PlacementEditor({ placement, onChange }) {
  // Inject Google Fonts once on mount
  useEffect(() => {
    injectGoogleFonts();
  }, []);

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

      <div className="space-y-4">
        {/* Font Family — full width custom picker */}
        <div className="space-y-1.5">
          <label className="neo-label">Font Family</label>
          <FontPicker
            value={placement.fontFamily}
            onChange={(v) => onChange("fontFamily", v)}
          />
          <p className="text-[10px] font-bold text-ink/40 uppercase tracking-wider">
            Each font previewed in its actual style
          </p>
        </div>

        {/* Font Weight */}
        <div className="space-y-1.5">
          <label className="neo-label">Font Weight</label>
          <select
            value={placement.fontWeight}
            onChange={(e) => onChange("fontWeight", e.target.value)}
            className="neo-input text-xs"
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