import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STATS = [
  { key: "weekly", label: "Média 7 dias", unit: "h" },
  { key: "monthly", label: "Média 30 dias", unit: "h" },
  { key: "streak", label: "Sequência atual", unit: "noites" },
  { key: "quality", label: "Qualidade média", unit: "/5" },
] as const;

export function SleepStats({
  weekly,
  monthly,
  streak,
  quality,
}: {
  weekly: number | null;
  monthly: number | null;
  streak: number;
  quality: number | null;
}) {
  const values: Record<(typeof STATS)[number]["key"], number | null> = {
    weekly,
    monthly,
    streak,
    quality,
  };

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {STATS.map((stat) => (
        <Card key={stat.key}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {stat.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold tabular-nums">
              {values[stat.key] ?? "—"}
              {values[stat.key] !== null ? (
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}
                  {stat.unit}
                </span>
              ) : null}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
