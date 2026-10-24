"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex h-[calc(100vh-5rem)] items-center justify-center">
      <div className="w-full max-w-md border bg-card p-6 text-center">
        <div className="mx-auto flex size-12 items-center justify-center border bg-destructive/10 text-destructive">
          <AlertTriangle className="size-5" />
        </div>
        <h2 className="mt-4 text-lg font-semibold">Gagal Memuat Dokumen</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Terjadi kesalahan saat mengambil daftar dokumen. Silakan coba lagi.
        </p>
        <Button onClick={reset} variant="outline" className="mt-5">
          <RotateCcw className="size-4" />
          Coba Lagi
        </Button>
      </div>
    </div>
  );
}
