import { useState, useCallback } from "react";
import ExcelJS from "exceljs";
import JSZip from "jszip";
import toast from "react-hot-toast";

// ─── Canvas rendering ─────────────────────────────────────────────────────────
export const renderCertificate = (templateUrl, name, placement) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

      ctx.drawImage(img, 0, 0);

      const xPx = (placement.x / 100) * img.width;
      const yPx = (placement.y / 100) * img.height;

      ctx.save();
      ctx.fillStyle = placement.color;
      ctx.font = `${placement.fontWeight} ${placement.fontSize}px ${placement.fontFamily}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Optional: letter spacing via individual character drawing
      ctx.fillText(name, xPx, yPx);
      ctx.restore();

      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas export failed"));
      }, "image/png");
    };

    img.onerror = () =>
      reject(new Error("Failed to load template image. Check CORS settings."));
    img.src = templateUrl;
  });
};

// ─── Safe filename ────────────────────────────────────────────────────────────
const safeFilename = (name) =>
  name
    .trim()
    .replace(/[^a-z0-9_\-\s]/gi, "")
    .replace(/\s+/g, "_")
    .slice(0, 60);

// ─── Parse Excel / CSV ────────────────────────────────────────────────────────
export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(e.target.result);
        const worksheet = workbook.worksheets[0];

        if (!worksheet) {
          reject(new Error("No worksheet found in the file."));
          return;
        }

        const rows = [];
        worksheet.eachRow({ includeEmpty: false }, (row) => {
          rows.push(row.values.slice(1)); // slice(1) because exceljs includes index 0
        });

        if (rows.length < 2) {
          reject(
            new Error(
              "Excel file must have at least a header row and one data row.",
            ),
          );
          return;
        }

        // Auto-detect the name column: look for header containing "name" (case-insensitive)
        const headers = rows[0].map((h) =>
          String(h ?? "")
            .toLowerCase()
            .trim(),
        );
        let nameColIndex = headers.findIndex((h) => h.includes("name"));
        if (nameColIndex === -1) nameColIndex = 0; // fallback: use first column

        const names = rows
          .slice(1)
          .map((row) => String(row[nameColIndex] ?? "").trim())
          .filter((n) => n.length > 0);

        resolve({
          names,
          headers: rows[0].map((h) => String(h ?? "")),
          nameColIndex,
          totalRows: rows.length - 1,
        });
      } catch (err) {
        reject(new Error("Failed to parse file: " + err.message));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
};

// ─── Main hook ────────────────────────────────────────────────────────────────
export default function useCertGenerator() {
  // Template state
  const [templateFile, setTemplateFile] = useState(null);
  const [templateUrl, setTemplateUrl] = useState(null);
  const [templateDimensions, setTemplateDimensions] = useState({ w: 0, h: 0 });

  // Excel state
  const [excelFile, setExcelFile] = useState(null);
  const [delegates, setDelegates] = useState([]);
  const [excelMeta, setExcelMeta] = useState(null);

  // Placement config
  const [placement, setPlacement] = useState({
    x: 50,
    y: 47,
    fontSize: 120,
    fontWeight: "bold",
    color: "#ffffff",
    fontFamily: "Georgia, serif",
  });

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, name: "" });
  const [done, setDone] = useState(false);
  const [previewCanvas, setPreviewCanvas] = useState(null);
  const [previewName, setPreviewName] = useState("Preview Name");

  // ── Load template image ───────────────────────────────────────────────────
  const loadTemplate = useCallback((file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setTemplateFile(file);
    setTemplateUrl(url);
    setDone(false);

    const img = new Image();
    img.onload = () => {
      setTemplateDimensions({ w: img.width, h: img.height });
    };
    img.src = url;
  }, []);

  // ── Load Excel ────────────────────────────────────────────────────────────
  const loadExcel = useCallback(async (file) => {
    try {
      const result = await parseExcelFile(file);
      setExcelFile(file);
      setDelegates(result.names);
      setExcelMeta(result);
      setDone(false);
      toast.success(
        `${result.names.length} names loaded from "${result.headers[result.nameColIndex]}" column`,
      );
    } catch (err) {
      toast.error(err.message);
    }
  }, []);

  // ── Update preview ────────────────────────────────────────────────────────
  const updatePreview = useCallback(
    async (name, pl) => {
      if (!templateUrl) return;
      const activePlacement = pl || placement;
      const activeName = name !== undefined ? name : previewName;
      try {
        const blob = await renderCertificate(
          templateUrl,
          activeName,
          activePlacement,
        );
        const url = URL.createObjectURL(blob);
        setPreviewCanvas((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
      } catch {
        // silently fail preview
      }
    },
    [templateUrl, placement, previewName],
  );

  // ── Update placement and refresh preview ─────────────────────────────────
  const updatePlacement = useCallback((key, value) => {
    setPlacement((prev) => {
      const next = { ...prev, [key]: value };
      // Debounced preview update happens in component via useEffect
      return next;
    });
  }, []);

  // ── Generate all certificates and trigger ZIP download ────────────────────
  const generateAll = useCallback(async () => {
    if (!templateUrl || delegates.length === 0) return;

    setGenerating(true);
    setDone(false);
    setProgress({ current: 0, total: delegates.length, name: "" });

    try {
      const zip = new JSZip();
      const folder = zip.folder("certificates");

      for (let i = 0; i < delegates.length; i++) {
        const name = delegates[i];
        setProgress({ current: i + 1, total: delegates.length, name });

        const blob = await renderCertificate(templateUrl, name, placement);
        folder.file(
          `${String(i + 1).padStart(3, "0")}_${safeFilename(name)}.png`,
          blob,
        );
      }

      const zipBlob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
      });

      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificates_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDone(true);
      toast.success(`${delegates.length} certificates downloaded!`);
    } catch (err) {
      toast.error("Generation failed: " + err.message);
    } finally {
      setGenerating(false);
      setProgress({ current: 0, total: 0, name: "" });
    }
  }, [templateUrl, delegates, placement]);

  // ── Reset ─────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    if (templateUrl) URL.revokeObjectURL(templateUrl);
    if (previewCanvas) URL.revokeObjectURL(previewCanvas);
    setTemplateFile(null);
    setTemplateUrl(null);
    setExcelFile(null);
    setDelegates([]);
    setExcelMeta(null);
    setPreviewCanvas(null);
    setDone(false);
    setProgress({ current: 0, total: 0, name: "" });
  }, [templateUrl, previewCanvas]);

  return {
    // template
    templateFile,
    templateUrl,
    templateDimensions,
    loadTemplate,
    // excel
    excelFile,
    delegates,
    excelMeta,
    loadExcel,
    // placement
    placement,
    updatePlacement,
    // preview
    previewCanvas,
    previewName,
    setPreviewName,
    updatePreview,
    // generation
    generating,
    progress,
    done,
    generateAll,
    // reset
    reset,
  };
}
