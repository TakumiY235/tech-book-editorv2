'use client';

import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Button } from '../ui/button';
import { Node } from '@/hooks/useProjectEditor';

interface NodeItemProps {
  node: Node;
  index: number;
  parentIndex?: string;
  selectedNodeId: string | null;
  onSelect: (nodeId: string) => void;
  onDelete: (nodeId: string, e: React.MouseEvent) => void;
  onUpdateTitle: (nodeId: string, newTitle: string) => void;
  onCreateSubsection: (parentId: string) => void;
}

export function NodeItem({
  node,
  index,
  parentIndex,
  selectedNodeId,
  onSelect,
  onDelete,
  onUpdateTitle,
  onCreateSubsection,
}: NodeItemProps) {
  return (
    <Draggable draggableId={node.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <div
            className={`p-2 rounded cursor-pointer ${
              selectedNodeId === node.id
                ? 'bg-blue-100 hover:bg-blue-200'
                : 'hover:bg-gray-100'
            }`}
            onClick={() => onSelect(node.id)}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <span className="text-gray-500 mr-2">
                    {parentIndex ? `${parentIndex}.${index + 1}` : `${index + 1}`}
                  </span>
                  <input
                    className="flex-1 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1"
                    value={node.title}
                    onChange={(e) => onUpdateTitle(node.id, e.target.value)}
                  />
                  <span className="text-xs text-gray-500 px-2 py-1 bg-gray-200 rounded ml-2">
                    {node.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {(node.type === 'section' || node.type === 'subsection') && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreateSubsection(node.id);
                      }}
                    >
                      Add sub
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-800"
                    onClick={(e) => onDelete(node.id, e)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
              <div className="pl-6 space-y-2 text-sm mt-2">
                <div>
                  <span className="font-medium">Description:</span>
                  <p className="text-gray-600">{node.description}</p>
                </div>
                <div>
                  <span className="font-medium">Purpose:</span>
                  <p className="text-gray-600">{node.purpose}</p>
                </div>
                <div className="flex gap-4">
                  <div>
                    <span className="font-medium">Pages:</span>
                    <span className="ml-1 text-gray-600">{node.n_pages || 'Not set'}</span>
                  </div>
                  <div>
                    <span className="font-medium">Split:</span>
                    <span className="ml-1 text-gray-600">{node.should_split ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}