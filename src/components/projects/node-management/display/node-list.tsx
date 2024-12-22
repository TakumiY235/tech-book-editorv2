'use client';

import React from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { NodeItem } from './node-item';
import { OrganizedNode } from '@/types/project';

interface NodeListItemProps {
  node: OrganizedNode;
  index: number;
  parentIndex?: string;
  selectedNodeId: string | null;
  onSelect: (nodeId: string) => void;
  onDelete: (nodeId: string, e: React.MouseEvent) => void;
  onUpdateTitle: (nodeId: string, newTitle: string) => void;
  onCreateSubsection: (parentId: string) => void;
  onGenerateSubsections?: (nodeId: string) => void;
}

function NodeListItem({
  node,
  index,
  parentIndex,
  selectedNodeId,
  onSelect,
  onDelete,
  onUpdateTitle,
  onCreateSubsection,
  onGenerateSubsections,
}: NodeListItemProps) {
  return (
    <li className="space-y-2">
      <NodeItem
        node={node}
        index={index}
        parentIndex={parentIndex}
        selectedNodeId={selectedNodeId}
        onSelect={onSelect}
        onDelete={onDelete}
        onUpdateTitle={onUpdateTitle}
        onCreateSubsection={onCreateSubsection}
        onGenerateSubsections={onGenerateSubsections}
      />
      {node.children.length > 0 && (
        <Droppable droppableId={node.id} isDropDisabled={false} isCombineEnabled={false} ignoreContainerClipping={false}>
          {(provided) => (
            <ul
              className="ml-4 space-y-2 border-l border-gray-200"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {node.children.map((child, childIndex) => (
                <NodeListItem
                  key={child.id}
                  node={child}
                  index={childIndex}
                  parentIndex={parentIndex ? `${parentIndex}.${index + 1}` : `${index + 1}`}
                  selectedNodeId={selectedNodeId}
                  onSelect={onSelect}
                  onDelete={onDelete}
                  onUpdateTitle={onUpdateTitle}
                  onCreateSubsection={onCreateSubsection}
                  onGenerateSubsections={onGenerateSubsections}
                />
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      )}
    </li>
  );
}

interface NodeListProps {
  organizedNodes: OrganizedNode[];
  selectedNodeId: string | null;
  onDragEnd: (result: DropResult) => void;
  onSelect: (nodeId: string) => void;
  onDelete: (nodeId: string, e: React.MouseEvent) => void;
  onUpdateTitle: (nodeId: string, newTitle: string) => void;
  onCreateSubsection: (parentId: string) => void;
  onGenerateSubsections?: (nodeId: string) => void;
}

export function NodeList({
  organizedNodes,
  selectedNodeId,
  onDragEnd,
  onSelect,
  onDelete,
  onUpdateTitle,
  onCreateSubsection,
  onGenerateSubsections,
}: NodeListProps) {
  const organizeNodesHierarchically = (nodes: OrganizedNode[]): OrganizedNode[] => {
    // ノードをIDでマップ化
    const nodeMap = new Map<string, OrganizedNode>();
    nodes.forEach(node => {
      nodeMap.set(node.id, { ...node, children: [] });
    });

    // 親子関係を構築
    const rootNodes: OrganizedNode[] = [];
    nodes.forEach(node => {
      const organizedNode = nodeMap.get(node.id)!;
      
      // parentIdがある場合は親ノードの子として追加
      if (node.parentId && nodeMap.has(node.parentId)) {
        const parentNode = nodeMap.get(node.parentId)!;
        parentNode.children.push(organizedNode);
      } else {
        // parentIdがない、または親ノードが見つからない場合はルートノードとして扱う
        rootNodes.push(organizedNode);
      }
    });

    return rootNodes;
  };

  const hierarchicalNodes = organizeNodesHierarchically(organizedNodes);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="mt-6 overflow-y-auto flex-1">
        {hierarchicalNodes.length === 0 ? (
          <p className="text-gray-500">No content yet. Create your first section above.</p>
        ) : (
          <Droppable droppableId="root" isDropDisabled={false} isCombineEnabled={false} ignoreContainerClipping={false}>
            {(provided) => (
              <ul
                className="space-y-2"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {hierarchicalNodes.map((node, index) => (
                  <NodeListItem
                    key={node.id}
                    node={node}
                    index={index}
                    selectedNodeId={selectedNodeId}
                    onSelect={onSelect}
                    onDelete={onDelete}
                    onUpdateTitle={onUpdateTitle}
                    onCreateSubsection={onCreateSubsection}
                    onGenerateSubsections={onGenerateSubsections}
                  />
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        )}
      </div>
    </DragDropContext>
  );
}