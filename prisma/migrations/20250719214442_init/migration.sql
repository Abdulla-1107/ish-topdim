-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN     "acceptedById" TEXT;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_acceptedById_fkey" FOREIGN KEY ("acceptedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
