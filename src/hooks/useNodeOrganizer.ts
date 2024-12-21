import { Project } from '../types/project';
import { useProjectStateManagement } from './core/useStateManagement';

export function useNodeOrganizer(project: Project) {
  const { organizedNodes } = useProjectStateManagement(project);
  
  return {
    organizedNodes,
  };
}