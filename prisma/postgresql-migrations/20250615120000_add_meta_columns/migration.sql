ALTER TABLE "Instance"
  ADD COLUMN "providerType" VARCHAR(32) DEFAULT 'baileys',
  ADD COLUMN "wabaId" VARCHAR(255),
  ADD COLUMN "phoneNumberId" VARCHAR(255),
  ADD COLUMN "phoneNumber" VARCHAR(50),
  ADD COLUMN "accessToken" TEXT,
  ADD COLUMN "refreshToken" TEXT,
  ADD COLUMN "tokenExpiresAt" TIMESTAMP,
  ADD COLUMN "webhookUrl" TEXT,
  ADD COLUMN "webhookVerifyToken" VARCHAR(255),
  ADD COLUMN "status" VARCHAR(32) DEFAULT 'disconnected';

CREATE UNIQUE INDEX "Instance_phoneNumber_key" ON "Instance"("phoneNumber");
CREATE INDEX "Instance_wabaId_idx" ON "Instance"("wabaId");
CREATE INDEX "Instance_phoneNumberId_idx" ON "Instance"("phoneNumberId");
