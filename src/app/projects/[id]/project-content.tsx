'use client';

import { useState, useCallback, useRef } from 'react';
import { NodeEditorHandle } from '../../../components/editor/editor-types';
import { NodeEditor } from '@/components/projects/node-editor';
import { Button } from '@/components/ui/button';
import { BookNode } from '@/hooks/types';

interface BookMetadata {
  title: string;
  targetAudience: string;
}

interface ProjectContentProps {
  projectId: string;
  selectedNode: BookNode | null;
  bookMetadata?: BookMetadata;
  onGenerateContent?: (nodeId: string, bookTitle: string, targetAudience: string) => Promise<boolean>;
}

type NodeType = BookNode['type'];
type NodeStatus = BookNode['status'];

export function ProjectContent({
  projectId,
  selectedNode,
  bookMetadata,
  onGenerateContent
}: ProjectContentProps) {
  const [isEditing, setIsEditing] = useState(true);
  const editorRef = useRef<NodeEditorHandle>(null);
  const [nodeType, setNodeType] = useState<NodeType>(selectedNode?.type || 'section');
  const [nodeStatus, setNodeStatus] = useState<NodeStatus>(selectedNode?.status || 'draft');

  const updateNodeMetadata = useCallback(async (type: NodeType, status: NodeStatus) => {
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
          onClick={async () => {
            if (isEditing) {
              // プレビューモードに切り替える前に保存を実行
              const currentContent = editorRef.current?.getContent();
              if (!currentContent) {
                console.error('Failed to get editor content');
                return;
              }

              try {
                const response = await fetch(`/api/projects/${projectId}/nodes/${selectedNode.id}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ content: currentContent }),
                });
                
                if (!response.ok) {
                  throw new Error('Failed to save content');
                }
              } catch (error) {
                console.error('Error saving content:', error);
                return; // 保存に失敗した場合は切り替えない
              }
            }
            setIsEditing(!isEditing);
          }}
          variant="outline"
          size="sm"
        >
          {isEditing ? 'Preview' : 'Edit'}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={selectedNode.description}
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            rows={2}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Purpose
          </label>
          <textarea
            value={selectedNode.purpose}
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            rows={2}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pages
          </label>
          <input
            type="number"
            value={selectedNode.n_pages}
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Split Required
          </label>
          <input
            type="checkbox"
            checked={selectedNode.should_split}
            readOnly
            className="mt-3 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            value={nodeType}
            onChange={(e) => {
              const newType = e.target.value as NodeType;
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
              const newStatus = e.target.value as NodeStatus;
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

      <div>
        <NodeEditor
          ref={editorRef}
          initialContent={selectedNode.content || ''}
          projectId={projectId}
          nodeId={selectedNode.id}
          node={selectedNode}
          bookTitle={bookMetadata?.title}
          targetAudience={bookMetadata?.targetAudience}
          onGenerateContent={onGenerateContent ? ((nodeId: string, bookTitle: string, targetAudience: string) => {
            console.log('ProjectContent: onGenerateContent called with args:', { nodeId, bookTitle, targetAudience });
            console.log('ProjectContent: onGenerateContent function exists:', true);
            return onGenerateContent(nodeId, bookTitle, targetAudience);
          }) : undefined}
        />
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: selectedNode.content || '' }}
          style={{ display: isEditing ? 'none' : 'block' }}
        />
      </div>
    </div>
  );
}