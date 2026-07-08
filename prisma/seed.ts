import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import type {
  HyroxStructure,
  RunningStructure,
  StrengthStructure,
} from "../src/domain/workouts/template-structure";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const strengthTemplates: {
  name: string;
  description: string;
  structure: StrengthStructure;
}[] = [
  {
    name: "Treino A",
    description: "Peito, triceps e ombro",
    structure: {
      kind: "strength",
      muscleGroups: ["Peito", "Triceps", "Ombro", "Biceps"],
    },
  },
  {
    name: "Treino B",
    description: "Perna completa com enfase em corrida",
    structure: {
      kind: "strength",
      muscleGroups: ["Perna completa", "Enfase em corrida"],
    },
  },
  {
    name: "Treino C",
    description: "Costas e biceps",
    structure: {
      kind: "strength",
      muscleGroups: ["Costas", "Biceps"],
    },
  },
];

const hyroxTemplates: {
  name: string;
  description: string;
  structure: HyroxStructure;
}[] = [
  {
    name: "2000m Remo",
    description: "Teste de cardio: 2000 metros de remo",
    structure: {
      kind: "hyrox",
      blocks: [
        { name: "Remo", rounds: 1, station: "2000m Remo", exercises: ["2000m Remo"] },
      ],
    },
  },
  {
    name: "2000m Ski",
    description: "Teste de cardio: 2000 metros de esqui metropolitano",
    structure: {
      kind: "hyrox",
      blocks: [
        { name: "Ski", rounds: 1, station: "2000m Ski", exercises: ["2000m Ski"] },
      ],
    },
  },
  {
    name: "Picadinho",
    description: "Circuito HYROX em 4 blocos de 3 rounds",
    structure: {
      kind: "hyrox",
      blocks: [
        {
          name: "Bloco 1",
          rounds: 3,
          station: "2 minutos Carrinho",
          exercises: ["10 Burpees", "10 Flexoes", "10 Burpees"],
        },
        {
          name: "Bloco 2",
          rounds: 3,
          station: "2 minutos Ski",
          exercises: ["10 Agachamentos", "10 Bolas de Parede", "10 Agachamentos"],
        },
        {
          name: "Bloco 3",
          rounds: 3,
          station: "2 minutos Bike",
          exercises: [
            "10 Bolas de Parede",
            "Isometria das 10 Bolas de Parede",
            "10 Bolas de Parede",
          ],
        },
        {
          name: "Bloco 4",
          rounds: 3,
          station: "2 minutos Corrida",
          exercises: ["10 Afundos", "10 Agachamentos com Salto", "10 Afundos"],
        },
      ],
    },
  },
];

const runningTemplates: {
  name: string;
  description: string;
  structure: RunningStructure;
}[] = [
  { name: "Corrida 5km", description: "Corrida de 5 quilometros", structure: { kind: "running", targetDistanceKm: 5 } },
  { name: "Corrida 8km", description: "Corrida de 8 quilometros", structure: { kind: "running", targetDistanceKm: 8 } },
  { name: "Corrida 10km", description: "Corrida de 10 quilometros", structure: { kind: "running", targetDistanceKm: 10 } },
  { name: "Corrida 12km", description: "Corrida de 12 quilometros", structure: { kind: "running", targetDistanceKm: 12 } },
  {
    name: "Corrida intervalada",
    description: "Resistencia: corrida com intervalos (detalhar tiros/pace ao registrar)",
    structure: { kind: "running", description: "Corrida intervalada" },
  },
];

async function main() {
  for (const t of strengthTemplates) {
    await prisma.workoutTemplate.upsert({
      where: { name: t.name },
      update: { description: t.description, structure: t.structure, category: "STRENGTH" },
      create: { name: t.name, description: t.description, structure: t.structure, category: "STRENGTH" },
    });
  }

  for (const t of hyroxTemplates) {
    await prisma.workoutTemplate.upsert({
      where: { name: t.name },
      update: { description: t.description, structure: t.structure, category: "HYROX" },
      create: { name: t.name, description: t.description, structure: t.structure, category: "HYROX" },
    });
  }

  for (const t of runningTemplates) {
    await prisma.workoutTemplate.upsert({
      where: { name: t.name },
      update: { description: t.description, structure: t.structure, category: "RUNNING" },
      create: { name: t.name, description: t.description, structure: t.structure, category: "RUNNING" },
    });
  }

  console.log("Seed concluido.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
