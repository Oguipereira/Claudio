"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background text-center text-foreground">
        <div>
          <p className="text-sm font-medium">Algo deu errado.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Recarregue a página. Se o problema persistir, tente novamente mais tarde.
          </p>
        </div>
        <button
          onClick={reset}
          className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
        >
          Tentar novamente
        </button>
      </body>
    </html>
  );
}
