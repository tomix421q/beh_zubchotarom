-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Sponsor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "webUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "row" TEXT NOT NULL DEFAULT 'top',
    "isMain" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Sponsor" ("id", "logoUrl", "name", "order", "row", "webUrl") SELECT "id", "logoUrl", "name", "order", "row", "webUrl" FROM "Sponsor";
DROP TABLE "Sponsor";
ALTER TABLE "new_Sponsor" RENAME TO "Sponsor";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
