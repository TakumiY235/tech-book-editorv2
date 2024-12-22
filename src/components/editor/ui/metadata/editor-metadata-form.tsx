'use client';

import { NodeType, NodeStatus, EditorNode } from '../../core/types/node-types';

interface EditorMetadataFormProps {
  node: EditorNode;
  nodeType: NodeType;
  nodeStatus: NodeStatus;
  onTypeChange: (type: NodeType) => void;
  onStatusChange: (status: NodeStatus) => void;
}

export function EditorMetadataForm({
  node,
  nodeType,
  nodeStatus,
  onTypeChange,
  onStatusChange,
}: EditorMetadataFormProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <h3 className="text-lg font-semibold">{node.title}</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            value={nodeType}
            onChange={(e) => onTypeChange(e.target.value as NodeType)}
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
            onChange={(e) => onStatusChange(e.target.value as NodeStatus)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="draft">Draft</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
    </div>
  );
}