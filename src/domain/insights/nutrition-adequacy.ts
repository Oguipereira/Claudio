export type ProteinAdequacy = {
  targetMinG: number;
  targetMaxG: number;
  status: "low" | "adequate" | "high";
};

/// ISSN Position Stand (Jager et al., 2017): atletas em treinamento
/// combinado de forca e resistencia se beneficiam de 1.6-2.2 g/kg/dia de
/// proteina. Abaixo do minimo, sinaliza possivel insuficiencia para
/// recuperacao/sintese proteica muscular frente ao volume de treino.
export function proteinAdequacy(avgProteinIntakeG: number, weightKg: number): ProteinAdequacy {
  const targetMinG = Math.round(weightKg * 1.6 * 10) / 10;
  const targetMaxG = Math.round(weightKg * 2.2 * 10) / 10;

  let status: ProteinAdequacy["status"] = "adequate";
  if (avgProteinIntakeG < targetMinG) status = "low";
  else if (avgProteinIntakeG > targetMaxG * 1.15) status = "high";

  return { targetMinG, targetMaxG, status };
}

/// Disponibilidade energetica aproximada (Loucks & Thuma, 2003 / conceito de
/// RED-S): calorias consumidas menos o gasto estimado em treino, por kg de
/// massa magra aproximada (usamos peso total, simplificacao). Abaixo de
/// ~30 kcal/kg é a faixa associada a risco de disponibilidade energetica
/// insuficiente (RED-S) na literatura.
export function energyAvailability(
  avgCaloriesIntake: number,
  avgTrainingCaloriesBurned: number,
  weightKg: number,
): number {
  return Math.round(((avgCaloriesIntake - avgTrainingCaloriesBurned) / weightKg) * 10) / 10;
}
