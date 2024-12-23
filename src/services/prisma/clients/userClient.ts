import { User, PrismaClient, Project } from '@prisma/client';

export interface UserOperations {
  findById: (id: string) => Promise<User | null>;
  findByEmail: (email: string) => Promise<User | null>;
  findByIdWithProjects: (id: string) => Promise<(User & {
    projects: Project[];
  }) | null>;
  findOrCreateDevUser: () => Promise<User>;
}

export const userClient = (prisma: PrismaClient): UserOperations => ({
  findById: async (id) => {
    return prisma.user.findUnique({
      where: { id }
    });
  },

  findByEmail: async (email) => {
    return prisma.user.findUnique({
      where: { email }
    });
  },

  findByIdWithProjects: async (id) => {
    return prisma.user.findUnique({
      where: { id },
      include: {
        projects: {
          orderBy: {
            name: 'asc'
          }
        }
      }
    });
  },

  findOrCreateDevUser: async () => {
    return prisma.user.upsert({
      where: {
        email: 'dev@example.com'
      },
      update: {},
      create: {
        email: 'dev@example.com',
        name: 'Developer'
      }
    });
  }
});