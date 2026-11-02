-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Sponsor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "webUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "row" TEXT NOT NULL DEFAULT 'top'
);
INSERT INTO "new_Sponsor" ("id", "logoUrl", "name", "order", "webUrl") SELECT "id", "logoUrl", "name", "order", "webUrl" FROM "Sponsor";
DROP TABLE "Sponsor";
ALTER TABLE "new_Sponsor" RENAME TO "Sponsor";

-- Existing sponsors keep their look: the old layout put every second sponsor (by order) in the bottom row
UPDATE "Sponsor" SET "row" = 'bottom' WHERE "id" IN (
    SELECT "id" FROM (
        SELECT "id", ROW_NUMBER() OVER (ORDER BY "order" ASC, "id" ASC) AS "position" FROM "Sponsor"
    ) WHERE "position" % 2 = 0
);
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
