import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/db';
import type { Prisma } from '@prisma/client';
import { load } from 'js-yaml';

interface CreateNodeRequest {
  title: string;
  content?: string;
  type?: 'section' | 'subsection';
  parentId?: string | null;
  description?: string;
  purpose?: string;
  n_pages?: number;
  should_split?: boolean;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        return NextResponse.json(
          { error: 'No file provided' },
          { status: 400 }
        );
      }

      const fileContent = await file.text();
      const yamlData = load(fileContent) as { project: { nodes: any[] } };
      
      if (!yamlData || !yamlData.project || !yamlData.project.nodes) {
        return NextResponse.json(
          { error: 'Invalid YAML structure' },
          { status: 400 }
        );
      }

      // Delete existing nodes
      await prisma.node.deleteMany({
        where: {
          projectId: params.id,
        },
      });

      // Create new nodes
      // Create new nodes
      for (const node of yamlData.project.nodes) {
        await prisma.node.create({
          data: {
            title: node.title,
            type: node.type.includes('section') ? 'section' : 'subsection',
            projectId: params.id,
            parentId: node.parentId,
            order: node.order,
            content: '',
            status: 'draft',
            description: node.description || '',
            purpose: node.purpose || '',
            n_pages: node.n_pages || 0,
            should_split: node.should_split || false
          },
        });
      }

      const updatedNodes = await prisma.node.findMany({
        where: {
          projectId: params.id,
        },
      });

      return NextResponse.json(updatedNodes);
    }

    // Handle regular node creation
    const {
      title,
      content,
      type = 'section',
      parentId = null,
      description = '',
      purpose = '',
      n_pages = 0,
      should_split = false
    }: CreateNodeRequest = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Validate parent node if provided
    if (parentId) {
      const parentNode = await prisma.node.findUnique({
        where: {
          id: parentId,
        },
      });

      if (!parentNode) {
        return NextResponse.json(
          { error: 'Parent node not found' },
          { status: 400 }
        );
      }

      if (parentNode.projectId !== params.id) {
        return NextResponse.json(
          { error: 'Parent node must belong to the same project' },
          { status: 400 }
        );
      }
    }

    // Get the highest order number for nodes with the same parent
    const lastNode = await prisma.node.findFirst({
      where: {
        projectId: params.id,
        ...(parentId ? { parentId } : {})
      },
      orderBy: {
        order: 'desc',
      },
    });

    const newOrder = lastNode ? lastNode.order + 1 : 0;

    // Create the node
    const node = await prisma.node.create({
      data: {
        title,
        content: content || '',
        type: type === 'section' ? 'section' : 'subsection',
        projectId: params.id,
        parentId,
        order: newOrder,
        description: description || '',
        purpose: purpose || '',
        n_pages: n_pages,
        should_split: should_split
      },
    });
    return NextResponse.json(node);
  } catch (error) {
    console.error('Error creating node:', error);
    return NextResponse.json(
      { error: 'Failed to create node' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const nodes = await prisma.node.findMany({
      where: {
        projectId: params.id,
      },
      orderBy: [
        { order: 'asc' },
      ],
    });

    return NextResponse.json(nodes);
  } catch (error) {
    console.error('Error fetching nodes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nodes' },
      { status: 500 }
    );
  }
}