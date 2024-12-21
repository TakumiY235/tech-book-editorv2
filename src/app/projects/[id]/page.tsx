'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ProjectLayout } from './project-layout';
import { Project } from '@/types/project';

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch project');
        }
        const { data } = await response.json();
        console.log('Fetched project data:', data);
        setProject(data);
      } catch (error) {
        setError('Failed to load project');
        console.error('Error loading project:', error);
      }
    };

    fetchProject();
  }, [projectId]);

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!project) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="h-screen p-4">
      <ProjectLayout initialProject={project} />
    </div>
  );
}