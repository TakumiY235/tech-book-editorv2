'use client';

import React, { useState, ChangeEvent } from 'react';
import { CreateNodeForm } from '@/components/projects/create-node-form';
import { ProjectContent } from './project-content';
import { NodeList } from '@/components/projects/node-list';
import { useProjectEditor, type Project } from '@/hooks/useProjectEditor';
import { Input } from '@/components/ui/input';

interface ProjectEditorProps {
  initialProject: Project;
}

export function ProjectEditor({ initialProject }: ProjectEditorProps) {
  const {
    project,
    selectedNode,
    selectedNodeId,
    organizedNodes,
    setSelectedNodeId,
    handleNodeCreated,
    onDragEnd,
    handleDeleteNode,
    handleUpdateNodeTitle,
    handleCreateSubsection,
    generateContent,
    handleUpdateProjectMetadata,
  } = useProjectEditor(initialProject);

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(project.name);
  const [editedTargetAudience, setEditedTargetAudience] = useState(project.metadata?.targetAudience || '');

  const handleSaveMetadata = () => {
    handleUpdateProjectMetadata({
      name: editedTitle,
      targetAudience: editedTargetAudience
    });
    setIsEditing(false);
  };

  return (
    <div className="h-full flex">
      <div className="w-1/3 border-r border-gray-200 p-4 bg-gray-50">
        <div className="mb-4">
          <div className="space-y-4 mb-4">
            {isEditing ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    本のタイトル
                  </label>
                  <Input
                    value={editedTitle}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEditedTitle(e.target.value)}
                    className="mb-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    対象読者
                  </label>
                  <Input
                    value={editedTargetAudience}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEditedTargetAudience(e.target.value)}
                    className="mb-2"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveMetadata}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md text-sm"
                  >
                    キャンセル
                  </button>
                </div>
              </>
            ) : (
              <div>
                <h2 className="text-xl font-bold">{project.name}</h2>
                {project.metadata?.targetAudience && (
                  <p className="text-sm text-gray-600 mt-1">
                    対象読者: {project.metadata.targetAudience}
                  </p>
                )}
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-2 px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm"
                >
                  編集
                </button>
              </div>
            )}
          </div>
          <div className="flex gap-2 mb-4">
            <CreateNodeForm
              projectId={project.id}
              nodes={project.nodes}
              onSuccess={handleNodeCreated}
              initialTitle="New section"
              skipModal={true}
            />
            <input
              type="file"
              accept=".yaml,.yml"
              onChange={async (e: ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (file) {
                  try {
                    const text = await file.text();
                    const response = await fetch(`/api/projects/${project.id}/import`, {
                      method: 'POST',
                      body: text,
                    });
                    if (!response.ok) {
                      throw new Error('Failed to import YAML');
                    }
                    handleNodeCreated();
                  } catch (error) {
                    console.error('Error importing YAML:', error);
                    alert('Failed to import YAML file');
                  }
                }
              }}
              className="hidden"
              id="yaml-import"
            />
            <label
              htmlFor="yaml-import"
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150 cursor-pointer"
            >
              Import YAML
            </label>
          </div>
        </div>
        <NodeList
          organizedNodes={organizedNodes}
          selectedNodeId={selectedNodeId}
          onDragEnd={onDragEnd}
          onSelect={setSelectedNodeId}
          onDelete={handleDeleteNode}
          onUpdateTitle={handleUpdateNodeTitle}
          onCreateSubsection={handleCreateSubsection}
        />
      </div>
      <div className="w-2/3 p-4">
        <ProjectContent
          projectId={project.id}
          selectedNode={selectedNode || null}
          onGenerateContent={generateContent}
          bookMetadata={{
            title: project.name,
            targetAudience: project.metadata?.targetAudience || ''
          }}
        />
      </div>
    </div>
  );
}