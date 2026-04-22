import { useRef, useState } from "react";

export default function DropZone({
  accept,
  onFile,
  label,
  hint,
  icon,
  file,
  disabled = false,
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const f = e.dataTransfer.files[0];
    if (f) {
      onFile(f);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`
        border-3 border-ink p-8 text-center cursor-pointer transition-all select-none
        ${dragging ? "bg-primary shadow-neo-lg -translate-x-1 -translate-y-1" : "bg-surface hover:bg-primary/10 shadow-neo"}
        ${disabled ? "opacity-40 cursor-not-allowed" : "hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neo-lg"}
        ${file ? "bg-success/10 border-success" : ""}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          if (e.target.files[0]) {
            onFile(e.target.files[0]);
            e.target.value = "";
          }
        }}
      />

      <div className="flex flex-col items-center gap-3">
        <div
          className={`w-12 h-12 border-3 border-ink flex items-center justify-center text-xl
          ${file ? "bg-success text-white" : "bg-primary"}`}
        >
          {file ? (
            <svg
              className="w-5 h-5"
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
            icon
          )}
        </div>

        <div>
          <p className="font-black text-sm uppercase tracking-widest">
            {file ? file.name : label}
          </p>
          {!file && (
            <p className="text-xs text-ink/50 mt-1 font-medium">{hint}</p>
          )}
          {file && (
            <p className="text-xs text-success font-bold mt-1 uppercase tracking-wider">
              ✓ Loaded — click to replace
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
