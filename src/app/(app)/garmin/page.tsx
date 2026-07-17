import { ptBR } from "date-fns/locale";
import { formatLocal } from "@/domain/date";
import { listRecentGarminActivities } from "@/server/garmin/import";
import { formatSecondsToPace } from "@/domain/workouts/pace";
import { UploadCsvForm } from "./upload-csv-form";

export default async function GarminPage() {
  const activities = await listRecentGarminActivities();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Garmin</h1>
        <p className="text-sm text-muted-foreground">
          Importação de atividades exportadas do Garmin Connect (CSV).
        </p>
      </div>

      <UploadCsvForm />

      <div className="flex flex-col gap-2">
        {activities.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Nenhuma atividade importada ainda.
          </p>
        ) : (
          activities.map((activity) => {
            const metrics: string[] = [];
            if (activity.durationMinutes) metrics.push(`${activity.durationMinutes} min`);
            if (activity.distanceKm) metrics.push(`${activity.distanceKm} km`);
            if (activity.paceSecPerKm) metrics.push(`${formatSecondsToPace(activity.paceSecPerKm)}/km`);
            if (activity.avgHeartRate) metrics.push(`FC média ${activity.avgHeartRate} bpm`);
            if (activity.calories) metrics.push(`${activity.calories} kcal`);
            if (activity.steps) metrics.push(`${activity.steps} passos`);

            return (
              <div
                key={activity.id}
                className="flex items-start justify-between gap-3 rounded-md border border-border bg-card p-2.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-medium">{activity.activityType}</p>
                    <p className="shrink-0 text-xs text-muted-foreground">
                      {formatLocal(activity.date, "d 'de' MMM, HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  {metrics.length > 0 ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {metrics.join(" · ")}
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
