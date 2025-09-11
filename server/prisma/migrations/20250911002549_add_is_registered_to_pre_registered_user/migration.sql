-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_pre_registered_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "is_registered" BOOLEAN NOT NULL DEFAULT false,
    "registered_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER,
    CONSTRAINT "pre_registered_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_pre_registered_users" ("created_at", "id", "username") SELECT "created_at", "id", "username" FROM "pre_registered_users";
DROP TABLE "pre_registered_users";
ALTER TABLE "new_pre_registered_users" RENAME TO "pre_registered_users";
CREATE UNIQUE INDEX "pre_registered_users_username_key" ON "pre_registered_users"("username");
CREATE UNIQUE INDEX "pre_registered_users_user_id_key" ON "pre_registered_users"("user_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
