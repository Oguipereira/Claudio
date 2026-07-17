import { averageHours, averageQuality, currentStreak } from "@/domain/sleep/aggregates";
import { fromPrismaDate, toDateKey } from "@/domain/date";
import { listRecentSleepLogs } from "@/server/sleep/sleep-logs";
import { LogSleepDialog } from "./log-sleep-dialog";
import { SleepStats } from "./sleep-stats";
import { SleepLogItem } from "./sleep-log-item";

export default async function SonoPage() {
  const logs = await listRecentSleepLogs(30);
  const weekly = averageHours(logs.slice(0, 7));
  const monthly = averageHours(logs);
  const quality = averageQuality(logs.slice(0, 7));
  const streak = currentStreak(
    logs.map((log) => toDateKey(fromPrismaDate(log.date))),
    toDateKey(new Date()),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sono</h1>
          <p className="text-sm text-muted-foreground">
            Registro de sono e recuperação.
          </p>
        </div>
        <LogSleepDialog />
      </div>

      <SleepStats weekly={weekly} monthly={monthly} streak={streak} quality={quality} />

      <div className="flex flex-col gap-2">
        {logs.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Nenhuma noite registrada ainda.
          </p>
        ) : (
          logs.map((log) => <SleepLogItem key={log.id} log={log} />)
        )}
      </div>
    </div>
  );
}
