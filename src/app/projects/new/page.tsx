import { CreateProjectForm } from '../../../components/projects/project-management/forms/create-project-form';
import { useRouter } from 'next/navigation';

export default function NewProjectPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create New Project</h1>
      <div className="max-w-md">
        <CreateProjectForm />
      </div>
    </div>
  );
}



export function useProjectCreation() {
  const router = useRouter();

  const createProject = async (name: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      router.refresh();
      router.push('/projects');
      return true;
    } catch (error) {
      console.error('Error creating project:', error);
      return false;
    }
  };

  return { createProject };
}