import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatTile({
  label,
  value,
  unit,
  delta,
}: {
  label: string;
  value: string | number;
  unit?: string;
  delta?: { value: string; positive: boolean };
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-end justify-between gap-2">
        <p className="text-2xl font-semibold">
          {value}
          {unit ? (
            <span className="text-sm font-normal text-muted-foreground"> {unit}</span>
          ) : null}
        </p>
        {delta ? (
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-medium",
              delta.positive ? "text-status-good" : "text-status-critical",
            )}
          >
            {delta.positive ? (
              <TrendingUp className="size-3.5" />
            ) : (
              <TrendingDown className="size-3.5" />
            )}
            {delta.value}
          </span>
        ) : null}
      </CardContent>
    </Card>
  );
}
