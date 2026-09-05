-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "businessName" TEXT,
    "phoneDisplay" TEXT,
    "phoneE164" TEXT,
    "whatsappE164" TEXT,
    "email" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "hoursWeekdays" TEXT,
    "hoursSaturday" TEXT,
    "hoursSunday" TEXT,
    "facebookUrl" TEXT,
    "updatedAt" DATETIME NOT NULL
);
