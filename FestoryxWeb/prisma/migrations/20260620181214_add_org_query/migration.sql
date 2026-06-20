-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "showOnHomepage" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "OrgQuery" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrgQuery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrgQuery_organizationId_idx" ON "OrgQuery"("organizationId");

-- AddForeignKey
ALTER TABLE "OrgQuery" ADD CONSTRAINT "OrgQuery_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
