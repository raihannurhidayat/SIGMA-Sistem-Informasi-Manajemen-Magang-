import { DocumentType } from "@/generated/prisma/enums";

export type DocumentCompletenessInput = {
  name: string;
  nik: string | null;
  institution: string | null;
  teamName: string | null;
  periodStart: Date | null;
  periodEnd: Date | null;
  hasSupervisor: boolean;
  supervisorName: string | null;
  supervisorNip: string | null;
  hasAssessment: boolean;
  finalScore: number | null;
  finalGrade: string | null;
};

export function getMissingDocumentFields(
  data: DocumentCompletenessInput,
  documentType: DocumentType,
): string[] {
  const missing: string[] = [];

  if (!data.name) missing.push("Nama peserta");
  if (!data.nik) missing.push("NIK");
  if (!data.institution) missing.push("Institusi");
  if (!data.teamName) missing.push("Team");
  if (!data.periodStart) missing.push("Tanggal mulai");
  if (!data.periodEnd) missing.push("Tanggal selesai");

  if (
    documentType === DocumentType.certificate ||
    documentType === DocumentType.assignment_letter ||
    documentType === DocumentType.completion_letter ||
    documentType === DocumentType.assessment_report
  ) {
    if (!data.hasSupervisor) {
      missing.push("Pembimbing lapangan belum ditetapkan");
    } else {
      if (!data.supervisorName) missing.push("Nama pembimbing");
      if (!data.supervisorNip) missing.push("NIP pembimbing");
    }
  }

  if (documentType === DocumentType.assessment_report) {
    if (!data.hasAssessment) {
      missing.push(
        "Data penilaian (nilai akhir, nilai huruf) belum diisi oleh pembimbing",
      );
    } else {
      if (data.finalScore == null) missing.push("Skor akhir penilaian");
      if (!data.finalGrade) missing.push("Nilai huruf akhir");
    }
  }

  return missing;
}
