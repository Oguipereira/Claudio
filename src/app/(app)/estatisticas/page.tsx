import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeeklyVolumeChart } from "@/components/charts/weekly-volume-chart";
import { TrendLineChart } from "@/components/charts/trend-line-chart";
import { TrainingHeatmap } from "@/components/charts/training-heatmap";
import { formatLocal, fromPrismaDate, nowInAppTimezone, toDateKey } from "@/domain/date";
import {
  getHeartRateTrend,
  getNutritionTrend,
  getRunningTrend,
  getSleepTrend,
  getTrainingHeatmap,
  getWeeklyVolumeChartData,
} from "@/server/stats/queries";
import { getCurrentNutritionGoal } from "@/server/nutrition/nutrition-goals";

const WEEKS = 12;
const RUNNING_SAMPLES = 15;
const NUTRITION_DAYS = 14;
const SLEEP_DAYS = 30;
const HEATMAP_WEEKS = 16;

export default async function EstatisticasPage() {
  const [volume, runningTrend, hrTrend, nutritionByDate, sleepLogs, heatmapCounts, goal] =
    await Promise.all([
      getWeeklyVolumeChartData(WEEKS),
      getRunningTrend(RUNNING_SAMPLES),
      getHeartRateTrend(RUNNING_SAMPLES),
      getNutritionTrend(NUTRITION_DAYS),
      getSleepTrend(SLEEP_DAYS),
      getTrainingHeatmap(HEATMAP_WEEKS * 7),
      getCurrentNutritionGoal(),
    ]);

  const paceData = runningTrend
    .filter((l) => l.paceSecPerKm)
    .map((l) => ({
      label: formatLocal(l.completedAt, "d MMM", { locale: ptBR }),
      pace: l.paceSecPerKm,
    }));

  const distanceData = runningTrend
    .filter((l) => l.distanceKm)
    .map((l) => ({
      label: formatLocal(l.completedAt, "d MMM", { locale: ptBR }),
      distance: l.distanceKm,
    }));

  const hrData = hrTrend.map((l) => ({
    label: format(l.completedAt, "d MMM", { locale: ptBR }),
    hr: l.avgHeartRate,
  }));

  const nutritionData = Array.from({ length: NUTRITION_DAYS }, (_, i) => {
    const day = subDays(nowInAppTimezone(), NUTRITION_DAYS - 1 - i);
    const key = toDateKey(day);
    const totals = nutritionByDate.get(key);
    return {
      label: format(day, "d MMM", { locale: ptBR }),
      calories: totals?.calories ?? 0,
    };
  });

  const sleepData = sleepLogs.map((log) => ({
    label: format(fromPrismaDate(log.date), "d MMM", { locale: ptBR }),
    hours: log.totalHours,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Estatísticas</h1>
        <p className="text-sm text-muted-foreground">
          Tendências e comparativos das últimas {WEEKS} semanas.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Volume semanal por categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <WeeklyVolumeChart data={volume} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Mapa de treinos</CardTitle>
        </CardHeader>
        <CardContent>
          <TrainingHeatmap counts={heatmapCounts} weeks={HEATMAP_WEEKS} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Evolução do ritmo (corrida)</CardTitle>
          </CardHeader>
          <CardContent>
            {paceData.length === 0 ? (
              <EmptyChart />
            ) : (
              <TrendLineChart
                data={paceData}
                series={[{ key: "pace", label: "Ritmo", color: "var(--chart-3)" }]}
                yUnit="min/km"
                yFormat="pace"
                yDomain={["auto", "auto"]}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Evolução da distância (corrida)</CardTitle>
          </CardHeader>
          <CardContent>
            {distanceData.length === 0 ? (
              <EmptyChart />
            ) : (
              <TrendLineChart
                data={distanceData}
                series={[{ key: "distance", label: "Distância", color: "var(--chart-3)" }]}
                yUnit="km"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Evolução da frequência cardíaca média</CardTitle>
          </CardHeader>
          <CardContent>
            {hrData.length === 0 ? (
              <EmptyChart />
            ) : (
              <TrendLineChart
                data={hrData}
                series={[{ key: "hr", label: "FC média", color: "var(--chart-1)" }]}
                yUnit="bpm"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Sono — horas por noite</CardTitle>
          </CardHeader>
          <CardContent>
            {sleepData.length === 0 ? (
              <EmptyChart />
            ) : (
              <TrendLineChart
                data={sleepData}
                series={[{ key: "hours", label: "Horas de sono", color: "var(--chart-2)" }]}
                yUnit="h"
                referenceValue={7}
                referenceLabel="mínimo recomendado (7h)"
              />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Calorias consumidas por dia</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendLineChart
              data={nutritionData}
              series={[{ key: "calories", label: "Calorias", color: "var(--chart-1)" }]}
              yUnit="kcal"
              referenceValue={goal?.caloriesTarget}
              referenceLabel={goal ? "meta" : undefined}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EmptyChart() {
  return (
    <p className="flex h-64 items-center justify-center text-sm text-muted-foreground">
      Dados insuficientes ainda.
    </p>
  );
}
