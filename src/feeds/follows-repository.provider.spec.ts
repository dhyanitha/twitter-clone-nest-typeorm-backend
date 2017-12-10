import { Connection, ConnectionOptions, Repository } from 'typeorm';

import { localDatabaseOption } from '../../test/local-database.mock';

import { TypeORMDatabaseProvider } from '../database/typeorm.provider';

import { Follow } from './follow.entity';
import { FollowsRepositoryProvider } from './follows-repository.provider';

export class MockFollowRepository {
  followRepositoryDbOption: ConnectionOptions = {
    ...localDatabaseOption,
    entities: [
      Follow,
    ],
  };

  connection: Connection;
  repository: Repository<Follow>;

  async connect() {
    this.connection = await TypeORMDatabaseProvider.useFactory(this.followRepositoryDbOption);
    this.repository = FollowsRepositoryProvider.useFactory(this.connection);
    return this.repository;
  }

  async close() {
    return await this.connection.close();
  }
}

describe('FollowRepository', () => {
  const mockFollowRepository = new MockFollowRepository();
  let followRepository: Repository<Follow>;

  beforeAll(async () => {
    followRepository = await mockFollowRepository.connect();
  });

  it('should get a repository of `Follow` entity from the connection', async () => {
    /**
     * If the repository can be created properly, the count() function should
     *   return a number
     */
    expect(typeof await followRepository.count()).toBe('number');
  });

  afterAll(async () => {
    await mockFollowRepository.close();
  });
});
