import { NextResponse } from 'next/server';
import { AIEditorService } from '@/services/ai/editorService';

export async function POST(request: Request) {
  try {
    console.log('Received request at /api/generate-structure');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { title, overview, targetAudience, pageCount } = body;

    if (!title || !overview || !targetAudience || !pageCount) {
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

    return NextResponse.json(chapterStructure);
  } catch (error: unknown) {
    console.error('Error in generate-structure route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate chapter structure';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}