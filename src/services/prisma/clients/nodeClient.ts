import { Node, NodeStatus, NodeType, PrismaClient } from '@prisma/client';

export interface NodeOperations {
  findById: (id: string) => Promise<Node | null>;
  findByProjectId: (projectId: string) => Promise<Node[]>;
  findChildren: (parentId: string | null) => Promise<Node[]>;
  findByIdWithParent: (id: string) => Promise<(Node & { parent: Node | null }) | null>;
  create: (data: {
    projectId: string;
    parentId?: string;
    type: NodeType;
    title: string;
    description?: string;
    purpose?: string;
    order: number;
  }) => Promise<Node>;
  updateContent: (id: string, data: {
    content?: string;
    status?: NodeStatus;
    lastEditedBy?: string;
  }) => Promise<Node>;
  updateMetadata: (id: string, data: {
    title?: string;
    description?: string;
    purpose?: string;
    metadata?: any;
  }) => Promise<Node>;
  delete: (id: string) => Promise<Node>;
  deleteWithChildren: (id: string) => Promise<void>;
  reorderNodes: (nodes: { id: string; order: number }[]) => Promise<void>;
}

export const nodeClient = (prisma: PrismaClient): NodeOperations => {
  const operations: NodeOperations = {
    findById: async (id) => {
      return prisma.node.findUnique({
        where: { id }
      });
    },

    findByProjectId: async (projectId) => {
      return prisma.node.findMany({
        where: { projectId },
        orderBy: { order: 'asc' }
      });
    },

    findChildren: async (parentId) => {
      return prisma.node.findMany({
        where: { parentId },
        orderBy: { order: 'asc' }
      });
    },

    findByIdWithParent: async (id) => {
      return prisma.node.findUnique({
        where: { id },
        include: {
          parent: true
        }
      });
    },

    create: async (data) => {
      return prisma.node.create({
        data: {
          ...data,
          status: NodeStatus.draft
        }
      });
    },

    updateContent: async (id, data) => {
      return prisma.node.update({
        where: { id },
        data
      });
    },

    updateMetadata: async (id, data) => {
      return prisma.node.update({
        where: { id },
        data
      });
    },

    delete: async (id) => {
      return prisma.node.delete({
        where: { id }
      });
    },

    deleteWithChildren: async (id) => {
      const node = await prisma.node.findUnique({
        where: { id },
        include: { children: true }
      });

      if (!node) return;

      // 子ノードを再帰的に削除
      if (node.children) {
        await Promise.all(
          node.children.map(child => operations.deleteWithChildren(child.id))
        );
      }

      await prisma.node.delete({
        where: { id }
      });
    },

    reorderNodes: async (nodes) => {
      await Promise.all(
        nodes.map(({ id, order }) =>
          prisma.node.update({
            where: { id },
            data: { order }
          })
        )
      );
    }
  };

  return operations;
};