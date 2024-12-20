import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/db';
import { AIEditorService } from '@/services/ai/editorService';
import { ChapterStructure } from '@/services/ai/types';
import { NodeType, NodeStatus, Node as PrismaNode } from '@prisma/client';

export async function POST(
  request: NextRequest,
  context: { params: { id: string; nodeId: string } }
) {
  try {
    const params = context.params;
    const { id: projectId, nodeId } = params;

    // Get project and node
    const node = await prisma.node.findUnique({
      where: { id: nodeId },
      include: {
        project: true,
      },
    });

    if (!node || !node.project) {
      return NextResponse.json(
        { error: 'Node or project not found' },
        { status: 404 }
      );
    }

    // Get parent node hierarchy
    const parentNodes: ChapterStructure[] = [];
    let currentParentId = node.parentId;
    
    while (currentParentId) {
      const parentNode = await prisma.node.findUnique({
        where: { id: currentParentId },
      });
      
      if (parentNode) {
        parentNodes.unshift({
          id: parentNode.id,
          title: parentNode.title,
          description: parentNode.description || '',
          purpose: parentNode.purpose || '',
          type: parentNode.type as 'section' | 'subsection',
          order: parentNode.order,
          parentId: parentNode.parentId,
          n_pages: parentNode.n_pages,
          should_split: parentNode.should_split,
        });
        currentParentId = parentNode.parentId;
      } else {
        break;
      }
    }

    // Get sibling nodes
    const siblingNodes = await prisma.node.findMany({
      where: {
        parentId: node.parentId,
        id: { not: nodeId }, // Exclude current node
        projectId: node.projectId,
      },
      orderBy: {
        order: 'asc',
      },
    });

    const siblings: ChapterStructure[] = siblingNodes.map(sibling => ({
      id: sibling.id,
      title: sibling.title,
      description: sibling.description || '',
      purpose: sibling.purpose || '',
      type: sibling.type as 'section' | 'subsection',
      order: sibling.order,
      parentId: sibling.parentId,
      n_pages: sibling.n_pages,
      should_split: sibling.should_split,
    }));

    // Use AI service to generate subsections
    const editorService = new AIEditorService(process.env.ANTHROPIC_API_KEY || '');
    const chapterNode: ChapterStructure = {
      id: node.id,
      title: node.title,
      description: node.description || '',
      purpose: node.purpose || '',
      type: node.type as 'section' | 'subsection',
      order: node.order,
      parentId: node.parentId,
      n_pages: node.n_pages,
      should_split: node.should_split,
    };

    // Generate subsections with parent and sibling node context
    const subsections = await editorService.generateNodeSubsections(chapterNode, parentNodes, siblings);

    // Save generated subsections to database
    const createdSubsections = await Promise.all(
      subsections.map(async (subsection: ChapterStructure, index: number) => {
        return await prisma.node.create({
          data: {
            title: subsection.title,
            content: '',
            description: subsection.description,
            purpose: subsection.purpose,
            type: NodeType.subsection,
            status: NodeStatus.draft,
            order: index,
            parentId: nodeId,
            projectId: projectId,
            n_pages: subsection.n_pages,
            should_split: subsection.should_split,
          },
        });
      })
    );

    return NextResponse.json({ subsections: createdSubsections });
  } catch (error) {
    console.error('Error generating subsections:', error);
    return NextResponse.json(
      { error: 'Failed to generate subsections' },
      { status: 500 }
    );
  }
}