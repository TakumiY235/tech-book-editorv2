import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/db';
import type { Node, Prisma } from '@prisma/client';

interface ReorderRequest {
  nodeId: string;
  newOrder: number;
  newParentId: string | null;
}

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const params = context.params;
    const { nodeId, newOrder, newParentId } = (await request.json()) as ReorderRequest;

    // Get the node to be moved
    const node = await prisma.node.findUnique({
      where: { id: nodeId }
    });

    if (!node) {
      return NextResponse.json(
        { error: 'Node not found' },
        { status: 404 }
      );
    }

    const oldParentId = node.parentId;

    // If moving to a new parent, validate the parent node
    if (newParentId && newParentId !== oldParentId) {
      const parentNode = await prisma.node.findUnique({
        where: { id: newParentId }
      });

      if (!parentNode) {
        return NextResponse.json(
          { error: 'Parent node not found' },
          { status: 404 }
        );
      }

      if (parentNode.type !== 'section') {
        return NextResponse.json(
          { error: 'Parent node must be a section' },
          { status: 400 }
        );
      }
    }

    // Update orders of other nodes
    await prisma.$transaction(async (tx) => {
      // Move nodes up in the old parent's list
      if (oldParentId) {
        await tx.node.updateMany({
          where: {
            AND: {
              projectId: params.id,
              parentId: oldParentId,
              order: { gt: node.order }
            }
          },
          data: {
            order: {
              decrement: 1,
            },
          },
        });
      }

      // Move nodes down in the new parent's list
      if (newParentId) {
        await tx.node.updateMany({
          where: {
            AND: {
              projectId: params.id,
              parent: { id: newParentId },
              order: { gte: newOrder }
            }
          },
          data: {
            order: {
              increment: 1,
            },
          },
        });
      }

      // Update the moved node
      await tx.node.update({
        where: { id: nodeId },
        data: {
          order: newOrder,
          parent: newParentId ? { connect: { id: newParentId } } : { disconnect: true }
        },
      });
    });

    // Return updated list of nodes
    const nodes = await prisma.node.findMany({
      where: {
        projectId: params.id,
      },
      include: {
        parent: true,
        children: true
      },
      orderBy: {
        order: 'asc',
      }
    });

    return NextResponse.json(nodes);
  } catch (error) {
    console.error('Error reordering nodes:', error);
    return NextResponse.json(
      { error: 'Failed to reorder nodes' },
      { status: 500 }
    );
  }
}