import { Node as PrismaNode } from '@prisma/client';
import { db } from '../../../../services/prisma/clients';

export async function deleteNodeAndChildren(projectId: string, nodeId: string) {
  // プロジェクトに属するすべてのノードを取得
  const nodes = await db.node.findByProjectId(projectId);
  
  // 指定されたノードとその子ノードを削除
  await db.node.deleteWithChildren(nodeId);
}

export async function reorderNodes(nodeIds: string[]) {
  const nodes = nodeIds.map((id, index) => ({
    id,
    order: index
  }));
  
  await db.node.reorderNodes(nodes);
}

export function transformNode(node: PrismaNode) {
  return {
    ...node,
    metadata: node.metadata || {},
  };
}