-- AlterTable
ALTER TABLE "Node" ALTER COLUMN "aiReferences" DROP DEFAULT,
ALTER COLUMN "aiRelatedTopics" DROP DEFAULT,
ALTER COLUMN "keywords" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "updatedAt" DROP DEFAULT;
