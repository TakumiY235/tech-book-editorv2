import { useRouter } from 'next/navigation';

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