import { prisma } from '../prisma/db';

interface CreateProjectInput {
  name: string;
  userId: string;
}

export async function createProject(input: CreateProjectInput) {
  return await prisma.project.create({
    data: {
      name: input.name,
      userId: input.userId
    }
  });
}

export async function getProjects(userId: string) {
  return await prisma.project.findMany({
    where: {
      userId
    },
    include: {
      user: true
    }
  });
}

export async function getProject(id: string) {
  return await prisma.project.findUnique({
    where: {
      id
    },
    include: {
      nodes: true,
      edges: true
    }
  });
}

export async function updateProject(id: string, data: { name: string }) {
  return await prisma.project.update({
    where: {
      id
    },
    data
  });
}