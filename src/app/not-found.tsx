import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 text-center">
      <div>
        <p className="text-sm font-medium">Página não encontrada.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          O endereço acessado não existe.
        </p>
      </div>
      <Button render={<Link href="/" />}>Voltar ao painel</Button>
    </div>
  );
}
