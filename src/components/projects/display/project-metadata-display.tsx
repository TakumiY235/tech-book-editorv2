'use client';

interface ProjectMetadata {
  name: string;
  targetAudience?: string;
  overview?: string;
  pageCount?: number;
}

interface ProjectMetadataDisplayProps {
  metadata: ProjectMetadata;
  onEdit: () => void;
}

export function ProjectMetadataDisplay({ metadata, onEdit }: ProjectMetadataDisplayProps) {
  return (
    <div className="space-y-2">
      <h2 className="text-xl font-bold">{metadata.name}</h2>
      {metadata.targetAudience && (
        <p className="text-sm text-gray-600">
          対象読者: {metadata.targetAudience}
        </p>
      )}
      {metadata.overview && (
        <p className="text-sm text-gray-600">
          概要: {metadata.overview}
        </p>
      )}
      {metadata.pageCount && (
        <p className="text-sm text-gray-600">
          ページ数: {metadata.pageCount}ページ
        </p>
      )}
      <button
        onClick={onEdit}
        className="mt-2 px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm"
      >
        編集
      </button>
    </div>
  );
}