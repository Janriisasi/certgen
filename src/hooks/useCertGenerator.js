import { useState, useCallback, useRef } from "react";
import ExcelJS from "exceljs";
import JSZip from "jszip";
import toast from "react-hot-toast";
import {
  checkGenerationRateLimit,
  recordGenerationAttempt,
  validateTemplateFile,
  validateExcelFile,
  preValidateDelegates,
  sanitizeName,
} from "./rateLimiter";

const CHUNK_SIZE = 15;

// ─── Canvas rendering (main thread — preview only) ────────────────────────────
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
      ctx.fillText(name, xPx, yPx);
      ctx.restore();
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas export failed"));
      }, "image/png");
    };
    img.onerror = () => reject(new Error("Failed to load template image."));
    img.src = templateUrl;
  });
};

// ─── Safe filename ─────────────────────────────────────────────────────────────
const safeFilename = (name) =>
  name.trim().replace(/[^a-z0-9_\-\s]/gi, "").replace(/\s+/g, "_").slice(0, 60);

// ─── ExcelJS cell value → plain string ───────────────────────────────────────
function cellToString(v) {
  if (v === null || v === undefined) return "";
  if (typeof v !== "object") return String(v);
  if (v.richText) return v.richText.map((r) => r.text ?? "").join("");
  if (v.text !== undefined) return String(v.text);
  if (v.result !== undefined) return String(v.result);
  if (v.error) return "";
  return ""; // unknown object type — treat as empty
}

