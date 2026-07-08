import { Activity } from "lucide-react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Activity className="size-5" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight">
            HYROX Performance OS
          </h1>
          <p className="text-sm text-muted-foreground">
            Entre para acessar sua preparação.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
