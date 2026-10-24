"use client";

import {
  Award,
  CalendarCheck,
  ClipboardList,
  Download,
  FileCheck,
  FileCog,
  FileText,
  FolderOpen,
  ScrollText,
  UserCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DocumentType } from "@/generated/prisma/enums";

import type {
  InternDocument,
  InternDocumentsData,
} from "../types/document-types";

type InternDocumentsPageProps = {
  data: InternDocumentsData | null;
};

const DOCUMENT_META = {
  certificate: {
    label: "Sertifikat",
    icon: Award,
    accent: "border-warning/30 bg-warning/10 text-warning",
  },
  assignment_letter: {
    label: "Surat Tugas",
    icon: ScrollText,
    accent: "border-info/30 bg-info/10 text-info",
  },
  assessment_report: {
    label: "Laporan Penilaian",
    icon: ClipboardList,
    accent: "border-primary/30 bg-primary/10 text-primary",
  },
  attendance_report: {
    label: "Rekap Absensi",
    icon: CalendarCheck,
    accent: "border-success/30 bg-success/10 text-success",
  },
  completion_letter: {
    label: "Surat Keterangan Selesai",
    icon: FileCheck,
    accent: "border-border bg-muted text-muted-foreground",
  },
} satisfies Record<
  DocumentType,
  { label: string; icon: typeof FileText; accent: string }
>;

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const EMPTY_STEPS = [
  {
    icon: UserCheck,
    title: "Data magang lengkap",
    description: "Pastikan profil dan periode magang Anda sudah terisi.",
  },
  {
    icon: FileCog,
    title: "HR generate dokumen",
    description: "Dokumen dibuat setelah data magang Anda lengkap.",
  },
  {
    icon: Download,
    title: "Dokumen siap diunduh",
    description: "Dokumen yang sudah tersedia muncul di halaman ini.",
  },
];

export default function InternDocumentsPage({
  data,
}: InternDocumentsPageProps) {
  const documents = data?.documents ?? [];

  return (
    <div className="h-[calc(100vh-5rem)] w-full max-w-full min-w-0 overflow-y-auto pr-2">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Dokumen Magang
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {data
                ? `Dokumen yang telah digenerate untuk ${data.internName}.`
                : "Dokumen hasil magang Anda akan tersedia di halaman ini."}
            </p>
          </div>
          {data ? (
            <Badge variant="outline" className="w-fit">
              <FileText className="size-3" />
              {documents.length} dokumen
            </Badge>
          ) : null}
        </div>

        {!data ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="flex size-20 items-center justify-center border-2 border-dashed bg-muted/20">
              <FolderOpen className="size-9 text-muted-foreground/60" />
            </div>
            <div className="mt-5 max-w-md space-y-2">
              <h2 className="text-xl font-semibold tracking-tight">
                Profil Intern Tidak Ditemukan
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Akun Anda belum terhubung dengan profil intern. Hubungi HR
                untuk melengkapi data magang Anda.
              </p>
            </div>
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex size-24 items-center justify-center border-2 border-dashed bg-muted/20">
              <FolderOpen className="size-11 text-muted-foreground/60" />
            </div>
            <div className="mt-5 max-w-md space-y-2">
              <h2 className="text-xl font-semibold tracking-tight">
                Belum Ada Dokumen
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Dokumen magang Anda belum digenerate. Setelah HR membuat
                dokumen, daftarnya akan otomatis muncul di sini dan siap
                diunduh.
              </p>
            </div>

            <div className="mt-7 w-full max-w-2xl border bg-card">
              <div className="grid divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                {EMPTY_STEPS.map((step, index) => {
                  const Icon = step.icon;

                  return (
                    <div
                      key={step.title}
                      className="flex flex-col items-center gap-3 px-5 py-5 text-center"
                    >
                      <div className="flex size-9 items-center justify-center border bg-muted/40">
                        <Icon className="size-4 text-muted-foreground" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium">
                          {index + 1}. {step.title}
                        </p>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {documents.map((document) => (
              <DocumentCard key={document.id} document={document} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DocumentCard({ document }: { document: InternDocument }) {
  const meta = DOCUMENT_META[document.documentType];
  const Icon = meta.icon;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="gap-4">
        <div className="flex items-start justify-between gap-3">
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center border",
              meta.accent,
            )}
          >
            <Icon className="size-5" />
          </div>
          <Badge variant="outline">{meta.label}</Badge>
        </div>
        <div className="space-y-1">
          <CardTitle className="line-clamp-2 text-sm">
            {document.title}
          </CardTitle>
          <CardDescription>{document.documentNumber}</CardDescription>
        </div>
      </CardHeader>
      <CardFooter className="mt-auto justify-between gap-3">
        <span className="text-xs text-muted-foreground">
          {dateFormatter.format(document.createdAt)}
        </span>
        <a
          href={`/api/documents/${document.id}/file?download=1`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
          aria-label={`Unduh ${document.title}`}
        >
          <Download className="size-3.5" />
          Unduh
        </a>
      </CardFooter>
    </Card>
  );
}
