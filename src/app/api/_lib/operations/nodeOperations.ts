import { getRepositories } from '../../../../services/prisma/repositories';

/**
 * 指定されたノードとその子ノードを再帰的に削除する
 * @param projectId プロジェクトID
 * @param nodeId 削除対象のノードID
 */
export async function deleteNodeAndChildren(projectId: string, nodeId: string) {
  const { nodeRepository } = getRepositories();

  // プロジェクトに属するすべてのノードを取得
  const nodes = await nodeRepository.findByProjectId(projectId);

  // 削除対象のノードの子ノードを特定
  const childNodes = nodes.filter(node => node.parentId === nodeId);

  // 子ノードを再帰的に削除
  for (const child of childNodes) {
    await deleteNodeAndChildren(projectId, child.id);
  }

  // ノード自体を削除
  await nodeRepository.delete(nodeId);
}

/**
 * ノードの順序を更新する
 * @param projectId プロジェクトID
 * @param parentId 親ノードID（ルートノードの場合はnull）
 * @param nodeIds 更新後の順序でのノードIDの配列
 */
export async function updateNodesOrder(
  projectId: string,
  parentId: string | null,
  nodeIds: string[]
) {
  const { nodeRepository } = getRepositories();

  // 指定された順序でノードを更新
  for (let i = 0; i < nodeIds.length; i++) {
    await nodeRepository.update(nodeIds[i], {
      order: i,
      parentId: parentId,
    });
  }
}

/**
 * ノードの型変換を行う
 * @param dbNode データベースから取得したノード
 * @returns 変換後のノード
 */
export function transformNode(dbNode: any) {
  return {
    id: dbNode.id,
    title: dbNode.title,
    content: dbNode.content || '',
    description: dbNode.description || '',
    purpose: dbNode.purpose || '',
    type: dbNode.type,
    status: dbNode.status,
    order: dbNode.order,
    parentId: dbNode.parentId,
    n_pages: dbNode.n_pages,
    should_split: dbNode.should_split,
  };
}