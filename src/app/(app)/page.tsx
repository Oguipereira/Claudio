import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dumbbell, Flame, Footprints } from "lucide-react";
import { StatTile } from "@/components/stat-tile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { daysUntilRace, getPeriodizationPhase, PHASE_LABEL, RACE_DATE } from "@/domain/race";
import { currentStreak } from "@/domain/streak";
import { formatLocal, fromPrismaDate, nowInAppTimezone, toDateKey } from "@/domain/date";
import { CATEGORY_LABEL, STATUS_LABEL } from "@/domain/workouts/labels";
import {
  getCurrentWeekPlannedWorkouts,
  getRecentWorkoutLogs,
  getTodayPlannedWorkouts,
} from "@/server/stats/queries";
import { computeInsights } from "@/server/insights/generate";
import { InsightsList } from "@/components/insights-list";
import { LogBodyMetricDialog } from "./log-body-metric-dialog";

const CATEGORY_ICON = { STRENGTH: Dumbbell, HYROX: Flame, RUNNING: Footprints } as const;

export default async function DashboardPage() {
  const today = nowInAppTimezone();
  const [weekWorkouts, todayWorkouts, recentLogs, insights] = await Promise.all([
    getCurrentWeekPlannedWorkouts(),
    getTodayPlannedWorkouts(),
    getRecentWorkoutLogs(6),
    computeInsights(),
  ]);

  const completed = weekWorkouts.filter((w) => w.status === "COMPLETED");
  const planned = weekWorkouts.filter((w) => w.status === "PLANNED" || w.status === "RESCHEDULED");
  const cancelled = weekWorkouts.filter((w) => w.status === "CANCELLED");
  const weekHours =
    completed.reduce((sum, w) => sum + (w.workoutLog?.durationMinutes ?? 0), 0) / 60;
  const weekCalories = completed.reduce((sum, w) => sum + (w.workoutLog?.calories ?? 0), 0);

  const streak = currentStreak(
    completed.map((w) => toDateKey(fromPrismaDate(w.date))),
    toDateKey(today),
  );

  const phase = getPeriodizationPhase(today);
  const days = daysUntilRace(today);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Painel</h1>
          <p className="text-sm text-muted-foreground">
            Visão geral da preparação para o HYROX.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-2">
          <div className="text-right">
            <p className="text-xl font-semibold leading-none tabular-nums">
              {days >= 0 ? days : 0}
            </p>
            <p className="text-xs text-muted-foreground">
              dias para {format(RACE_DATE, "d MMM yyyy", { locale: ptBR })}
            </p>
          </div>
          <Badge variant="outline">{PHASE_LABEL[phase]}</Badge>
          <LogBodyMetricDialog />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Treinos concluídos (semana)" value={completed.length} unit={`/ ${weekWorkouts.length}`} />
        <StatTile label="Volume (semana)" value={weekHours.toFixed(1)} unit="h" />
        <StatTile label="Calorias em treino (semana)" value={Math.round(weekCalories)} unit="kcal" />
        <StatTile label="Sequência de dias treinando" value={streak} unit="dias" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Análises</CardTitle>
        </CardHeader>
        <CardContent>
          <InsightsList insights={insights} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Hoje</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {todayWorkouts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum treino planejado para hoje.</p>
            ) : (
              todayWorkouts.map((w) => {
                const Icon = CATEGORY_ICON[w.category];
                return (
                  <div key={w.id} className="flex items-center gap-2 text-sm">
                    <Icon className="size-4 text-muted-foreground" />
                    <span className="flex-1">{w.template?.name ?? w.adHocLabel ?? "Treino"}</span>
                    <Badge variant="outline">{STATUS_LABEL[w.status]}</Badge>
                  </div>
                );
              })
            )}
            <Link href="/planejamento" className="mt-1 text-xs text-primary hover:underline">
              Ver planejamento completo
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Atividade recente</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {recentLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum treino registrado ainda.</p>
            ) : (
              recentLogs.map((log) => {
                const Icon = CATEGORY_ICON[log.category];
                return (
                  <div key={log.id} className="flex items-center gap-2 text-sm">
                    <Icon className="size-4 text-muted-foreground" />
                    <span className="flex-1 truncate">
                      {log.plannedWorkout.template?.name ?? log.plannedWorkout.adHocLabel ?? CATEGORY_LABEL[log.category]}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatLocal(log.completedAt, "d MMM", { locale: ptBR })}
                    </span>
                  </div>
                );
              })
            )}
            <Link href="/treinos" className="mt-1 text-xs text-primary hover:underline">
              Ver histórico completo
            </Link>
          </CardContent>
        </Card>
      </div>

      {cancelled.length > 0 ? (
        <p className="text-xs text-muted-foreground">
          {cancelled.length} treino{cancelled.length === 1 ? "" : "s"} cancelado
          {cancelled.length === 1 ? "" : "s"} esta semana · {planned.length} ainda planejado
          {planned.length === 1 ? "" : "s"}.
        </p>
      ) : null}
    </div>
  );
}
