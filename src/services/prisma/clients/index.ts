import { nodeClient } from './nodeClient';
import { projectClient } from './projectClient';
import { userClient } from './userClient';
import { prisma } from '../db';

export const db = {
  node: nodeClient(prisma),
  project: projectClient(prisma),
  user: userClient(prisma),
};

export type { NodeOperations } from './nodeClient';
export type { ProjectOperations } from './projectClient';
export type { UserOperations } from './userClient';