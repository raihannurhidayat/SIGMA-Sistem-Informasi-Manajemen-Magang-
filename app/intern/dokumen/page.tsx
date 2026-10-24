import type { Metadata } from "next";

import { requireAuth } from "@/helpers/guard";
import { Role } from "@/generated/prisma/enums";
import { fetchInternDocuments } from "@/features/intern/data/document-data";
import InternDocumentsPage from "@/features/intern/pages/documents-page";

export const metadata: Metadata = {
  title: "Dokumen",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const { user } = await requireAuth([Role.admin, Role.intern]);

  const data = await fetchInternDocuments(user.id);

  return <InternDocumentsPage data={data} />;
}
