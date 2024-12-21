import { NextRequest } from 'next/server';
import { withErrorHandling } from '../../../../middleware';
import { handleGenerateStructure } from '../../../../_lib/handlers/structureHandler';

export const POST = withErrorHandling(async (
  request: NextRequest,
  context: { params: { id: string } }
) => {
  const body = await request.json();
  const params = await context.params;
  return handleGenerateStructure(request, {
    projectId: params.id,
    requestBody: body
  });
});