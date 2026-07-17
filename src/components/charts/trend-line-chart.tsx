"use client";

import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export type TrendSeries = {
  key: string;
  label: string;
  color: string;
};

export function TrendLineChart({
  data,
  series,
  yUnit,
  yDomain,
  yTickFormatter,
  referenceValue,
  referenceLabel,
}: {
  data: Record<string, unknown>[];
  series: TrendSeries[];
  yUnit?: string;
  yDomain?: [number | "auto", number | "auto"];
  yTickFormatter?: (value: number) => string;
  referenceValue?: number;
  referenceLabel?: string;
}) {
  const chartConfig = Object.fromEntries(
    series.map((s) => [s.key, { label: s.label, color: s.color }]),
  ) satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
      <LineChart data={data} margin={{ left: 4, right: 12 }}>
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
          width={40}
          domain={yDomain}
          tickFormatter={yTickFormatter}
          label={
            yUnit
              ? { value: yUnit, angle: -90, position: "insideLeft", style: { fill: "var(--muted-foreground)" } }
              : undefined
          }
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        {series.length > 1 ? <ChartLegend content={<ChartLegendContent />} /> : null}
        {referenceValue !== undefined ? (
          <ReferenceLine
            y={referenceValue}
            stroke="var(--chart-axis)"
            strokeDasharray="4 4"
            label={{
              value: referenceLabel,
              position: "insideTopRight",
              fill: "var(--muted-foreground)",
              fontSize: 11,
            }}
          />
        ) : null}
        {series.map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            stroke={`var(--color-${s.key})`}
            strokeWidth={2}
            dot={{ r: 3, strokeWidth: 2, fill: "var(--card)" }}
            activeDot={{ r: 5 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
}
