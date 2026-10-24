import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import {
  buildContentDisposition,
  buildDocumentFilename,
  extensionFromContentType,
  extensionFromKey,
} from "@/lib/document-filename";
import { getObjectStream } from "@/services/storage";
import { assertStorageHealthy, StorageError } from "@/services/storage-health";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const document = await prisma.document.findFirst({
    where: {
      OR: [
        { id },
        { internProfile: { userId: id } },
      ],
    },
    select: {
      fileUrl: true,
      documentType: true,
      createdAt: true,
      internProfile: { select: { user: { select: { name: true } } } },
    },
  });

  if (!document?.fileUrl) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  await assertStorageHealthy();

  try {
    const { stream, contentType } = await getObjectStream(document.fileUrl);
    const extension =
      extensionFromKey(document.fileUrl) || extensionFromContentType(contentType);
    const filename = buildDocumentFilename(
      document.documentType,
      document.internProfile.user.name,
      document.createdAt,
      extension,
    );

    return new Response(stream, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": buildContentDisposition(filename),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (e) {
    if (e instanceof StorageError) {
      return NextResponse.json({ error: e.userMessage }, { status: 503 });
    }
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}