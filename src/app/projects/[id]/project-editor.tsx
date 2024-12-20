'use client';

import React, { useState, ChangeEvent, useEffect } from 'react';
import { CreateNodeForm } from '@/components/projects/create-node-form';
import { ProjectContent } from './project-content';
import { NodeList } from '@/components/projects/node-list';
import { useProjectEditor } from '@/hooks/useProjectEditor';
import { Project } from '@/hooks/types';
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
    generateStructureWithAI,
    generateSubsectionStructure,
  } = useProjectEditor(initialProject);

  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editedTitle, setEditedTitle] = useState(project.name);
  const [editedTargetAudience, setEditedTargetAudience] = useState(project.metadata?.targetAudience || '');
  const [editedOverview, setEditedOverview] = useState(project.metadata?.overview || '');
  const [editedPageCount, setEditedPageCount] = useState(project.metadata?.pageCount || 0);

  // For debugging
  useEffect(() => {
    console.log('Organized nodes:', organizedNodes);
  }, [organizedNodes]);

  const handleGenerateStructure = async () => {
    if (!project.name || !project.metadata?.targetAudience || !project.metadata?.overview || !project.metadata?.pageCount) {
      alert('本のタイトル、対象読者、概要、ページ数を入力してください。');
      return;
    }

    setIsGenerating(true);
    try {
      await generateStructureWithAI({
        title: project.name,
        overview: project.metadata.overview,
        targetAudience: project.metadata.targetAudience,
        pageCount: project.metadata.pageCount
      });
    } catch (error) {
      console.error('Error generating structure:', error);
      alert('章立ての生成に失敗しました。');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveMetadata = () => {
    handleUpdateProjectMetadata({
      name: editedTitle,
      targetAudience: editedTargetAudience,
      metadata: {
        overview: editedOverview,
        pageCount: editedPageCount
      }
    });
    setIsEditing(false);
  };

  return (
    <div className="h-full flex overflow-hidden">
      <div className="w-1/3 border-r border-gray-200 p-4 bg-gray-50 flex flex-col h-full">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    概要
                  </label>
                  <textarea
                    value={editedOverview}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setEditedOverview(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 mb-2"
                    rows={4}
                    placeholder="本の概要を入力してください"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ページ数
                  </label>
                  <Input
                    type="number"
                    value={editedPageCount || ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEditedPageCount(parseInt(e.target.value) || 0)}
                    className="mb-2"
                    min={1}
                    step={1}
                    placeholder="例: 200"
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
              <div className="space-y-2">
                <h2 className="text-xl font-bold">{project.name}</h2>
                {project.metadata?.targetAudience && (
                  <p className="text-sm text-gray-600">
                    対象読者: {project.metadata.targetAudience}
                  </p>
                )}
                {project.metadata?.overview && (
                  <p className="text-sm text-gray-600">
                    概要: {project.metadata.overview}
                  </p>
                )}
                {project.metadata?.pageCount && (
                  <p className="text-sm text-gray-600">
                    ページ数: {project.metadata.pageCount}ページ
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
            <button
              onClick={handleGenerateStructure}
              disabled={isGenerating}
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md font-semibold text-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'AI編集者が章立てを考えています...' : 'AIで章立てを生成'}
            </button>
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
          onGenerateSubsections={generateSubsectionStructure}
        />
      </div>
      <div className="w-2/3 p-4 overflow-y-auto h-full">
        <ProjectContent
          projectId={project.id}
          selectedNode={selectedNode || null}
          onGenerateContent={(...args) => {
            console.log('ProjectEditor: generateContent called with args:', args);
            console.log('ProjectEditor: generateContent exists:', !!generateContent);
            console.log('ProjectEditor: project metadata:', {
              title: project.name,
              targetAudience: project.metadata?.targetAudience
            });
            return generateContent(...args);
          }}
          bookMetadata={{
            title: project.name,
            targetAudience: project.metadata?.targetAudience || ''
          }}
        />
      </div>
    </div>
  );
}