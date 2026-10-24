import type { DocumentType } from "@/generated/prisma/enums";

export type InternDocument = {
  id: string;
  documentType: DocumentType;
  documentNumber: string;
  title: string;
  fileUrl: string;
  createdAt: Date;
};

export type InternDocumentsData = {
  internName: string;
  documents: InternDocument[];
};
