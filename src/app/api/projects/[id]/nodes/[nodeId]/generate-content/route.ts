import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/db';
import { Node as PrismaNode } from '@prisma/client';
import { AIEditorService } from '@/services/ai/editorService';
import { BookNode } from '@/hooks/types';

// 型定義
interface GenerateContentRequest {
  bookTitle: string;
  targetAudience: string;
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
async function getSurroundingNodes(projectId: string, nodeId: string, parentId: string | null) {
  const [previousNode, nextNode] = await Promise.all([
    prisma.node.findFirst({
      where: {
        projectId,
        parentId,
        order: { lt: (await prisma.node.findUnique({ where: { id: nodeId } }))?.order ?? 0 }
      },
      orderBy: { order: 'desc' }
    }),
    prisma.node.findFirst({
      where: {
        projectId,
        parentId,
        order: { gt: (await prisma.node.findUnique({ where: { id: nodeId } }))?.order ?? 0 }
      },
      orderBy: { order: 'asc' }
    })
  ]);

  return {
    previousNode: previousNode ? transformNode(previousNode) : null,
    nextNode: nextNode ? transformNode(nextNode) : null
  };
}

async function updateNodeContent(nodeId: string, projectId: string, content: string) {
  return prisma.node.update({
    where: { id: nodeId, projectId },
    data: {
      content,
      status: 'in_progress',
    },
  });
}

// APIハンドラー
export async function POST(
  request: NextRequest,
  context: { params: { id: string; nodeId: string } }
) {
  try {
    const params = await context.params;
    const { id, nodeId } = params;

    // API Key検証
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'API key is not configured', code: 'CONFIG_ERROR' },
        { status: 500 }
      );
    }

    // リクエストボディの検証
    const { bookTitle, targetAudience }: GenerateContentRequest = await request.json();
    if (!bookTitle || !targetAudience) {
      return NextResponse.json(
        {
          error: 'Book title and target audience are required',
          code: 'MISSING_PARAMETERS',
          details: {
            bookTitle: !bookTitle ? 'missing' : 'ok',
            targetAudience: !targetAudience ? 'missing' : 'ok'
          }
        },
        { status: 400 }
      );
    }

    // ノードの取得と検証
    const node = await prisma.node.findUnique({
      where: { id: nodeId, projectId: id },
      include: { project: true },
    });

    if (!node) {
      return NextResponse.json(
        { error: 'Node not found', code: 'NODE_NOT_FOUND' },
        { status: 404 }
      );
    }

    // 周辺ノードの取得
    const { previousNode, nextNode } = await getSurroundingNodes(id, nodeId, node.parentId);

    // コンテンツ生成
    const aiService = new AIEditorService(process.env.ANTHROPIC_API_KEY);
    const generatedContent = await aiService.generateSectionContent(
      bookTitle,
      targetAudience,
      transformNode(node),
      previousNode,
      nextNode
    );

    if (!generatedContent || typeof generatedContent !== 'string') {
      return NextResponse.json(
        { error: 'Invalid content generated', code: 'INVALID_CONTENT' },
        { status: 500 }
      );
    }

    // ノードの更新
    const updatedNode = await updateNodeContent(nodeId, id, generatedContent);
    return NextResponse.json(transformNode(updatedNode));

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}