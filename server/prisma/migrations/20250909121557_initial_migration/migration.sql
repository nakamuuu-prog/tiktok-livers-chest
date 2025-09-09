-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "pre_registered_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "listeners" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "listeners_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "battle_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "listener_id" INTEGER NOT NULL,
    "item_type" TEXT NOT NULL,
    "expiry_date" DATETIME NOT NULL,
    "is_expired" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "battle_items_listener_id_fkey" FOREIGN KEY ("listener_id") REFERENCES "listeners" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "pre_registered_users_username_key" ON "pre_registered_users"("username");

-- CreateIndex
CREATE INDEX "listeners_user_id_idx" ON "listeners"("user_id");

-- CreateIndex
CREATE INDEX "battle_items_listener_id_idx" ON "battle_items"("listener_id");

-- CreateIndex
CREATE INDEX "battle_items_expiry_date_idx" ON "battle_items"("expiry_date");

-- CreateIndex
CREATE INDEX "battle_items_item_type_idx" ON "battle_items"("item_type");
