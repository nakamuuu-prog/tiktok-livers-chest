-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_battle_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "listener_id" INTEGER NOT NULL,
    "item_type" TEXT NOT NULL,
    "expiry_date" DATETIME NOT NULL,
    "is_expired" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "battle_items_listener_id_fkey" FOREIGN KEY ("listener_id") REFERENCES "listeners" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_battle_items" ("created_at", "expiry_date", "id", "is_expired", "item_type", "listener_id", "updated_at") SELECT "created_at", "expiry_date", "id", "is_expired", "item_type", "listener_id", "updated_at" FROM "battle_items";
DROP TABLE "battle_items";
ALTER TABLE "new_battle_items" RENAME TO "battle_items";
CREATE INDEX "battle_items_listener_id_idx" ON "battle_items"("listener_id");
CREATE INDEX "battle_items_expiry_date_idx" ON "battle_items"("expiry_date");
CREATE INDEX "battle_items_item_type_idx" ON "battle_items"("item_type");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
