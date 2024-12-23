import { Project, PrismaClient, User, Node, Prisma } from '@prisma/client';

export interface ProjectOperations {
  findById: (id: string) => Promise<Project | null>;
  findByUserId: (userId: string) => Promise<Project[]>;
  findByIdWithDetails: (id: string) => Promise<(Project & {
    user: Pick<User, 'id' | 'name' | 'email'>;
    nodes: Node[];
  }) | null>;
  create: (data: {
    name: string;
    userId: string;
  }) => Promise<Project>;
  updateMetadata: (id: string, metadata: Prisma.InputJsonValue) => Promise<Project>;
  delete: (id: string) => Promise<Project>;
}

export const projectClient = (prisma: PrismaClient): ProjectOperations => ({
  findById: async (id) => {
    return prisma.project.findUnique({
      where: { id }
    });
  },

  findByUserId: async (userId) => {
    return prisma.project.findMany({
      where: { userId },
      include: {
        user: true
      },
      orderBy: {
        name: 'asc'
      }
    });
  },

  findByIdWithDetails: async (id) => {
    return prisma.project.findUnique({
      where: { id },
      include: {
        user: true,
        nodes: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });
  },

  create: async (data) => {
    return prisma.project.create({
      data: {
        name: data.name,
        userId: data.userId
      },
      include: {
        user: true
      }
    });
  },

  updateMetadata: async (id, metadata) => {
    return prisma.project.update({
      where: { id },
      data: {
        metadata
      }
    });
  },

  delete: async (id) => {
    return prisma.project.delete({
      where: { id }
    });
  }
});