/*
  Warnings:

  - You are about to drop the column `value` on the `Level` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Level_value_key";

-- AlterTable
ALTER TABLE "Level" DROP COLUMN "value",
ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "level_id_seq";
