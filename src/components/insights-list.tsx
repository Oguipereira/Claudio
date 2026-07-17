import { AlertOctagon, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import type { Insight, InsightSeverity } from "@/domain/insights/types";
import { cn } from "@/lib/utils";

const SEVERITY_ICON: Record<InsightSeverity, typeof Info> = {
  positive: CheckCircle2,
  neutral: Info,
  warning: AlertTriangle,
  critical: AlertOctagon,
};

const SEVERITY_COLOR: Record<InsightSeverity, string> = {
  positive: "text-status-good",
  neutral: "text-muted-foreground",
  warning: "text-status-warning",
  critical: "text-status-critical",
};

export function InsightsList({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Ainda não há dados suficientes para gerar análises. Continue registrando treinos, sono e
        nutrição.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {insights.map((insight) => {
        const Icon = SEVERITY_ICON[insight.severity];
        return (
          <div key={insight.id} className="flex items-start gap-2.5">
            <Icon className={cn("mt-0.5 size-4 shrink-0", SEVERITY_COLOR[insight.severity])} />
            <p className="text-sm text-foreground">{insight.message}</p>
          </div>
        );
      })}
    </div>
  );
}
