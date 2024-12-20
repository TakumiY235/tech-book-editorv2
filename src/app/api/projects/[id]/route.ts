import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/db';
import { Node as PrismaNode } from '@prisma/client';
import { load } from 'js-yaml';
import { BookNode, Project } from '@/hooks/types';

// 型定義
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

// ユーティリティ関数
function transformNode(dbNode: PrismaNode): BookNode {
  return {
    id: dbNode.id,
    title: dbNode.title,
    content: dbNode.content || '',
    description: dbNode.description || '',
    purpose: dbNode.purpose || '',
    type: dbNode.type,
    status: dbNode.status,
    order: dbNode.order,
    parentId: dbNode.parentId,
    n_pages: dbNode.n_pages,
    should_split: dbNode.should_split,
  };
}

// データベース操作関数
async function createNodesFromYaml(projectId: string, yamlData: any) {
  await prisma.node.deleteMany({ where: { projectId } });
  
  for (const node of yamlData.project.nodes) {
    await prisma.node.create({
      data: {
        title: node.title,
        type: node.type.includes('section') ? 'section' : 'subsection',
        projectId,
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
  
  return getNodes(projectId);
}

async function getNodes(projectId: string) {
  const nodes = await prisma.node.findMany({
    where: { projectId },
    orderBy: [{ order: 'asc' }],
  });
  return nodes.map(transformNode);
}

// APIハンドラー
export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const params = await context.params;
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      const yamlData = load(await file.text()) as { project: { nodes: any[] } };
      if (!yamlData?.project?.nodes) {
        return NextResponse.json({ error: 'Invalid YAML structure' }, { status: 400 });
      }

      const nodes = await createNodesFromYaml(params.id, yamlData);
      return NextResponse.json(nodes);
    }

    // 通常のノード作成処理
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
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // 親ノードの検証
    if (parentId) {
      const parentNode = await prisma.node.findUnique({
        where: { id: parentId },
      });

      if (!parentNode) {
        return NextResponse.json({ error: 'Parent node not found' }, { status: 400 });
      }

      if (parentNode.projectId !== params.id) {
        return NextResponse.json(
          { error: 'Parent node must belong to the same project' },
          { status: 400 }
        );
      }
    }

    // 同じ親を持つノードの最大order値を取得
    const lastNode = await prisma.node.findFirst({
      where: {
        projectId: params.id,
        parentId: parentId
      },
      orderBy: { order: 'desc' },
    });

    const newOrder = lastNode ? lastNode.order + 1 : 0;

    // ノードの作成
    const node = await prisma.node.create({
      data: {
        title,
        content: content || '',
        type,
        projectId: params.id,
        parentId,
        order: newOrder,
        status: 'draft',
        description,
        purpose,
        n_pages,
        should_split
      },
    });

    return NextResponse.json(transformNode(node));
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const params = await context.params;
    
    // プロジェクトの取得
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        nodes: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // プロジェクトデータの変換
    const transformedProject: Project = {
      id: project.id,
      name: project.name,
      nodes: project.nodes.map(transformNode),
      metadata: project.metadata as {
        targetAudience?: string;
        overview?: string;
        pageCount?: number;
      }
    };

    return NextResponse.json(transformedProject);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}