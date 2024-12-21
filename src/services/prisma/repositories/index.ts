import { ProjectRepository } from './ProjectRepository';
import { NodeRepository } from './NodeRepository';
import { UserRepository } from './UserRepository';

export class RepositoryFactory {
  private static instance: RepositoryFactory;
  private projectRepository: ProjectRepository;
  private nodeRepository: NodeRepository;
  private userRepository: UserRepository;

  private constructor() {
    this.projectRepository = new ProjectRepository();
    this.nodeRepository = new NodeRepository();
    this.userRepository = new UserRepository();
  }

  public static getInstance(): RepositoryFactory {
    if (!RepositoryFactory.instance) {
      RepositoryFactory.instance = new RepositoryFactory();
    }
    return RepositoryFactory.instance;
  }

  public getProjectRepository(): ProjectRepository {
    return this.projectRepository;
  }

  public getNodeRepository(): NodeRepository {
    return this.nodeRepository;
  }

  public getUserRepository(): UserRepository {
    return this.userRepository;
  }
}

// リポジトリのエクスポート
export const getRepositories = () => {
  const factory = RepositoryFactory.getInstance();
  return {
    projectRepository: factory.getProjectRepository(),
    nodeRepository: factory.getNodeRepository(),
    userRepository: factory.getUserRepository(),
  };
};

// 型のエクスポート
export type { ProjectRepository } from './ProjectRepository';
export type { NodeRepository } from './NodeRepository';
export type { UserRepository } from './UserRepository';