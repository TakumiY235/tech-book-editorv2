import { Project, PrismaClient } from '@prisma/client';
import { BaseRepository } from './base/BaseRepository';

type ProjectDelegate = PrismaClient['project'];

export class ProjectRepository extends BaseRepository<Project, ProjectDelegate> {
  protected getDelegate(): ProjectDelegate {
    return this.prisma.project;
  }

  async findByUserId(userId: string): Promise<Project[]> {
    const delegate = this.getDelegate();
    return delegate.findMany({
      where: { userId },
      include: {
        user: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async createWithUser(data: { name: string; userId: string }): Promise<Project> {
    const delegate = this.getDelegate();
    return delegate.create({
      data: {
        name: data.name,
        userId: data.userId,
      },
      include: {
        user: true,
      },
    });
  }

  async findByIdWithDetails(id: string): Promise<Project | null> {
    const delegate = this.getDelegate();
    return delegate.findUnique({
      where: { id },
      include: {
        user: true,
        nodes: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
  }

  async updateMetadata(id: string, metadata: Record<string, any>): Promise<Project> {
    const delegate = this.getDelegate();
    return delegate.update({
      where: { id },
      data: {
        metadata,
      },
    });
  }
}