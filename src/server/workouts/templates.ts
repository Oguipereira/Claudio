import { prisma } from "@/server/db";

export function listWorkoutTemplates() {
  return prisma.workoutTemplate.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
}
