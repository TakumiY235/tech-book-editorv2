'use client';

import { useEffect, useState } from 'react';
import { ProjectEditor } from './project-editor';

interface Node {
  id: string;
  title: string;
  content: string;
  type: 'section' | 'subsection';
  status: 'draft' | 'in_progress' | 'review' | 'completed';
  order: number;
  parentId: string | null;
  projectId: string;
}

interface Project {
  id: string;
  name: string;
  userId: string;
  nodes: Node[];
}

export default function ProjectPage({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch project');
        }
        const data = await response.json();
        setProject(data);
      } catch (error) {
        setError('Failed to load project');
        console.error('Error loading project:', error);
      }
    };

    fetchProject();
  }, [params.id]);

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!project) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="h-screen p-4">
      <ProjectEditor initialProject={project} />
    </div>
  );
}