'use client';

import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Button } from '../../ui/button';
import { BookNode } from '../../../types/project';

interface NodeItemProps {
  node: BookNode;
  index: number;
  parentIndex?: string;
  selectedNodeId: string | null;
  onSelect: (nodeId: string) => void;
  onDelete: (nodeId: string, e: React.MouseEvent) => void;
  onUpdateTitle: (nodeId: string, newTitle: string) => void;
  onCreateSubsection: (parentId: string) => void;
  onGenerateSubsections?: (nodeId: string) => void;
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
  onGenerateSubsections,
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
                </div>
                <div className="flex items-center gap-2">
                  {(node.type === 'section' || node.type === 'subsection') && (
                    <>
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
                      {onGenerateSubsections && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            onGenerateSubsections(node.id);
                          }}
                        >
                          {(
                            <>
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              <span>AI分節化</span>
                            </>
                          )}
                        </Button>
                      )}
                    </>
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
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}