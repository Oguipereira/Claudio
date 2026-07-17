-- CreateEnum
CREATE TYPE "WorkoutCategory" AS ENUM ('STRENGTH', 'HYROX', 'RUNNING');

-- CreateEnum
CREATE TYPE "PlannedWorkoutStatus" AS ENUM ('PLANNED', 'COMPLETED', 'RESCHEDULED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK');

-- CreateEnum
CREATE TYPE "FoodSource" AS ENUM ('USDA', 'OPEN_FOOD_FACTS', 'CUSTOM');

-- CreateTable
CREATE TABLE "WorkoutTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "WorkoutCategory" NOT NULL,
    "description" TEXT,
    "structure" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlannedWorkout" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" "PlannedWorkoutStatus" NOT NULL DEFAULT 'PLANNED',
    "category" "WorkoutCategory" NOT NULL,
    "adHocLabel" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "templateId" TEXT,

    CONSTRAINT "PlannedWorkout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutLog" (
    "id" TEXT NOT NULL,
    "plannedWorkoutId" TEXT NOT NULL,
    "category" "WorkoutCategory" NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durationMinutes" INTEGER,
    "avgHeartRate" INTEGER,
    "maxHeartRate" INTEGER,
    "calories" INTEGER,
    "notes" TEXT,
    "distanceKm" DOUBLE PRECISION,
    "paceSecPerKm" INTEGER,
    "cadence" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkoutLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GarminActivity" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "activityType" TEXT,
    "durationMinutes" INTEGER,
    "distanceKm" DOUBLE PRECISION,
    "avgHeartRate" INTEGER,
    "maxHeartRate" INTEGER,
    "calories" INTEGER,
    "steps" INTEGER,
    "cadence" INTEGER,
    "rawData" JSONB,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workoutLogId" TEXT,
    "plannedWorkoutId" TEXT,

    CONSTRAINT "GarminActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source" "FoodSource" NOT NULL,
    "externalId" TEXT,
    "caloriesPer100g" DOUBLE PRECISION NOT NULL,
    "proteinPer100g" DOUBLE PRECISION NOT NULL,
    "carbsPer100g" DOUBLE PRECISION NOT NULL,
    "fatPer100g" DOUBLE PRECISION NOT NULL,
    "fiberPer100g" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FoodItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodLog" (
    "id" TEXT NOT NULL,
    "foodItemId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "mealType" "MealType" NOT NULL,
    "grams" DOUBLE PRECISION NOT NULL,
    "time" TIMESTAMP(3),
    "notes" TEXT,
    "calories" DOUBLE PRECISION NOT NULL,
    "protein" DOUBLE PRECISION NOT NULL,
    "carbs" DOUBLE PRECISION NOT NULL,
    "fat" DOUBLE PRECISION NOT NULL,
    "fiber" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FoodLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutritionGoal" (
    "id" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "caloriesTarget" INTEGER NOT NULL,
    "proteinTarget" INTEGER NOT NULL,
    "carbsTarget" INTEGER NOT NULL,
    "fatTarget" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NutritionGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SleepLog" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "sleepAt" TIMESTAMP(3) NOT NULL,
    "wakeAt" TIMESTAMP(3) NOT NULL,
    "totalHours" DOUBLE PRECISION NOT NULL,
    "quality" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SleepLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BodyMetricLog" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "weightKg" DOUBLE PRECISION,
    "restingHeartRate" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BodyMetricLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutTemplate_name_key" ON "WorkoutTemplate"("name");

-- CreateIndex
CREATE INDEX "WorkoutTemplate_category_idx" ON "WorkoutTemplate"("category");

-- CreateIndex
CREATE INDEX "PlannedWorkout_date_idx" ON "PlannedWorkout"("date");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutLog_plannedWorkoutId_key" ON "WorkoutLog"("plannedWorkoutId");

-- CreateIndex
CREATE INDEX "WorkoutLog_completedAt_idx" ON "WorkoutLog"("completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "GarminActivity_externalId_key" ON "GarminActivity"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "GarminActivity_workoutLogId_key" ON "GarminActivity"("workoutLogId");

-- CreateIndex
CREATE UNIQUE INDEX "GarminActivity_plannedWorkoutId_key" ON "GarminActivity"("plannedWorkoutId");

-- CreateIndex
CREATE INDEX "GarminActivity_date_idx" ON "GarminActivity"("date");

-- CreateIndex
CREATE UNIQUE INDEX "FoodItem_source_externalId_key" ON "FoodItem"("source", "externalId");

-- CreateIndex
CREATE INDEX "FoodLog_date_idx" ON "FoodLog"("date");

-- CreateIndex
CREATE INDEX "NutritionGoal_startDate_idx" ON "NutritionGoal"("startDate");

-- CreateIndex
CREATE UNIQUE INDEX "SleepLog_date_key" ON "SleepLog"("date");

-- CreateIndex
CREATE INDEX "SleepLog_date_idx" ON "SleepLog"("date");

-- CreateIndex
CREATE UNIQUE INDEX "BodyMetricLog_date_key" ON "BodyMetricLog"("date");

-- CreateIndex
CREATE INDEX "BodyMetricLog_date_idx" ON "BodyMetricLog"("date");

-- AddForeignKey
ALTER TABLE "PlannedWorkout" ADD CONSTRAINT "PlannedWorkout_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "WorkoutTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutLog" ADD CONSTRAINT "WorkoutLog_plannedWorkoutId_fkey" FOREIGN KEY ("plannedWorkoutId") REFERENCES "PlannedWorkout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GarminActivity" ADD CONSTRAINT "GarminActivity_workoutLogId_fkey" FOREIGN KEY ("workoutLogId") REFERENCES "WorkoutLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GarminActivity" ADD CONSTRAINT "GarminActivity_plannedWorkoutId_fkey" FOREIGN KEY ("plannedWorkoutId") REFERENCES "PlannedWorkout"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodLog" ADD CONSTRAINT "FoodLog_foodItemId_fkey" FOREIGN KEY ("foodItemId") REFERENCES "FoodItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
