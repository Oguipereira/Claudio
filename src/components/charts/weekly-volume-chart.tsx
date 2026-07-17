"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { parseDateKey } from "@/domain/date";
import { CATEGORY_LABEL } from "@/domain/workouts/labels";
import type { WeeklyVolumeBucket } from "@/domain/stats/weekly-volume";

const chartConfig = {
  STRENGTH: { label: CATEGORY_LABEL.STRENGTH, color: "var(--chart-1)" },
  HYROX: { label: CATEGORY_LABEL.HYROX, color: "var(--chart-2)" },
  RUNNING: { label: CATEGORY_LABEL.RUNNING, color: "var(--chart-3)" },
} satisfies ChartConfig;

export function WeeklyVolumeChart({ data }: { data: WeeklyVolumeBucket[] }) {
  const chartData = data.map((bucket) => ({
    ...bucket,
    label: format(parseDateKey(bucket.weekStart), "d MMM", { locale: ptBR }),
  }));

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
      <BarChart data={chartData} barCategoryGap={12}>
        <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={{ stroke: "var(--chart-axis)" }}
          tickMargin={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={32}
          label={{ value: "horas", angle: -90, position: "insideLeft", style: { fill: "var(--muted-foreground)" } }}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="STRENGTH" fill="var(--color-STRENGTH)" radius={[4, 4, 0, 0]} maxBarSize={24} />
        <Bar dataKey="HYROX" fill="var(--color-HYROX)" radius={[4, 4, 0, 0]} maxBarSize={24} />
        <Bar dataKey="RUNNING" fill="var(--color-RUNNING)" radius={[4, 4, 0, 0]} maxBarSize={24} />
      </BarChart>
    </ChartContainer>
  );
}
