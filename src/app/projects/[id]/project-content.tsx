'use client';

import { useState, useCallback } from 'react';
import { NodeEditor } from '@/components/projects/node-editor';
import { Button } from '@/components/ui/button';

interface Node {
  id: string;
  title: string;
  content: string;
  type: 'section' | 'subsection';
  status: 'draft' | 'in_progress' | 'review' | 'completed';
  order: number;
  description?: string;
  purpose?: string;
  n_pages: number;
  should_split: boolean;
}

interface BookMetadata {
  title: string;
  targetAudience: string;
}

interface ProjectContentProps {
  projectId: string;
  selectedNode: Node | null;
  bookMetadata?: BookMetadata;
  onGenerateContent?: (nodeId: string, bookTitle: string, targetAudience: string) => Promise<boolean>;
}

export function ProjectContent({
  projectId,
  selectedNode,
  bookMetadata,
  onGenerateContent
}: ProjectContentProps) {
  const [isEditing, setIsEditing] = useState(true);
  const [nodeType, setNodeType] = useState(selectedNode?.type || 'section');
  const [nodeStatus, setNodeStatus] = useState(selectedNode?.status || 'draft');

  const updateNodeMetadata = useCallback(async (type: string, status: string) => {
    if (!selectedNode) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/nodes/${selectedNode.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          status,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update node metadata');
      }
    } catch (error) {
      console.error('Error updating node metadata:', error);
    }
  }, [projectId, selectedNode]);

  if (!selectedNode) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Select a section to edit or create a new one
      </div>
    );
  }

  return (
    <div className="h-full space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{selectedNode.title}</h3>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant="outline"
          size="sm"
        >
          {isEditing ? 'Preview' : 'Edit'}
        </Button>
      </div>

      <div className="flex space-x-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            value={nodeType}
            onChange={(e) => {
              const newType = e.target.value as 'section' | 'subsection';
              setNodeType(newType);
              setTimeout(() => updateNodeMetadata(newType, nodeStatus), 0);
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="section">Section</option>
            <option value="subsection">Subsection</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={nodeStatus}
            onChange={(e) => {
              const newStatus = e.target.value as 'draft' | 'in_progress' | 'review' | 'completed';
              setNodeStatus(newStatus);
              setTimeout(() => updateNodeMetadata(nodeType, newStatus), 0);
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="draft">Draft</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div key={selectedNode.id}>
        {isEditing ? (
          <NodeEditor
            initialContent={selectedNode.content || ''}
            projectId={projectId}
            nodeId={selectedNode.id}
            bookTitle={bookMetadata?.title}
            targetAudience={bookMetadata?.targetAudience}
            onGenerateContent={onGenerateContent}
          />
        ) : (
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: selectedNode.content || '' }}
          />
        )}
      </div>
    </div>
  );
}