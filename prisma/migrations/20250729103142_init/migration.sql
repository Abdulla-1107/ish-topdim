/*
  Warnings:

  - You are about to drop the column `acceptedById` on the `Announcement` table. All the data in the column will be lost.
  - The `price` column on the `Announcement` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropForeignKey
ALTER TABLE "Announcement" DROP CONSTRAINT "Announcement_acceptedById_fkey";

-- AlterTable
ALTER TABLE "Announcement" DROP COLUMN "acceptedById",
DROP COLUMN "price",
ADD COLUMN     "price" INTEGER;
