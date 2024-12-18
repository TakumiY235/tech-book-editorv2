import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/db';

type NodeType = 'section' | 'subsection';
type NodeStatus = 'draft' | 'in_progress' | 'review' | 'completed';

type ValidUpdateFields = {
  title?: string;
  content?: string;
  type?: NodeType;
  status?: NodeStatus;
  description?: string;
  purpose?: string;
  keywords?: string[];
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; nodeId: string } }
) {
  try {
    const updates = await request.json();
    const allowedUpdates = ['title', 'content', 'type', 'status', 'description', 'purpose', 'keywords'] as const;
    
    // Filter out undefined values and only allow specific fields
    const validUpdates = allowedUpdates.reduce<Partial<ValidUpdateFields>>((acc, key) => {
      const value = updates[key];
      if (value !== undefined && value !== null) {
        acc[key] = value;
      }
      return acc;
    }, {});

    // Only proceed with update if there are valid fields to update
    if (Object.keys(validUpdates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const node = await prisma.node.update({
      where: {
        id: params.nodeId,
        projectId: params.id,
      },
      data: validUpdates,
    });

    return NextResponse.json(node);
  } catch (error) {
    console.error('Error updating node:', error);
    return NextResponse.json(
      { error: 'Failed to update node' },
      { status: 500 }
    );
  }
}

async function deleteNodeAndChildren(projectId: string, nodeId: string) {
  // Get all child nodes recursively
  // Get all nodes for this project
  const nodes = await prisma.node.findMany({
    where: {
      projectId: projectId
    }
  });

  // Filter to find child nodes
  const childNodes = nodes.filter(n => {
    const node = n as any;
    return node.parentId === nodeId;
  });

  // Recursively delete all children
  for (const child of childNodes) {
    await deleteNodeAndChildren(projectId, child.id);
  }

  // Delete the node itself
  await prisma.node.delete({
    where: {
      id: nodeId,
      projectId: projectId,
    },
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; nodeId: string } }
) {
  try {
    await deleteNodeAndChildren(params.id, params.nodeId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting node:', error);
    return NextResponse.json(
      { error: 'Failed to delete node' },
      { status: 500 }
    );
  }
}