/*
  Warnings:

  - You are about to drop the column `action` on the `AIContext` table. All the data in the column will be lost.
  - You are about to drop the column `experience` on the `AIContext` table. All the data in the column will be lost.
  - You are about to drop the column `field` on the `AIContext` table. All the data in the column will be lost.
  - You are about to drop the column `other` on the `AIContext` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."AIContext" DROP COLUMN "action",
DROP COLUMN "experience",
DROP COLUMN "field",
DROP COLUMN "other";
