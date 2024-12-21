import { User, PrismaClient } from '@prisma/client';
import { BaseRepository } from './base/BaseRepository';

type UserDelegate = PrismaClient['user'];

export class UserRepository extends BaseRepository<User, UserDelegate> {
  protected getDelegate(): UserDelegate {
    return this.prisma.user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const delegate = this.getDelegate();
    return delegate.findUnique({
      where: { email },
    });
  }

  async findOrCreateDevUser(): Promise<User> {
    const delegate = this.getDelegate();
    return delegate.upsert({
      where: {
        email: 'dev@example.com',
      },
      update: {},
      create: {
        email: 'dev@example.com',
        name: 'Developer',
      },
    });
  }

  async findByIdWithProjects(id: string): Promise<User | null> {
    const delegate = this.getDelegate();
    return delegate.findUnique({
      where: { id },
      include: {
        projects: {
          orderBy: {
            name: 'asc',
          },
        },
      },
    });
  }
}