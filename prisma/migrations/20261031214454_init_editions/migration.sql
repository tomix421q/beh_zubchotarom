-- CreateTable
CREATE TABLE "Edition" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "year" INTEGER NOT NULL,
    "editionNumber" INTEGER NOT NULL,
    "eventDate" DATETIME NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "registrationUrl" TEXT,
    "resultsUrl" TEXT,
    "galleryUrl" TEXT,
    "propositionsHtml" TEXT,
    "infoHtml" TEXT
);

-- CreateTable
CREATE TABLE "Route" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "editionId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "distanceKm" REAL NOT NULL,
    "elevationM" INTEGER,
    "gpxUrl" TEXT,
    "mapEmbedUrl" TEXT,
    CONSTRAINT "Route_editionId_fkey" FOREIGN KEY ("editionId") REFERENCES "Edition" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Sponsor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "editionId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "webUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Sponsor_editionId_fkey" FOREIGN KEY ("editionId") REFERENCES "Edition" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Edition_year_key" ON "Edition"("year");

-- CreateIndex
CREATE INDEX "Route_editionId_idx" ON "Route"("editionId");

-- CreateIndex
CREATE INDEX "Sponsor_editionId_idx" ON "Sponsor"("editionId");
