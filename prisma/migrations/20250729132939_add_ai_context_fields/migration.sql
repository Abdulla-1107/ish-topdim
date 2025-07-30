/*
  Warnings:

  - The primary key for the `AIContext` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `AIContext` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."AIContext_userId_key";

-- AlterTable
ALTER TABLE "public"."AIContext" DROP CONSTRAINT "AIContext_pkey",
DROP COLUMN "id",
ADD COLUMN     "action" TEXT,
ADD COLUMN     "field" TEXT[],
ADD COLUMN     "other" TEXT,
ALTER COLUMN "type" DROP DEFAULT,
ADD CONSTRAINT "AIContext_pkey" PRIMARY KEY ("userId");
