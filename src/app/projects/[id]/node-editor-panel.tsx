'use client';

import { useState, useRef } from 'react';
import { NodeEditorHandle } from '@/components/editor/core/types/editor-types';
import { NodeEditor } from '@/components/projects/editor/node-editor';
import { NodeMetadataForm } from '@/components/projects/forms/node-metadata-form';
import { Button } from '@/components/ui/button';
import { BookNode } from '@/types/project';
import { useNodeMetadata } from '@/hooks/useNodeMetadata';

interface BookMetadata {
  title: string;
  targetAudience: string;
}

interface NodeEditorPanelProps {
  projectId: string;
  selectedNode: BookNode | null;
  bookMetadata?: BookMetadata;
  onGenerateContent?: (nodeId: string, bookTitle: string, targetAudience: string) => Promise<boolean>;
}

type NodeType = BookNode['type'];
type NodeStatus = BookNode['status'];

export function NodeEditorPanel({
  projectId,
  selectedNode,
  bookMetadata,
  onGenerateContent
}: NodeEditorPanelProps) {
  const [isEditing, setIsEditing] = useState(true);
  const editorRef = useRef<NodeEditorHandle>(null);
  const [nodeType, setNodeType] = useState<NodeType>(selectedNode?.type || 'section');
  const [nodeStatus, setNodeStatus] = useState<NodeStatus>(selectedNode?.status || 'draft');
  const { updateNodeMetadata, updateNodeContent } = useNodeMetadata(projectId, selectedNode?.id ?? null);

  if (!selectedNode) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Select a section to edit or create a new one
      </div>
    );
  }

  return (
    <div className="h-full space-y-6">
      {/* Mode Toggle Button */}
      <div className="flex justify-end mb-4">
        <Button
          onClick={async () => {
            if (isEditing) {
              // Save content before switching to preview mode
              const currentContent = editorRef.current?.getContent();
              if (!currentContent) {
                console.error('Failed to get editor content');
                return;
              }

              const success = await updateNodeContent(currentContent);
              if (!success) {
                return; // Don't switch if save failed
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

      {/* Header */}
      {isEditing && (
        <header className="flex items-center">
          <h3 className="text-lg font-semibold">{selectedNode.title}</h3>
        </header>
      )}

      {/* Metadata Form */}
      {isEditing && (
        <NodeMetadataForm
          node={selectedNode}
          nodeType={nodeType}
          nodeStatus={nodeStatus}
          onTypeChange={(type) => {
            setNodeType(type);
            setTimeout(() => updateNodeMetadata(type, nodeStatus), 0);
          }}
          onStatusChange={(status) => {
            setNodeStatus(status);
            setTimeout(() => updateNodeMetadata(nodeType, status), 0);
          }}
        />
      )}

      {/* Editor/Preview */}
      <div>
        <NodeEditor
          ref={editorRef}
          initialContent={selectedNode.content || ''}
          projectId={projectId}
          nodeId={selectedNode.id}
          node={selectedNode}
          bookTitle={bookMetadata?.title}
          targetAudience={bookMetadata?.targetAudience}
          isEditing={isEditing}
          onGenerateContent={onGenerateContent ? ((nodeId: string, bookTitle: string, targetAudience: string) => {
            console.log('NodeEditorPanel: onGenerateContent called with args:', { nodeId, bookTitle, targetAudience });
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