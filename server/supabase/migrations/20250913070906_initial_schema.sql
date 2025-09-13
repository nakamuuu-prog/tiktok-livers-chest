-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."ItemType" AS ENUM ('グローブ', 'スタンハンマー', 'ミスト', 'タイム', '2位ブースター', '3位ブースター');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pre_registered_users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "is_registered" BOOLEAN NOT NULL DEFAULT false,
    "registered_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER,

    CONSTRAINT "pre_registered_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."listeners" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listeners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."battle_items" (
    "id" SERIAL NOT NULL,
    "listener_id" INTEGER NOT NULL,
    "item_type" "public"."ItemType" NOT NULL,
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "is_expired" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "battle_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "pre_registered_users_username_key" ON "public"."pre_registered_users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "pre_registered_users_user_id_key" ON "public"."pre_registered_users"("user_id");

-- CreateIndex
CREATE INDEX "listeners_user_id_idx" ON "public"."listeners"("user_id");

-- CreateIndex
CREATE INDEX "battle_items_listener_id_idx" ON "public"."battle_items"("listener_id");

-- CreateIndex
CREATE INDEX "battle_items_expiry_date_idx" ON "public"."battle_items"("expiry_date");

-- CreateIndex
CREATE INDEX "battle_items_item_type_idx" ON "public"."battle_items"("item_type");

-- AddForeignKey
ALTER TABLE "public"."pre_registered_users" ADD CONSTRAINT "pre_registered_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."listeners" ADD CONSTRAINT "listeners_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."battle_items" ADD CONSTRAINT "battle_items_listener_id_fkey" FOREIGN KEY ("listener_id") REFERENCES "public"."listeners"("id") ON DELETE CASCADE ON UPDATE CASCADE;
