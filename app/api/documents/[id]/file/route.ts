import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { Role } from "@/generated/prisma/enums";
import {
  buildContentDisposition,
  buildDocumentFilename,
  extensionFromContentType,
  extensionFromKey,
} from "@/lib/document-filename";
import { getObjectStream } from "@/services/storage";
import { assertStorageHealthy, StorageError } from "@/services/storage-health";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const document = await prisma.document.findFirst({
    where: { id, deletedAt: null },
    select: {
      fileUrl: true,
      documentType: true,
      createdAt: true,
      internProfile: {
        select: {
          userId: true,
          user: { select: { name: true } },
        },
      },
    },
  });

  if (!document?.fileUrl) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const isPublicCertificate = document.documentType === "certificate";
  const isOwner = session?.user.id === document.internProfile.userId;
  const canManage =
    session?.user.role === Role.admin || session?.user.role === Role.hr;

  if (!isPublicCertificate && !isOwner && !canManage) {
    return NextResponse.json(
      { error: session ? "Forbidden" : "Unauthorized" },
      { status: session ? 403 : 401 },
    );
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
    const download = new URL(request.url).searchParams.get("download") === "1";

    return new Response(stream, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": buildContentDisposition(
          filename,
          download ? "attachment" : "inline",
        ),
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
