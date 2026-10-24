import { prisma } from "@/lib/prisma";
import type { InternDocumentsData } from "../types/document-types";

export async function fetchInternDocuments(
  userId: string,
): Promise<InternDocumentsData | null> {
  const profile = await prisma.internProfile.findUnique({
    where: { userId, deletedAt: null },
    select: {
      user: { select: { name: true } },
      documents: {
        where: {
          deletedAt: null,
          fileUrl: { not: null },
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          documentType: true,
          documentNumber: true,
          title: true,
          fileUrl: true,
          createdAt: true,
        },
      },
    },
  });

  if (!profile) return null;

  return {
    internName: profile.user.name,
    documents: profile.documents.flatMap((document) =>
      document.fileUrl ? [{ ...document, fileUrl: document.fileUrl }] : [],
    ),
  };
}
