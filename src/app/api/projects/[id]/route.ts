import { withErrorHandling, withValidation } from '@app/api/middleware';
import { UpdateProjectRequest } from '@app/api/_lib/types/projects';
import { updateProjectSchema } from '@app/api/_lib/validation/schemas';
import {
  handleGetProject,
  handleUpdateProject,
  handleDeleteProject
} from '@app/api/_lib/handlers/projectHandlers';

// エンドポイントハンドラー
export const GET = withErrorHandling(handleGetProject);

export const PUT = withErrorHandling(
  withValidation<UpdateProjectRequest>(updateProjectSchema, handleUpdateProject)
);

export const DELETE = withErrorHandling(handleDeleteProject);