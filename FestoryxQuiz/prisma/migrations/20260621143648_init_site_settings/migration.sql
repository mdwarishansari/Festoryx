-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "feePerParticipant" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "OrgSettings" ADD COLUMN     "showQuiz" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "siteName" TEXT NOT NULL DEFAULT 'Festoryx',
    "eventTitle" TEXT NOT NULL DEFAULT 'Festoryx Events',
    "tagline" TEXT,
    "aboutContent" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "contactAddress" TEXT,
    "footerText" TEXT,
    "logoUrl" TEXT,
    "headerLogoUrl" TEXT,
    "footerLogoUrl" TEXT,
    "faviconUrl" TEXT,
    "instagramUrl" TEXT,
    "githubUrl" TEXT,
    "twitterUrl" TEXT,
    "linkedinUrl" TEXT,
    "youtubeUrl" TEXT,
    "countdownDate" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpVerification" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OtpVerification_email_key" ON "OtpVerification"("email");
