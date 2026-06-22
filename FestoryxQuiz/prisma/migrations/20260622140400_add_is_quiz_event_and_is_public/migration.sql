-- AlterTable
ALTER TABLE "Event" ADD COLUMN "isQuizEvent" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "QuizSession" ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT false;
