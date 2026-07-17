export function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/// Variacao percentual de `current` em relacao a `baseline`.
export function percentDelta(current: number, baseline: number): number | null {
  if (baseline === 0) return null;
  return Math.round(((current - baseline) / baseline) * 1000) / 10;
}

/// Diferenca absoluta arredondada, usada para deltas em unidades naturais
/// (segundos de ritmo, bpm, horas de sono).
export function absoluteDelta(current: number, baseline: number, decimals = 1): number {
  const factor = 10 ** decimals;
  return Math.round((current - baseline) * factor) / factor;
}
