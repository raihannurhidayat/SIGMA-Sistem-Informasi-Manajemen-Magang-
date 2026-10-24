const DOCUMENT_TYPE_SLUGS: Record<string, string> = {
  certificate: "SERTIFIKAT",
  assignment_letter: "SURAT_TUGAS",
  assessment_report: "LAPORAN_PENILAIAN",
  attendance_report: "REKAP_ABSENSI",
  completion_letter: "SURAT_KETERANGAN_SELESAI",
};

export function sanitizeFilenamePart(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function documentTypeSlug(documentType: string): string {
  return DOCUMENT_TYPE_SLUGS[documentType] ?? sanitizeFilenamePart(documentType);
}

export function formatWaktuGenerate(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    "_",
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join("");
}

export function normalizeExtension(extension: string): string {
  const value = extension.trim().toLowerCase();
  if (!value) return "";
  return value.startsWith(".") ? value : `.${value}`;
}

export function extensionFromKey(key: string): string {
  return key.match(/\.[a-z0-9]+$/i)?.[0].toLowerCase() ?? "";
}

export function extensionFromContentType(contentType: string): string {
  if (contentType.includes("pdf")) return ".pdf";
  if (contentType.includes("wordprocessingml")) return ".docx";
  if (contentType.includes("msword")) return ".doc";
  return "";
}

export function buildDocumentFilename(
  documentType: string,
  internName: string,
  createdAt: Date,
  extension: string,
): string {
  const name = sanitizeFilenamePart(internName) || "PESERTA";
  return `${documentTypeSlug(documentType)}_${name}_${formatWaktuGenerate(createdAt)}${normalizeExtension(extension)}`;
}

function templateDescriptor(documentType: string, templateName: string): string {
  const typeSlug = documentTypeSlug(documentType);
  const name = sanitizeFilenamePart(templateName);
  const prefix = new RegExp(`^(?:TEMPLATE_)?${typeSlug}(?:_|$)`);

  return name.replace(prefix, "").replace(/^_+|_+$/g, "");
}

export function buildTemplateFilename(
  documentType: string,
  templateName: string,
  createdAt: Date,
  extension: string,
): string {
  const parts = [
    "TEMPLATE",
    documentTypeSlug(documentType),
    templateDescriptor(documentType, templateName),
    formatWaktuGenerate(createdAt),
  ].filter(Boolean);

  return `${parts.join("_")}${normalizeExtension(extension)}`;
}

export function buildCertificateTestFilename(
  templateName: string,
  createdAt: Date,
): string {
  const parts = [
    "SERTIFIKAT",
    "TEST",
    templateDescriptor("certificate", templateName),
    formatWaktuGenerate(createdAt),
  ].filter(Boolean);

  return `${parts.join("_")}.pdf`;
}

export function buildContentDisposition(
  filename: string,
  disposition: "inline" | "attachment" = "inline",
): string {
  const fallback = filename.replace(/[^\x20-\x7E]/g, "_").replace(/["\\]/g, "_");
  return `${disposition}; filename="${fallback}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}
