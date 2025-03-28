-- AlterTable
ALTER TABLE "Place" ADD COLUMN "lastSyncedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Place_lastSyncedAt_idx" ON "Place"("lastSyncedAt"); 