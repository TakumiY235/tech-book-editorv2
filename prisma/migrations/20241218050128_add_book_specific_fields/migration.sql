-- AlterTable
ALTER TABLE "Node" ADD COLUMN     "description" TEXT,
ADD COLUMN     "n_pages" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "purpose" TEXT,
ADD COLUMN     "should_split" BOOLEAN NOT NULL DEFAULT false;
