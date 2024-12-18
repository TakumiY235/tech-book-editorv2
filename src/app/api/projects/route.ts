import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/db';

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    // 開発用の固定ユーザーを取得または作成
    const user = await prisma.user.upsert({
      where: {
        email: 'dev@example.com',
      },
      update: {},
      create: {
        email: 'dev@example.com',
        name: 'Developer',
      },
    });

    const project = await prisma.project.create({
      data: {
        name,
        userId: user.id,
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Project creation error:', error);
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
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Project fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}