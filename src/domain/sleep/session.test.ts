import { describe, expect, it } from "vitest";
import { computeSleepSession } from "./session";

describe("computeSleepSession", () => {
  it("calcula sono noturno cruzando a meia-noite", () => {
    const result = computeSleepSession("2026-07-15", "23:00", "07:00");
    expect(result.totalHours).toBe(8);
    expect(result.wakeAt.getTime()).toBeGreaterThan(result.sleepAt.getTime());
    expect(result.wakeAt.getDate()).toBe(result.sleepAt.getDate() + 1);
  });

  it("calcula cochilo no mesmo dia", () => {
    const result = computeSleepSession("2026-07-15", "14:00", "15:30");
    expect(result.totalHours).toBe(1.5);
    expect(result.wakeAt.getDate()).toBe(result.sleepAt.getDate());
  });

  it("preserva precisao de 15 minutos (7h45)", () => {
    const result = computeSleepSession("2026-07-15", "22:30", "06:15");
    expect(result.totalHours).toBe(7.75);
  });
});
