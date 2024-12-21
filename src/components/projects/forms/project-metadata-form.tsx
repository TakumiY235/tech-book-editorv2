'use client';

import { ChangeEvent } from 'react';
import { Input } from '../../ui/input';

interface ProjectMetadataFormProps {
  title: string;
  targetAudience: string;
  overview: string;
  pageCount: number;
  onTitleChange: (value: string) => void;
  onTargetAudienceChange: (value: string) => void;
  onOverviewChange: (value: string) => void;
  onPageCountChange: (value: number) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function ProjectMetadataForm({
  title,
  targetAudience,
  overview,
  pageCount,
  onTitleChange,
  onTargetAudienceChange,
  onOverviewChange,
  onPageCountChange,
  onSave,
  onCancel,
}: ProjectMetadataFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          本のタイトル
        </label>
        <Input
          value={title}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onTitleChange(e.target.value)}
          className="mb-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          対象読者
        </label>
        <Input
          value={targetAudience}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onTargetAudienceChange(e.target.value)}
          className="mb-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          概要
        </label>
        <textarea
          value={overview}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onOverviewChange(e.target.value)}
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
          value={pageCount || ''}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onPageCountChange(parseInt(e.target.value) || 0)}
          className="mb-2"
          min={1}
          step={1}
          placeholder="例: 200"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={onSave}
          className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm"
        >
          保存
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md text-sm"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}