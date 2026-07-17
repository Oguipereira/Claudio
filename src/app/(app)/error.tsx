"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <AlertTriangle className="size-8 text-status-critical" />
      <div>
        <p className="text-sm font-medium">Algo deu errado ao carregar esta página.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Tente novamente. Se o problema persistir, verifique a conexão com o banco de dados.
        </p>
      </div>
      <Button onClick={reset}>Tentar novamente</Button>
    </div>
  );
}
