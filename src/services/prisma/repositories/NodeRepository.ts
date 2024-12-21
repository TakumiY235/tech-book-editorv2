import { Node, NodeStatus, NodeType, PrismaClient } from '@prisma/client';
import { BaseRepository } from './base/BaseRepository';

type NodeDelegate = PrismaClient['node'];

type NodeWithChildren = Node & {
  children: Node[];
};

type NodeWithParent = Node & {
  parent: Node | null;
};

export class NodeRepository extends BaseRepository<Node, NodeDelegate> {
  protected getDelegate(): NodeDelegate {
    return this.prisma.node;
  }

  async findByProjectId(projectId: string): Promise<NodeWithChildren[]> {
    const delegate = this.getDelegate();
    return delegate.findMany({
      where: { projectId },
      orderBy: {
        order: 'asc',
      },
      include: {
        children: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
  }

  async createNode(data: {
    projectId: string;
    parentId?: string;
    type: NodeType;
    title: string;
    description?: string;
    purpose?: string;
    order: number;
  }): Promise<NodeWithChildren> {
    const delegate = this.getDelegate();
    return delegate.create({
      data: {
        ...data,
        status: NodeStatus.draft,
      },
      include: {
        children: true,
        parent: true,
      },
    });
  }

  async updateContent(
    id: string,
    data: {
      content?: string;
      status?: NodeStatus;
      lastEditedBy?: string;
    }
  ): Promise<Node> {
    const delegate = this.getDelegate();
    return delegate.update({
      where: { id },
      data,
    });
  }

  async updateMetadata(
    id: string,
    data: {
      title?: string;
      description?: string;
      purpose?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<Node> {
    const delegate = this.getDelegate();
    return delegate.update({
      where: { id },
      data,
    });
  }

  async reorderNodes(nodes: { id: string; order: number }[]): Promise<void> {
    const delegate = this.getDelegate();
    await this.prisma.$transaction(
      nodes.map(({ id, order }) =>
        delegate.update({
          where: { id },
          data: { order },
        })
      )
    );
  }

  async findByIdWithChildren(id: string): Promise<NodeWithChildren | null> {
    const delegate = this.getDelegate();
    return delegate.findUnique({
      where: { id },
      include: {
        children: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
  }

  async findByIdWithParent(id: string): Promise<NodeWithParent | null> {
    const delegate = this.getDelegate();
    return delegate.findUnique({
      where: { id },
      include: {
        parent: true,
      },
    });
  }

  async deleteWithChildren(id: string): Promise<void> {
    const delegate = this.getDelegate();
    const node = await this.findByIdWithChildren(id);
    if (!node) return;

    // 子ノードを再帰的に削除
    for (const child of node.children) {
      await this.deleteWithChildren(child.id);
    }

    await delegate.delete({
      where: { id },
    });
  }
}