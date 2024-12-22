import { BookMetadata } from '../../../../types/project';

export interface CreateProjectRequest {
  name: string;
}

export interface UpdateProjectRequest {
  name?: string;
  metadata?: BookMetadata;
}

export interface ProjectResponse {
  id: string;
  name: string;
  userId: string;
  metadata: BookMetadata;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    name: string | null;
  };
  nodes?: Array<{
    id: string;
    title: string;
    type: 'section' | 'subsection';
    order: number;
    parentId: string | null;
  }>;
}