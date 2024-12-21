-- CreateEnum
CREATE TYPE "NodeType" AS ENUM ('section', 'subsection');

-- CreateEnum
CREATE TYPE "NodeStatus" AS ENUM ('draft', 'in_progress', 'review', 'completed');

-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_nodeId_fkey";

-- DropForeignKey
ALTER TABLE "Edge" DROP CONSTRAINT "Edge_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Edge" DROP CONSTRAINT "Edge_sourceId_fkey";

-- DropForeignKey
ALTER TABLE "Edge" DROP CONSTRAINT "Edge_targetId_fkey";

-- DropForeignKey
ALTER TABLE "Node" DROP CONSTRAINT "Node_projectId_fkey";

-- First handle the Node table changes
ALTER TABLE "Node" 
-- Add new columns with defaults
ADD COLUMN     "aiImprovement" TEXT,
ADD COLUMN     "aiReferences" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "aiRelatedTopics" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "lastEditedBy" TEXT,
ADD COLUMN     "n_pages" DOUBLE PRECISION,
ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "purpose" TEXT,
ADD COLUMN     "should_split" BOOLEAN,
ADD COLUMN     "status" "NodeStatus" NOT NULL DEFAULT 'draft',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
-- Make content nullable
ALTER COLUMN "content" DROP NOT NULL;

-- Handle type column conversion
-- First add a temporary column
ALTER TABLE "Node" ADD COLUMN "type_new" "NodeType";

-- Convert existing data (default to 'section' if type is not recognized)
UPDATE "Node" SET "type_new" = 
  CASE 
    WHEN "type" = 'section' THEN 'section'::"NodeType"
    WHEN "type" = 'subsection' THEN 'subsection'::"NodeType"
    ELSE 'section'::"NodeType"
  END;

-- Drop old column and rename new one
ALTER TABLE "Node" DROP COLUMN "type";
ALTER TABLE "Node" RENAME COLUMN "type_new" TO "type";

-- Make the new type column NOT NULL now that data is converted
ALTER TABLE "Node" ALTER COLUMN "type" SET NOT NULL;

-- Drop metadata column as its data is now split into specific fields
ALTER TABLE "Node" DROP COLUMN "metadata";

-- Handle Project table changes
ALTER TABLE "Project" 
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Drop old tables
DROP TABLE "Chat";
DROP TABLE "Edge";

-- Create new indexes
CREATE INDEX "Node_projectId_idx" ON "Node"("projectId");
CREATE INDEX "Node_parentId_idx" ON "Node"("parentId");

-- Add foreign key constraints
ALTER TABLE "Node" ADD CONSTRAINT "Node_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Node" ADD CONSTRAINT "Node_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Node"("id") ON DELETE SET NULL ON UPDATE CASCADE;
