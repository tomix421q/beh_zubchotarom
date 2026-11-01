-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Edition" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "year" INTEGER NOT NULL,
    "editionNumber" INTEGER NOT NULL,
    "eventDate" DATETIME NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "registrationUrl" TEXT,
    "resultsUrl" TEXT,
    "galleryUrl" TEXT,
    "propositionsHtml" TEXT,
    "infoHtml" TEXT,
    "registrationOpen" BOOLEAN NOT NULL DEFAULT false,
    "registrationHtml" TEXT
);
INSERT INTO "new_Edition" ("editionNumber", "eventDate", "galleryUrl", "id", "infoHtml", "isCurrent", "propositionsHtml", "registrationUrl", "resultsUrl", "year") SELECT "editionNumber", "eventDate", "galleryUrl", "id", "infoHtml", "isCurrent", "propositionsHtml", "registrationUrl", "resultsUrl", "year" FROM "Edition";
DROP TABLE "Edition";
ALTER TABLE "new_Edition" RENAME TO "Edition";
CREATE UNIQUE INDEX "Edition_year_key" ON "Edition"("year");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
