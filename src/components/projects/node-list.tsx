'use client';

import React from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { NodeItem } from './node-item';
import { Node, OrganizedNode } from '@/hooks/useProjectEditor';

interface NodeListItemProps {
  node: OrganizedNode;
  index: number;
  parentIndex?: string;
  selectedNodeId: string | null;
  onSelect: (nodeId: string) => void;
  onDelete: (nodeId: string, e: React.MouseEvent) => void;
  onUpdateTitle: (nodeId: string, newTitle: string) => void;
  onCreateSubsection: (parentId: string) => void;
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
      />
      {node.children.length > 0 && (
        <Droppable droppableId={node.id}>
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
}

export function NodeList({
  organizedNodes,
  selectedNodeId,
  onDragEnd,
  onSelect,
  onDelete,
  onUpdateTitle,
  onCreateSubsection,
}: NodeListProps) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="mt-6 overflow-y-auto">
        {organizedNodes.length === 0 ? (
          <p className="text-gray-500">No content yet. Create your first section above.</p>
        ) : (
          <Droppable droppableId="root">
            {(provided) => (
              <ul
                className="space-y-2"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {organizedNodes.map((node, index) => (
                  <NodeListItem
                    key={node.id}
                    node={node}
                    index={index}
                    selectedNodeId={selectedNodeId}
                    onSelect={onSelect}
                    onDelete={onDelete}
                    onUpdateTitle={onUpdateTitle}
                    onCreateSubsection={onCreateSubsection}
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