-- CreateTable
CREATE TABLE "EmailSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "host" TEXT,
    "port" INTEGER DEFAULT 465,
    "user" TEXT,
    "pass" TEXT,
    "fromName" TEXT DEFAULT 'Fresh Dry Fruits',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailSettings_pkey" PRIMARY KEY ("id")
);
