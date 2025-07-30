-- AlterTable
ALTER TABLE "public"."AIContext" ADD COLUMN     "action" TEXT,
ADD COLUMN     "experience" TEXT,
ADD COLUMN     "field" TEXT[],
ADD COLUMN     "other" TEXT;
