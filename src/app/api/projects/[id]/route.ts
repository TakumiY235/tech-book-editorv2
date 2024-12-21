import { withErrorHandling, withValidation } from '../../middleware';
import { UpdateProjectRequest } from '../../../../types/api/projects';
import { updateProjectSchema } from '../../_lib/validation/schemas';
import { 
  handleGetProject, 
  handleUpdateProject, 
  handleDeleteProject 
} from '../../_lib/handlers/projectHandlers';

// エンドポイントハンドラー
export const GET = withErrorHandling(handleGetProject);

export const PUT = withErrorHandling(
  withValidation<UpdateProjectRequest>(updateProjectSchema, handleUpdateProject)
);

export const DELETE = withErrorHandling(handleDeleteProject);