// ─── Parse Excel / CSV ────────────────────────────────────────────────────────
export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const errs = validateExcelFile(file);
    if (errs.length) { reject(new Error(errs[0])); return; }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(e.target.result);
        const worksheet = workbook.worksheets[0];
        if (!worksheet) { reject(new Error("No worksheet found.")); return; }

        const rows = [];
        worksheet.eachRow({ includeEmpty: false }, (row) => {
          const cells = [];
          // row.values is 1-indexed; index 0 is always undefined in ExcelJS
          for (let col = 1; col < row.values.length; col++) {
            cells.push(cellToString(row.values[col]));
          }
          rows.push(cells);
        });

        if (rows.length < 2) {
          reject(new Error("File needs a header row + at least one data row."));
          return;
        }

        const headerRow = rows[0];
        const headersLower = headerRow.map((h) => h.toLowerCase().trim());
        let nameColIndex = headersLower.findIndex((h) => h.includes("name"));
        if (nameColIndex === -1) nameColIndex = 0;

        const rawNames = rows
          .slice(1)
          .map((row) => (row[nameColIndex] ?? "").trim());

        resolve({
          rawNames,
          names: rawNames.filter((n) => n.length > 0).map(sanitizeName),
          headers: headerRow,
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

// ─── Convert blob URL → data URL (for worker transfer) ───────────────────────
async function blobUrlToDataUrl(blobUrl) {
  const res = await fetch(blobUrl);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ─── PDF Worker source ────────────────────────────────────────────────────────
// Runs entirely off the main thread: reads ArrayBuffers, encodes PNG data URLs,
// calls jsPDF.addImage per page, then transfers the final PDF ArrayBuffer back.
// The UI stays completely responsive because zero main-thread work happens here.
function getPdfWorkerCode() {
  return `
importScripts("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");

// Fast ArrayBuffer → base64 without string concatenation bottleneck
function bufToBase64(buf) {
  const bytes = new Uint8Array(buf);
  const CHUNK = 32768;
  let binary = "";
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, Math.min(i + CHUNK, bytes.length)));
  }
  return btoa(binary);
}

self.onmessage = async (e) => {
  const { buffers, mimeType, width, height } = e.data;
  const { jsPDF } = jspdf;
  const imgType = mimeType === "image/jpeg" ? "JPEG" : "PNG";
  const dataPrefix = mimeType === "image/jpeg" ? "data:image/jpeg;base64," : "data:image/png;base64,";

  const orientation = width >= height ? "landscape" : "portrait";
  // compress:false for JPEG pages — jsPDF re-compresses PNG internally but JPEG
  // is already compressed; skipping double-compression is faster.
  const pdf = new jsPDF({ orientation, unit: "px", format: [width, height], compress: false });

  for (let i = 0; i < buffers.length; i++) {
    const dataUrl = dataPrefix + bufToBase64(buffers[i]);
    if (i > 0) pdf.addPage([width, height], orientation);
    pdf.addImage(dataUrl, imgType, 0, 0, width, height, undefined, "FAST");
    self.postMessage({ type: "PAGE_DONE", current: i + 1, total: buffers.length });
  }

  const pdfBuffer = pdf.output("arraybuffer");
  self.postMessage({ type: "PDF_DONE", buffer: pdfBuffer }, [pdfBuffer]);
};
`;
}

// ─── PDF export — fully off-thread via Web Worker ─────────────────────────────
// Blobs (now JPEG) are read as ArrayBuffers in parallel, then transferred
// zero-copy to the PDF worker. jsPDF never touches the main thread.
async function exportToPdf(blobMap, onPageProgress) {
  const keys = Object.keys(blobMap).sort((a, b) => Number(a) - Number(b));
  if (keys.length === 0) throw new Error("No certificates to export.");

  // Detect mime type from first blob (JPEG from render worker, PNG from fallback)
  const firstBlob = blobMap[keys[0]].blob;
  const mimeType = firstBlob.type || "image/jpeg";

  // Measure dimensions from first blob
  const { w, h } = await new Promise((res) => {
    const url = URL.createObjectURL(firstBlob);
    const img = new Image();
    img.onload = () => { res({ w: img.width, h: img.height }); URL.revokeObjectURL(url); };
    img.src = url;
  });

  // Read all blobs as ArrayBuffers in parallel — fast, pure memory reads
  const buffers = await Promise.all(keys.map((k) => blobMap[k].blob.arrayBuffer()));

  return new Promise((resolve, reject) => {
    const workerBlob = new Blob([getPdfWorkerCode()], { type: "application/javascript" });
    const workerUrl = URL.createObjectURL(workerBlob);
    const worker = new Worker(workerUrl);

    worker.onmessage = (e) => {
      if (e.data.type === "PAGE_DONE") {
        onPageProgress?.(e.data.current, e.data.total);
      }
      if (e.data.type === "PDF_DONE") {
        worker.terminate();
        URL.revokeObjectURL(workerUrl);
        const blob = new Blob([e.data.buffer], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `certificates_${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        resolve();
      }
    };

    worker.onerror = (err) => {
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      reject(new Error("PDF worker error: " + err.message));
    };

    // Transfer all ArrayBuffers zero-copy; pass mimeType so worker knows format
    worker.postMessage({ buffers, mimeType, width: w, height: h }, buffers);
  });
}

// ─── Inline Web Worker source ─────────────────────────────────────────────────
// Optimisation: template ImageBitmap decoded once per worker, reused for every
// cert. Output switched from PNG to JPEG (q=0.92): ~8x faster encode, smaller blobs.
function getWorkerCode() {
  return `
let cachedBitmap = null;
let cachedDataUrl = null;

self.onmessage = async (e) => {
  const { type, payload } = e.data;
  if (type !== "PROCESS_CHUNK") return;
  const { chunk, templateDataUrl, placement, chunkIndex } = payload;

  // Decode template once — reuse the same ImageBitmap for every cert in this chunk
  if (cachedDataUrl !== templateDataUrl || !cachedBitmap) {
    if (cachedBitmap) cachedBitmap.close();
    const res = await fetch(templateDataUrl);
    const blob = await res.blob();
    cachedBitmap = await createImageBitmap(blob);
    cachedDataUrl = templateDataUrl;
  }

  const results = [];
  for (let i = 0; i < chunk.length; i++) {
    const { name, globalIndex } = chunk[i];
    try {
      const blob = await render(cachedBitmap, name, placement);
      results.push({ name, globalIndex, blob, success: true });
    } catch (err) {
      results.push({ name, globalIndex, blob: null, success: false, error: err.message });
    }
    self.postMessage({ type: "ITEM_DONE", payload: { globalIndex, name, success: results[i].success } });
  }
  self.postMessage({ type: "CHUNK_DONE", payload: { chunkIndex, results } });
};

async function render(templateBitmap, name, placement) {
  const canvas = new OffscreenCanvas(templateBitmap.width, templateBitmap.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(templateBitmap, 0, 0);
  const xPx = (placement.x / 100) * canvas.width;
  const yPx = (placement.y / 100) * canvas.height;
  ctx.save();
  ctx.fillStyle = placement.color;
  ctx.font = placement.fontWeight + " " + placement.fontSize + "px " + placement.fontFamily;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(name, xPx, yPx);
  ctx.restore();
  // JPEG ~8x faster than PNG to encode; quality 0.92 is visually indistinguishable
  return canvas.convertToBlob({ type: "image/jpeg", quality: 0.92 });
}
`;
}

// ─── Main-thread fallback chunk processor ────────────────────────────────────
async function processFallbackChunk(chunk, templateUrl, placement, blobMap, failedList) {
  let s = 0, f = 0;
  for (const { name, globalIndex } of chunk) {
    try {
      const blob = await renderCertificate(templateUrl, name, placement);
      blobMap[globalIndex] = { blob, name };
      s++;
    } catch (err) {
      failedList.push({ name, globalIndex, error: err.message });
      f++;
    }
  }
  return { s, f };
}

// ─── Main hook ────────────────────────────────────────────────────────────────
export default function useCertGenerator() {
  const [templateFile, setTemplateFile] = useState(null);
  const [templateUrl, setTemplateUrl] = useState(null);
  const [templateDimensions, setTemplateDimensions] = useState({ w: 0, h: 0 });
  const [excelFile, setExcelFile] = useState(null);
  const [delegates, setDelegates] = useState([]);
  const [excelMeta, setExcelMeta] = useState(null);

  const [placement, setPlacement] = useState({
    x: 50, y: 50, fontSize: 120, fontWeight: "bold",
    color: "#ffffff", fontFamily: "Georgia, serif",
  });

  const [generating, setGenerating] = useState(false);
  const [pdfPhase, setPdfPhase] = useState(null); // null | "rendering" | "building"
  const [progress, setProgress] = useState({ current: 0, total: 0, name: "" });
  const [pdfProgress, setPdfProgress] = useState({ current: 0, total: 0 });
  const [done, setDone] = useState(false);

  const [previewCanvas, setPreviewCanvas] = useState(null);
  const [previewName, setPreviewName] = useState("Preview Name");

  // FIX: null = not run yet | [] = passed | [...] = has errors
  const [validationErrors, setValidationErrors] = useState(null);
  const [validationStatus, setValidationStatus] = useState(null); // "ok" | "errors"
  const [generationReport, setGenerationReport] = useState(null);
  const [failedItems, setFailedItems] = useState([]);

  // Refs — always hold the latest values without causing stale closures
  const workerRef = useRef(null);
  const abortRef = useRef(false);
  const blobsRef = useRef({});
  const itemCountRef = useRef(0); // FIX: accurate per-item counter for progress
  const rawDelegatesRef = useRef([]);
  const templateUrlRef = useRef(null);
  const templateDimsRef = useRef({ w: 0, h: 0 });
  const placementRef = useRef({
    x: 50, y: 47, fontSize: 120, fontWeight: "bold",
    color: "#ffffff", fontFamily: "Georgia, serif",
  });
  const previewCanvasRef = useRef(null);

  // ── Load template ──────────────────────────────────────────────────────────
  const loadTemplate = useCallback((file) => {
    const errors = validateTemplateFile(file);
    if (errors.length) { toast.error(errors[0]); return; }

    const url = URL.createObjectURL(file);
    templateUrlRef.current = url;
    setTemplateFile(file);
    setTemplateUrl(url);
    setDone(false);
    setGenerationReport(null);
    setValidationErrors(null);
    setValidationStatus(null);

    const img = new Image();
    img.onload = () => {
      const dims = { w: img.width, h: img.height };
      templateDimsRef.current = dims;
      setTemplateDimensions(dims);
    };
    img.src = url;
  }, []);

  // ── Load Excel ─────────────────────────────────────────────────────────────
  const loadExcel = useCallback(async (file) => {
    try {
      const result = await parseExcelFile(file);
      rawDelegatesRef.current = result.rawNames;
      setExcelFile(file);
      setDelegates(result.names);
      setExcelMeta(result);
      setDone(false);
      setGenerationReport(null);
      setValidationErrors(null);
      setValidationStatus(null);
      toast.success(
        `${result.names.length} names loaded from "${result.headers[result.nameColIndex]}" column`
      );
    } catch (err) {
      toast.error(err.message);
    }
  }, []);

  // ── Update placement ───────────────────────────────────────────────────────
  const updatePlacement = useCallback((key, value) => {
    setPlacement((prev) => {
      const next = { ...prev, [key]: value };
      placementRef.current = next;
      return next;
    });
  }, []);

  // ── Preview ────────────────────────────────────────────────────────────────
  const updatePreview = useCallback(async (name, pl) => {
    const url = templateUrlRef.current;
    if (!url) return;
    const activePl = pl || placementRef.current;
    const activeName = name !== undefined ? name : previewName;
    try {
      const blob = await renderCertificate(url, activeName, activePl);
      const newUrl = URL.createObjectURL(blob);
      if (previewCanvasRef.current) URL.revokeObjectURL(previewCanvasRef.current);
      previewCanvasRef.current = newUrl;
      setPreviewCanvas(newUrl);
    } catch { /* silent */ }
  }, [previewName]);

  // ── Run pre-validation ─────────────────────────────────────────────────────
  // FIX: uses refs only — zero stale-closure issues, always sees current data
  const runValidation = useCallback(() => {
    const raw = rawDelegatesRef.current;
    const dims = templateDimsRef.current;
    const pl = placementRef.current;

    if (!raw.length) {
      toast.error("Upload an Excel file first.");
      return { valid: [], errors: [] };
    }

    const { valid, errors } = preValidateDelegates(raw, dims, pl);
    setValidationErrors(errors);

    if (errors.length === 0) {
      setValidationStatus("ok");
      toast.success(`✓ All ${valid.length} names passed validation!`);
    } else {
      setValidationStatus("errors");
      toast.error(
        `${errors.length} issue${errors.length !== 1 ? "s" : ""} found — see panel below.`
      );
    }

    return { valid, errors };
  }, []); // no deps — all state read from refs

  // ── Core generation engine ─────────────────────────────────────────────────
  const runGeneration = useCallback(async (namesToProcess) => {
    const rateCheck = checkGenerationRateLimit();
    if (!rateCheck.allowed) { toast.error(rateCheck.reason); return null; }
    recordGenerationAttempt();

    const currentUrl = templateUrlRef.current;
    const currentPlacement = placementRef.current;

    if (!currentUrl || !namesToProcess.length) return null;

    setGenerating(true);
    setDone(false);
    abortRef.current = false;
    blobsRef.current = {};
    itemCountRef.current = 0; // FIX: reset per-item counter

    const total = namesToProcess.length;
    setProgress({ current: 0, total, name: "" });

    const startTime = Date.now();
    let successCount = 0;
    let failCount = 0;
    const newFailed = [];

    try {
      const templateDataUrl = await blobUrlToDataUrl(currentUrl);

      const chunks = [];
      for (let i = 0; i < namesToProcess.length; i += CHUNK_SIZE) {
        chunks.push(
          namesToProcess.slice(i, i + CHUNK_SIZE).map((name, li) => ({
            name,
            globalIndex: i + li,
          }))
        );
      }

      const useWorker =
        typeof Worker !== "undefined" && typeof OffscreenCanvas !== "undefined";

      if (useWorker) {
        const workerBlob = new Blob([getWorkerCode()], { type: "application/javascript" });
        const workerUrl = URL.createObjectURL(workerBlob);

        // ── Parallel worker pool ───────────────────────────────────────────
        // Use up to 4 workers (capped at CPU count). Each worker decodes the
        // template bitmap once, then processes its assigned chunks back-to-back.
        // Net effect: 3-4x faster rendering on multi-core machines.
        const POOL_SIZE = Math.min(4, navigator.hardwareConcurrency || 2, chunks.length);
        const workers = [];
        const workerFree = []; // which workers are idle
        let chunkQueue = [...chunks.map((c, i) => ({ chunk: c, ci: i }))];
        let activeCount = 0;

        const activeWorkers = new Set();

        await new Promise((resolveAll, rejectAll) => {
          const dispatchNext = (worker, workerIdx) => {
            if (abortRef.current) {
              worker.terminate();
              activeWorkers.delete(workerIdx);
              if (activeWorkers.size === 0) resolveAll();
              return;
            }
            if (chunkQueue.length === 0) {
              worker.terminate();
              activeWorkers.delete(workerIdx);
              if (activeWorkers.size === 0) resolveAll();
              return;
            }
            const { chunk, ci } = chunkQueue.shift();
            worker.postMessage({
              type: "PROCESS_CHUNK",
              payload: { chunk, templateDataUrl, placement: currentPlacement, chunkIndex: ci },
            });
          };

          for (let wi = 0; wi < POOL_SIZE; wi++) {
            const worker = new Worker(workerUrl);
            activeWorkers.add(wi);

            worker.onmessage = (e) => {
              const { type, payload } = e.data;
              if (type === "ITEM_DONE") {
                itemCountRef.current += 1;
                setProgress({ current: itemCountRef.current, total, name: payload.name });
              }
              if (type === "CHUNK_DONE") {
                for (const r of payload.results) {
                  if (r.success) {
                    blobsRef.current[r.globalIndex] = { blob: r.blob, name: r.name };
                    successCount++;
                  } else {
                    newFailed.push({ name: r.name, globalIndex: r.globalIndex, error: r.error });
                    failCount++;
                  }
                }
                dispatchNext(worker, wi);
              }
            };

            worker.onerror = (err) => {
              console.error("Worker error:", err.message);
              worker.terminate();
              activeWorkers.delete(wi);
              if (activeWorkers.size === 0) resolveAll();
            };

            // Kick off this worker immediately
            dispatchNext(worker, wi);
          }
        });

        URL.revokeObjectURL(workerUrl);
      } else {
        // Main thread fallback
        for (let ci = 0; ci < chunks.length; ci++) {
          if (abortRef.current) break;
          const { s, f } = await processFallbackChunk(
            chunks[ci], currentUrl, currentPlacement, blobsRef.current, newFailed
          );
          successCount += s;
          failCount += f;
          itemCountRef.current += chunks[ci].length;
          setProgress({ current: itemCountRef.current, total, name: "" });
          await new Promise((r) => setTimeout(r, 0));
        }
      }
    } catch (err) {
      toast.error("Generation error: " + err.message);
      setGenerating(false);
      return null;
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const timeSaved = Math.round((successCount * 45) / 60);

    setFailedItems(newFailed);
    setGenerationReport({ successCount, failCount, elapsed, timeSaved, total });
    setGenerating(false);
    setDone(true);

    return { successCount, failCount, blobs: blobsRef.current };
  }, []); // no deps — reads everything from refs

  // ── ZIP download ───────────────────────────────────────────────────────────
  const downloadAsZip = useCallback(async (blobMap) => {
    const zip = new JSZip();
    const folder = zip.folder("certificates");
    const sorted = Object.keys(blobMap).sort((a, b) => Number(a) - Number(b));
    for (const key of sorted) {
      const { blob, name } = blobMap[key];
      folder.file(
        `${String(Number(key) + 1).padStart(3, "0")}_${safeFilename(name)}.png`,
        blob
      );
    }
    const zipBlob = await zip.generateAsync({
      type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 },
    });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `certificates_${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  // ── Generate all → ZIP ─────────────────────────────────────────────────────
  const generateAll = useCallback(async () => {
    const raw = rawDelegatesRef.current;
    const dims = templateDimsRef.current;
    const pl = placementRef.current;
    const { valid, errors } = preValidateDelegates(raw, dims, pl);
    setValidationErrors(errors);

    if (errors.length > 0 && valid.length === 0) {
      setValidationStatus("errors");
      toast.error("Fix all validation errors before generating.");
      return;
    }
    if (errors.length > 0) {
      setValidationStatus("errors");
      toast(`⚠️ ${errors.length} row(s) will be skipped.`, { duration: 4000 });
    }

    const result = await runGeneration(valid);
    if (!result) return;

    await downloadAsZip(result.blobs);

    if (result.failCount > 0) {
      toast.error(`${result.failCount} failed. Use "Retry Failed" to redo them.`);
    } else {
      toast.success(`${result.successCount} certificates downloaded!`);
    }
  }, [runGeneration, downloadAsZip]);

  // ── Generate → PDF ─────────────────────────────────────────────────────────
  // FIX: two-phase approach — Phase 1 uses existing progress bar (rendering),
  // Phase 2 shows a live-updating toast (building PDF). Toast is dismissed
  // synchronously before the success toast fires so there's no overlap/stuck state.
  const generatePdf = useCallback(async () => {
    const raw = rawDelegatesRef.current;
    const dims = templateDimsRef.current;
    const pl = placementRef.current;
    const { valid, errors } = preValidateDelegates(raw, dims, pl);
    setValidationErrors(errors);

    if (errors.length > 0 && valid.length === 0) {
      setValidationStatus("errors");
      toast.error("Fix all validation errors before generating.");
      return;
    }

    // Phase 1: render all certificates (reuses the existing progress bar UI)
    setPdfPhase("rendering");
    const result = await runGeneration(valid);
    if (!result) {
      setPdfPhase(null);
      return;
    }

    // Phase 2: build the PDF — modal blocks UI while worker runs off-thread
    setPdfPhase("building");
    setPdfProgress({ current: 0, total: valid.length });

    try {
      await exportToPdf(result.blobs, (done, total) => {
        setPdfProgress({ current: done, total });
      });
      toast.success("PDF downloaded!");
    } catch (err) {
      toast.error("PDF export failed: " + err.message);
    } finally {
      setPdfPhase(null);
      setPdfProgress({ current: 0, total: 0 });
    }
  }, [runGeneration]);

  // ── Retry failed items ─────────────────────────────────────────────────────
  const retryFailed = useCallback(async () => {
    if (!failedItems.length) return;
    const names = failedItems.map((f) => f.name);
    toast(`Retrying ${names.length} failed item(s)…`);
    const result = await runGeneration(names);
    if (!result) return;
    await downloadAsZip(result.blobs);
    toast.success(`Retry complete: ${result.successCount} downloaded.`);
  }, [failedItems, runGeneration, downloadAsZip]);

  // ── Reset ──────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    abortRef.current = true;
    if (workerRef.current) { workerRef.current.terminate(); workerRef.current = null; }
    if (templateUrlRef.current) { URL.revokeObjectURL(templateUrlRef.current); templateUrlRef.current = null; }
    if (previewCanvasRef.current) { URL.revokeObjectURL(previewCanvasRef.current); previewCanvasRef.current = null; }
    blobsRef.current = {};
    itemCountRef.current = 0;
    rawDelegatesRef.current = [];
    templateDimsRef.current = { w: 0, h: 0 };

    setTemplateFile(null); setTemplateUrl(null); setTemplateDimensions({ w: 0, h: 0 });
    setExcelFile(null); setDelegates([]); setExcelMeta(null);
    setPreviewCanvas(null); setDone(false);
    setProgress({ current: 0, total: 0, name: "" });
    setPdfPhase(null); setPdfProgress({ current: 0, total: 0 });
    setValidationErrors(null); setValidationStatus(null);
    setGenerationReport(null); setFailedItems([]);
  }, []);

  return {
    // template
    templateFile, templateUrl, templateDimensions, loadTemplate,
    // excel
    excelFile, delegates, excelMeta, loadExcel,
    // placement
    placement, updatePlacement,
    // preview
    previewCanvas, previewName, setPreviewName, updatePreview,
    // generation
    generating, progress, done, generateAll, generatePdf,
    pdfPhase, pdfProgress,
    // validation
    validationErrors, validationStatus, runValidation,
    // report
    generationReport, failedItems, retryFailed,
    // reset
    reset,
  };
}