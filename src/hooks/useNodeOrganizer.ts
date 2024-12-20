import { useMemo } from 'react';
import { Project, BookNode, OrganizedNode } from './types';

export function useNodeOrganizer(project: Project) {
  const organizedNodes = useMemo(() => {
    if (!project?.nodes?.length) {
      return [];
    }

    const nodeMap = new Map<string, BookNode>();
    project.nodes.forEach((node) => {
      nodeMap.set(node.id, node);
    });

    const rootNodes: OrganizedNode[] = [];
    const childrenMap = new Map<string, OrganizedNode[]>();

    // Initialize the children arrays
    project.nodes.forEach((node) => {
      childrenMap.set(node.id, []);
    });

    // Organize nodes into parent-child relationships
    project.nodes.forEach((node) => {
      const organizedNode: OrganizedNode = {
        ...node,
        children: childrenMap.get(node.id) || [],
      };

      if (node.parentId) {
        const parentChildren = childrenMap.get(node.parentId);
        if (parentChildren) {
          parentChildren.push(organizedNode);
          childrenMap.set(node.parentId, parentChildren);
        }
      } else {
        rootNodes.push(organizedNode);
      }
    });

    // Sort children by order
    childrenMap.forEach((children) => {
      children.sort((a, b) => a.order - b.order);
    });

    // Sort root nodes by order
    rootNodes.sort((a, b) => a.order - b.order);

    return rootNodes;
  }, [project?.nodes]);

  return {
    organizedNodes,
  };
}