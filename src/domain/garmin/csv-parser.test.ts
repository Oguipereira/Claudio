import { describe, expect, it } from "vitest";
import { inferWorkoutCategory, parseGarminActivitiesCsv } from "./csv-parser";

const SAMPLE_CSV = `Tipo de atividade,Data,Favorito,Título,Distância,Calorias,Tempo total,FC Média,FC máxima,Cadência bicicleta média,Cadência de bicicleta máxima,Velocidade média,Velocidade máxima,Subida total,Descida total,Comprimento médio da passada,Training Stress Score®,Passos,Descompressão,Tempo da melhor volta,Número de voltas,Tempo em movimento,Tempo transcorrido,Elevação mínima,Elevação máxima
Cardiovascular,2026-07-16 17:48:19,false,"Cardio","0.00","509","01:07:05","136","188","--","--","--","--","--","--","--","0.0","--","Não","01:07:05","1","00:00:00","01:07:36","--","--"
Corrida,2026-07-10 17:55:15,false,"São Paulo Corrida","2.49","296","00:44:17","119","157","116","172","17:46","7:50","137","143","0.77","0.0","5,312","Não","00:00:07.3","5","00:44:07","00:49:23","2,359","2,405"
Corrida em esteira,2026-07-07 20:08:02,false,"Corrida em esteira","3.11","434","00:33:54","174","189","164","198","10:53","8:13","--","--","0.90","0.0","5,620","Não","00:00:05.0","6","00:31:51","00:36:29","--","--"
Cardiovascular,2026-07-04 12:57:14,false,"Cardio","0.00","58","00:05:06.6","154","170","--","--","--","--","--","--","--","0.0","--","Não","00:05:06.6","1","00:00:00","00:05:06.6","--","--"
`;

describe("parseGarminActivitiesCsv", () => {
  const activities = parseGarminActivitiesCsv(SAMPLE_CSV);

  it("extrai todas as linhas", () => {
    expect(activities).toHaveLength(4);
  });

  it("parseia uma atividade cardio indoor sem distancia/ritmo", () => {
    const cardio = activities[0];
    expect(cardio.activityType).toBe("Cardiovascular");
    expect(cardio.durationMinutes).toBe(67);
    expect(cardio.distanceKm).toBe(0);
    expect(cardio.avgHeartRate).toBe(136);
    expect(cardio.maxHeartRate).toBe(188);
    expect(cardio.calories).toBe(509);
    expect(cardio.paceSecPerKm).toBeNull();
  });

  it("parseia uma corrida com ritmo, passos (com virgula) e distancia", () => {
    const run = activities[1];
    expect(run.activityType).toBe("Corrida");
    expect(run.title).toBe("São Paulo Corrida");
    expect(run.distanceKm).toBe(2.49);
    expect(run.durationMinutes).toBe(44);
    expect(run.paceSecPerKm).toBe(17 * 60 + 46);
    expect(run.steps).toBe(5312);
    expect(run.cadence).toBe(116);
  });

  it("arredonda duracao com segundos fracionados", () => {
    const short = activities[3];
    expect(short.durationMinutes).toBe(5);
  });

  it("gera externalId estavel e unico por tipo+data", () => {
    const ids = new Set(activities.map((a) => a.externalId));
    expect(ids.size).toBe(activities.length);
  });

  it("ignora linhas sem data ou tipo", () => {
    const withBlank = parseGarminActivitiesCsv(SAMPLE_CSV + "\n,,,,,,,,,,,,,,,,,,,,,,,,\n");
    expect(withBlank).toHaveLength(4);
  });
});

describe("inferWorkoutCategory", () => {
  it("mapeia corrida (ar livre ou esteira) para RUNNING", () => {
    expect(inferWorkoutCategory("Corrida")).toBe("RUNNING");
    expect(inferWorkoutCategory("Corrida em esteira")).toBe("RUNNING");
  });

  it("mapeia outras atividades para STRENGTH", () => {
    expect(inferWorkoutCategory("Cardiovascular")).toBe("STRENGTH");
    expect(inferWorkoutCategory("Ciclismo")).toBe("STRENGTH");
  });
});
