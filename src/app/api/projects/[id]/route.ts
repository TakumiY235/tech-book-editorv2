import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: {
        id: params.id,
      },
      include: {
        nodes: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json();
    const allowedUpdates = ['name', 'metadata'];
    
    // Filter out undefined values and only allow specific fields
    const validUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
      if (value !== undefined && allowedUpdates.includes(key)) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    const project = await prisma.project.update({
      where: {
        id: params.id,
      },
      data: validUpdates,
      include: {
        nodes: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.project.delete({
      where: {
        id: params.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}