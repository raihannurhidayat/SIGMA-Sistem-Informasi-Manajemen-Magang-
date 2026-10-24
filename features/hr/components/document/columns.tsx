"use client";

import { FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { ColumnDef } from "@tanstack/react-table";
import {
  type ActionOption,
  withActionColumn,
  withSelectColumn,
} from "@/components/shared/data-table/column-helpers";
import { DocumentType } from "@/generated/prisma/enums";

import { getMissingDocumentFields } from "../../utils/document-completeness";
import type { DocumentRow } from "../../types/document-types";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

type Completeness = {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  missingFields: string[];
};

function checkCompleteness(row: DocumentRow, tab: DocumentType): Completeness {
  const intern = row.internProfile;
  const supervisor = intern?.supervisorAssignments?.[0]?.supervisorProfile;
  const assessment = intern?.assessments?.[0];

  const missingFields = getMissingDocumentFields(
    {
      name: row.name,
      nik: intern?.nik ?? null,
      institution: intern?.institution ?? null,
      teamName: intern?.team?.name ?? null,
      periodStart: intern?.periodStart ?? null,
      periodEnd: intern?.periodEnd ?? null,
      hasSupervisor: Boolean(supervisor),
      supervisorName: supervisor?.user?.name ?? null,
      supervisorNip: supervisor?.nip ?? null,
      hasAssessment: Boolean(assessment),
      finalScore: assessment?.finalScore ?? null,
      finalGrade: assessment?.finalGrade ?? null,
    },
    tab,
  );

  if (missingFields.length > 0) {
    return { label: "Tidak Lengkap", variant: "destructive", missingFields };
  }

  return { label: "Lengkap", variant: "default", missingFields: [] };
}

export function createColumns(
  actions: {
    onViewDocs: (row: DocumentRow) => void;
  },
  activeTab: DocumentType,
) {
  const baseColumns: ColumnDef<DocumentRow>[] = [
    {
      id: "nameNik",
      header: "Nama",
      accessorFn: (row) => row.name,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          <span className="text-xs text-muted-foreground">
            {row.original.internProfile!.nik}
          </span>
        </div>
      ),
    },
    {
      id: "team",
      header: "Team",
      accessorFn: (row) => row.internProfile?.team?.name ?? null,
      cell: ({ row }) => (
        <span>
          {row.original.internProfile?.team?.name ?? (
            <span className="text-muted-foreground">-</span>
          )}
        </span>
      ),
    },
    {
      id: "period",
      header: "Periode",
      accessorFn: (row) => row.internProfile!.periodStart,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {formatDate(row.original.internProfile!.periodStart)} -{" "}
          {formatDate(row.original.internProfile!.periodEnd)}
        </span>
      ),
    },
    {
      id: "dataCompleteness",
      header: "Kelengkapan Data",
      cell: ({ row }) => {
        const { label, variant, missingFields } = checkCompleteness(
          row.original,
          activeTab,
        );

        return (
          <Badge
            variant={variant}
            title={
              missingFields.length > 0
                ? `Belum lengkap: ${missingFields.join(", ")}`
                : undefined
            }
          >
            {label}
          </Badge>
        );
      },
    },
  ];

  const actionOptions: ActionOption<DocumentRow>[] = [
    {
      label: "Lihat Dokumen",
      icon: <FileText className="size-4" />,
      onClick: (row) => actions.onViewDocs(row as DocumentRow),
    },
  ];

  return withSelectColumn(withActionColumn(baseColumns, actionOptions));
}
