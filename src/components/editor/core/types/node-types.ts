import { NodeStatus, NodeType } from '@prisma/client';
export type { Node } from '../../../../types/project';
export type { NodeStatus, NodeType } from '@prisma/client';

export interface NodeMetadata {
  type: NodeType;
  status: NodeStatus;
}