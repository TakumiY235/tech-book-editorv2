export interface CreateProjectRequest {
  name: string;
}

export interface UpdateProjectRequest {
  name?: string;
  metadata?: Record<string, any>;
}

export interface ProjectResponse {
  id: string;
  name: string;
  userId: string;
  metadata: Record<string, any>;
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