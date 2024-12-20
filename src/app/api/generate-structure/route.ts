import { NextResponse } from 'next/server';
import { AIEditorService } from '@/services/ai/editorService';
import { prisma } from '@/lib/prisma/db';
import { Node, NodeStatus, NodeType, Prisma } from '@prisma/client';
import { ChapterStructure } from '@/services/ai/types';

export async function POST(request: Request) {
  try {
    console.log('Received request at /api/generate-structure');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { projectId, title, overview, targetAudience, pageCount } = body;

    if (!projectId || !title || !overview || !targetAudience || !pageCount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const editorService = new AIEditorService(process.env.ANTHROPIC_API_KEY);
    const chapterStructure = await editorService.generateChapterStructure({
      title,
      overview,
      targetAudience,
      pageCount
    });

    console.log('Generated chapter structure:', chapterStructure);

    // Delete existing nodes for this project
    await prisma.node.deleteMany({
      where: {
        projectId: projectId
      }
    });

    try {
      console.log('Starting node creation process...');
      const createdNodes: Node[] = [];
      const nodeMap = new Map<string, Node>();
      
      // First pass: Create all section nodes
      console.log('Creating section nodes...');
      for (const node of chapterStructure) {
        try {
          if (node.type === 'section') {
            console.log(`Processing section: ${node.id} (${node.title})`);
            
            // Validate section data
            if (!node.title || typeof node.order !== 'number') {
              console.error(`Invalid section data:`, node);
              continue;
            }

            const createdNode = await prisma.node.create({
              data: {
                title: node.title,
                type: 'section' as NodeType,
                projectId: projectId,
                parentId: null, // Sections are top-level nodes
                order: node.order,
                content: '',
                status: 'draft' as NodeStatus,
                description: node.description || '',
                purpose: node.purpose || '',
                n_pages: typeof node.n_pages === 'number' ? node.n_pages : 0,
                should_split: Boolean(node.should_split)
              }
            });

            console.log(`Created section node: ${createdNode.id}`);
            createdNodes.push(createdNode);
            nodeMap.set(node.id, createdNode);
          }
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            console.error(`Error creating section node:`, error);
            throw new Error(`Failed to create section node: ${error.message}`);
          }
          throw error;
        }
      }

      // Second pass: Create all subsection nodes
      console.log('Creating subsection nodes...');
      for (const node of chapterStructure) {
        try {
          if (node.type === 'subsection') {
            console.log(`Processing subsection: ${node.id} (${node.title})`);
            
            // Validate subsection data
            if (!node.title || !node.parentId || typeof node.order !== 'number') {
              console.error(`Invalid subsection data:`, node);
              continue;
            }

            // Verify parent exists
            const parentNode = nodeMap.get(node.parentId);
            if (!parentNode) {
              console.error(`Parent node not found for subsection: ${node.id} (parent: ${node.parentId})`);
              continue;
            }

            const createdNode = await prisma.node.create({
              data: {
                title: node.title,
                type: 'subsection' as NodeType,
                projectId: projectId,
                parentId: parentNode.id,
                order: node.order,
                content: '',
                status: 'draft' as NodeStatus,
                description: node.description || '',
                purpose: node.purpose || '',
                n_pages: typeof node.n_pages === 'number' ? node.n_pages : 0,
                should_split: false // Subsections cannot be split further
              }
            });

            console.log(`Created subsection node: ${createdNode.id}`);
            createdNodes.push(createdNode);
            nodeMap.set(node.id, createdNode);
          }
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2003') {
              throw new Error(`Failed to create node: Invalid project ID or parent node ID`);
            }
          }
          throw error;
        }
      }

      console.log(`Successfully created ${createdNodes.length} nodes`);
      return NextResponse.json(createdNodes);
    } catch (error) {
      console.error('Error creating nodes:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to create nodes' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in generate-structure route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate structure' },
      { status: 500 }
    );
  }
}