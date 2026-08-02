-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "publicToken" TEXT;

-- Backfill existing rows before the column becomes required. gen_random_uuid()
-- is built in from PostgreSQL 13, so this needs no extension; two of them give
-- the same 64 hex chars the application generates.
UPDATE "Order"
SET "publicToken" = replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')
WHERE "publicToken" IS NULL;

ALTER TABLE "Order" ALTER COLUMN "publicToken" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Order_publicToken_key" ON "Order"("publicToken");
