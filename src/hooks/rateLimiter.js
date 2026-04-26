// rateLimiter.js — client-side protection layer
// Prevents abuse: rapid repeated generation, oversized payloads, malicious inputs

const LIMITS = {
  MAX_NAMES: 2000,           // Hard cap on delegates
  MAX_TEMPLATE_MB: 20,       // Max template file size in MB
  MAX_EXCEL_MB: 10,          // Max Excel file size in MB
  MAX_NAME_LENGTH: 120,      // Max characters per name
  MIN_GENERATION_INTERVAL_MS: 3000, // Min ms between generation attempts
  MAX_GENERATIONS_PER_MINUTE: 5,    // Max generation starts per minute
};

// Rolling generation attempt tracker
const generationLog = [];

/**
 * Check if a new generation attempt is allowed.
 * Returns { allowed: boolean, reason?: string }
 */
export function checkGenerationRateLimit() {
  const now = Date.now();
  // Clean entries older than 1 minute
  const windowStart = now - 60_000;
  while (generationLog.length && generationLog[0] < windowStart) {
    generationLog.shift();
  }

  if (generationLog.length >= LIMITS.MAX_GENERATIONS_PER_MINUTE) {
    return {
      allowed: false,
      reason: `Too many generation attempts. Max ${LIMITS.MAX_GENERATIONS_PER_MINUTE} per minute. Please wait.`,
    };
  }

  const lastAttempt = generationLog[generationLog.length - 1];
  if (lastAttempt && now - lastAttempt < LIMITS.MIN_GENERATION_INTERVAL_MS) {
    const wait = Math.ceil((LIMITS.MIN_GENERATION_INTERVAL_MS - (now - lastAttempt)) / 1000);
    return {
      allowed: false,
      reason: `Please wait ${wait}s before generating again.`,
    };
  }

  return { allowed: true };
}

export function recordGenerationAttempt() {
  generationLog.push(Date.now());
}

/**
 * Validate template file
 */
export function validateTemplateFile(file) {
  const errors = [];
  if (!file) { errors.push("No template file selected."); return errors; }

  const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    errors.push(`Invalid file type: ${file.type}. Use PNG or JPG.`);
  }

  const sizeMB = file.size / 1_048_576;
  if (sizeMB > LIMITS.MAX_TEMPLATE_MB) {
    errors.push(`Template too large: ${sizeMB.toFixed(1)} MB. Max ${LIMITS.MAX_TEMPLATE_MB} MB.`);
  }

  return errors;
}

/**
 * Validate Excel file
 */
export function validateExcelFile(file) {
  const errors = [];
  if (!file) { errors.push("No Excel file selected."); return errors; }

  const allowedExts = [".xlsx", ".xls", ".csv"];
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  if (!allowedExts.includes(ext)) {
    errors.push(`Invalid file type: ${ext}. Use .xlsx, .xls, or .csv.`);
  }

  const sizeMB = file.size / 1_048_576;
  if (sizeMB > LIMITS.MAX_EXCEL_MB) {
    errors.push(`Excel file too large: ${sizeMB.toFixed(1)} MB. Max ${LIMITS.MAX_EXCEL_MB} MB.`);
  }

  return errors;
}

/**
 * Sanitize a single name string — strip dangerous content, normalize whitespace
 */
export function sanitizeName(raw) {
  return String(raw ?? "")
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, "") // strip control chars
    .replace(/\s+/g, " ")            // normalize whitespace
    .slice(0, LIMITS.MAX_NAME_LENGTH);
}

/**
 * Pre-validate all delegate names before generation.
 * Returns { valid: string[], errors: ValidationError[] }
 *
 * ValidationError: { rowIndex: number, name: string, issues: string[] }
 */
export function preValidateDelegates(rawNames, templateDimensions, placement) {
  const valid = [];
  const errors = [];

  if (rawNames.length === 0) {
    return { valid, errors: [{ rowIndex: -1, name: "", issues: ["No names found in file."] }] };
  }

  if (rawNames.length > LIMITS.MAX_NAMES) {
    return {
      valid: [],
      errors: [{
        rowIndex: -1,
        name: "",
        issues: [`Too many rows: ${rawNames.length}. Maximum allowed is ${LIMITS.MAX_NAMES}.`]
      }]
    };
  }

  // Estimate canvas text width to detect overflow
  // We use a temporary canvas for measurement
  let measureCtx = null;
  try {
    const mc = document.createElement("canvas");
    measureCtx = mc.getContext("2d");
    measureCtx.font = `${placement.fontWeight} ${placement.fontSize}px ${placement.fontFamily}`;
  } catch (_) { /* non-critical */ }

  // Max usable width = 85% of template width (leaving 7.5% margin each side)
  const maxWidthPx = templateDimensions.w > 0 ? templateDimensions.w * 0.85 : Infinity;

  for (let i = 0; i < rawNames.length; i++) {
    const rowNum = i + 2; // Excel row numbers start at 2 (row 1 = header)
    const sanitized = sanitizeName(rawNames[i]);
    const issues = [];

    if (!sanitized) {
      issues.push("Missing or empty name.");
    } else {
      if (sanitized.length > LIMITS.MAX_NAME_LENGTH) {
        issues.push(`Name too long (${sanitized.length} chars). Max ${LIMITS.MAX_NAME_LENGTH}.`);
      }

      // Text overflow check
      if (measureCtx && templateDimensions.w > 0) {
        const textWidth = measureCtx.measureText(sanitized).width;
        if (textWidth > maxWidthPx) {
          const overflowPct = Math.round(((textWidth - maxWidthPx) / maxWidthPx) * 100);
          issues.push(`Text overflow: "${sanitized}" is ~${overflowPct}% wider than the safe zone. Reduce font size or shorten the name.`);
        }
      }

      // Check for suspicious/injection-like content
      if (/[<>{}\\\/]/.test(sanitized)) {
        issues.push(`Name contains special characters that may cause issues: ${sanitized}`);
      }
    }

    if (issues.length > 0) {
      errors.push({ rowIndex: rowNum, name: sanitized, issues });
    } else {
      valid.push(sanitized);
    }
  }

  return { valid, errors };
}

export { LIMITS };