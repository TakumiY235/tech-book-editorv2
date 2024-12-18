/*
  Warnings:

  - You are about to drop the column `aiImprovement` on the `Node` table. All the data in the column will be lost.
  - You are about to drop the column `aiReferences` on the `Node` table. All the data in the column will be lost.
  - You are about to drop the column `aiRelatedTopics` on the `Node` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Node` table. All the data in the column will be lost.
  - You are about to drop the column `keywords` on the `Node` table. All the data in the column will be lost.
  - You are about to drop the column `n_pages` on the `Node` table. All the data in the column will be lost.
  - You are about to drop the column `purpose` on the `Node` table. All the data in the column will be lost.
  - You are about to drop the column `should_split` on the `Node` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Node" DROP COLUMN "aiImprovement",
DROP COLUMN "aiReferences",
DROP COLUMN "aiRelatedTopics",
DROP COLUMN "description",
DROP COLUMN "keywords",
DROP COLUMN "n_pages",
DROP COLUMN "purpose",
DROP COLUMN "should_split",
ADD COLUMN     "metadata" JSONB NOT NULL DEFAULT '{}';
