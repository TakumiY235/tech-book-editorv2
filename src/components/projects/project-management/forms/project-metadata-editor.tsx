'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import { Input } from '../../../ui/input';
import { Project } from '../../../../types/project';

interface ProjectMetadataEditorProps {
  project: Project;
  onUpdateMetadata: (updates: {
    name?: string;
    metadata?: {
      title: string;
      overview: string;
      targetAudience: string;
      pageCount: number;
    };
  }) => void;
}

export function ProjectMetadataEditor({ project, onUpdateMetadata }: ProjectMetadataEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(project.metadata?.title || project.name);
  const [editedTargetAudience, setEditedTargetAudience] = useState(project.metadata?.targetAudience || '');
  const [editedOverview, setEditedOverview] = useState(project.metadata?.overview || '');
  const [editedPageCount, setEditedPageCount] = useState(project.metadata?.pageCount || 0);

  // Ensure metadata is properly initialized
  useEffect(() => {
    if (!project.metadata) {
      onUpdateMetadata({
        name: project.name,
        metadata: {
          title: project.name,
          overview: '',
          targetAudience: '',
          pageCount: 0
        }
      });
    }
  }, [project.metadata, project.name]);

  const handleSaveMetadata = () => {
    onUpdateMetadata({
      name: editedTitle,
      metadata: {
        title: editedTitle,
        overview: editedOverview,
        targetAudience: editedTargetAudience,
        pageCount: editedPageCount
      }
    });
    setIsEditing(false);
  };

  return (
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
  );
}