export type InsightSeverity = "positive" | "neutral" | "warning" | "critical";
export type InsightCategory = "carga" | "sono" | "nutricao" | "desempenho";

export type Insight = {
  id: string;
  category: InsightCategory;
  severity: InsightSeverity;
  message: string;
};
