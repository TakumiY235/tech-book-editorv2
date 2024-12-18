import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/db';
import { AIEditorService } from '@/services/ai/editorService';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; nodeId: string } }
) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY is not configured' },
      { status: 500 }
    );
  }

  try {
    const node = await prisma.node.findUnique({
      where: {
        id: params.nodeId,
        projectId: params.id,
      },
      include: {
        project: true,
      },
    });

    if (!node) {
      return NextResponse.json(
        { error: 'Node not found' },
        { status: 404 }
      );
    }

    const { bookTitle, targetAudience } = await request.json();
    if (!bookTitle || !targetAudience) {
      return NextResponse.json(
        { error: 'Book title and target audience are required' },
        { status: 400 }
      );
    }

    const aiService = new AIEditorService(process.env.ANTHROPIC_API_KEY);

    console.log('Generating content for node:', node);
    
    const generatedContent = await aiService.generateSectionContent(
      bookTitle,
      targetAudience,
      {
        id: node.id,
        type: node.type,
        title: node.title,
        description: node.description || '',
        purpose: node.purpose || '',
        order: node.order,
        parentId: node.parentId,
        n_pages: node.n_pages,
        should_split: node.should_split,
      }
    );

    console.log('Generated content:', generatedContent);

    const updatedNode = await prisma.node.update({
      where: {
        id: params.nodeId,
        projectId: params.id,
      },
      data: {
        content: generatedContent,
        status: 'in_progress',
      },
    });

    console.log('Updated node:', updatedNode);
    return NextResponse.json(updatedNode);
  } catch (error) {
    console.error('Error generating content:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: `Failed to generate content: ${errorMessage}` },
      { status: 500 }
    );
  }
}