import { withErrorHandling, withValidation, withPerformanceLogging } from '../middleware';
import { CreateProjectRequest } from '../_lib/types/projects';
import { createProjectSchema } from '../_lib/validation/schemas';
import { handleCreateProject, handleGetProjects } from '../_lib/handlers/projectHandlers';

// エンドポイントハンドラー
export const POST = withPerformanceLogging(
  withErrorHandling(
    withValidation<CreateProjectRequest>(createProjectSchema, handleCreateProject)
  )
);

export const GET = withPerformanceLogging(
  withErrorHandling(handleGetProjects)
);