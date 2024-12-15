import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/db';

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    // TODO: Get actual user ID from session
    const userId = 'temp-user-id';  // 仮のユーザーID

    const project = await prisma.project.create({
      data: {
        name,
        userId,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        user: true,
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}