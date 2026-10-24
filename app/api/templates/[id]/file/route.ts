import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import {
  buildContentDisposition,
  buildTemplateFilename,
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

  const template = await prisma.documentTemplate.findUnique({
    where: { id },
    select: {
      content: true,
      name: true,
      documentType: true,
      createdAt: true,
    },
  });

  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  await assertStorageHealthy();

  try {
    const { stream, contentType } = await getObjectStream(template.content);
    const extension =
      extensionFromKey(template.content) || extensionFromContentType(contentType);
    const filename = buildTemplateFilename(
      template.documentType,
      template.name,
      template.createdAt,
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
