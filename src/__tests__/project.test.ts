import { prisma } from '@/lib/prisma/db';
import { createProject, getProjects } from '@/lib/services/project';

describe('Project Management', () => {
  beforeEach(async () => {
    // テストデータのクリーンアップ
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();
  });

  it('should create a new project', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User'
      }
    });

    const project = await createProject({
      name: 'Test Project',
      userId: user.id
    });

    expect(project).toHaveProperty('id');
    expect(project.name).toBe('Test Project');
    expect(project.userId).toBe(user.id);
  });

  it('should list all projects for a user', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User'
      }
    });

    await Promise.all([
      createProject({ name: 'Project 1', userId: user.id }),
      createProject({ name: 'Project 2', userId: user.id })
    ]);

    const projects = await getProjects(user.id);
    expect(projects).toHaveLength(2);
    expect(projects[0]).toHaveProperty('name');
    expect(projects[1]).toHaveProperty('name');
  });
});