import { useState } from 'react';
import { NodeType, NodeStatus } from '../core/types/node-types';

interface UseEditorMetadataProps {
  initialType: NodeType;
  initialStatus: NodeStatus;
  onMetadataChange?: (type: NodeType, status: NodeStatus) => void;
}

export function useEditorMetadata({
  initialType,
  initialStatus,
  onMetadataChange
}: UseEditorMetadataProps) {
  const [type, setType] = useState<NodeType>(initialType);
  const [status, setStatus] = useState<NodeStatus>(initialStatus);

  const updateType = (newType: NodeType) => {
    setType(newType);
    onMetadataChange?.(newType, status);
  };

  const updateStatus = (newStatus: NodeStatus) => {
    setStatus(newStatus);
    onMetadataChange?.(type, newStatus);
  };

  return {
    type,
    status,
    updateType,
    updateStatus
  };
}