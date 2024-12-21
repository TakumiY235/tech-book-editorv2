import { PrismaClient } from '@prisma/client';
import { IRepository } from './IRepository';
import { prisma } from '../../db';

type PrismaDelegate = {
  findUnique: (args: { where: { id: string } }) => Promise<any>;
  findMany: (args?: any) => Promise<any[]>;
  create: (args: { data: any }) => Promise<any>;
  update: (args: { where: { id: string }; data: any }) => Promise<any>;
  delete: (args: { where: { id: string } }) => Promise<any>;
};

export abstract class BaseRepository<T, D extends PrismaDelegate> implements IRepository<T> {
  protected prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  protected abstract getDelegate(): D;

  async findById(id: string): Promise<T | null> {
    const delegate = this.getDelegate();
    return delegate.findUnique({
      where: { id },
    });
  }

  async findMany(params?: any): Promise<T[]> {
    const delegate = this.getDelegate();
    return delegate.findMany(params);
  }

  async create(data: any): Promise<T> {
    const delegate = this.getDelegate();
    return delegate.create({
      data,
    });
  }

  async update(id: string, data: any): Promise<T> {
    const delegate = this.getDelegate();
    return delegate.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<T> {
    const delegate = this.getDelegate();
    return delegate.delete({
      where: { id },
    });
  }
}