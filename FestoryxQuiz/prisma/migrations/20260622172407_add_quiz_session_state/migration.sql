-- AlterTable
ALTER TABLE "QuizSession" ADD COLUMN     "activeQuestionId" TEXT,
ADD COLUMN     "buzzerOpen" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "questionCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "questionEndsAt" TIMESTAMP(3),
ADD COLUMN     "questionStartedAt" TIMESTAMP(3),
ADD COLUMN     "rapidFireState" JSONB;
