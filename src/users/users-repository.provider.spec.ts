import { Connection, ConnectionOptions, Repository } from 'typeorm';

import { localDatabaseOption } from '../../test/local-database.mock';

import { TypeORMDatabaseProvider } from '../database/typeorm.provider';

import { User } from './user.entity';
import { UsersRepositoryProvider } from './users-repository.provider';

export class MockUserRepository {
  userRepositoryDbOption: ConnectionOptions = {
    ...localDatabaseOption,
    entities: [
      User,
    ],
  };

  connection: Connection;
  repository: Repository<User>;

  async connect() {
    this.connection = await TypeORMDatabaseProvider.useFactory(this.userRepositoryDbOption);
    this.repository = UsersRepositoryProvider.useFactory(this.connection);
    return this.repository;
  }

  async close() {
    return await this.connection.close();
  }
}

describe('UserRepository', () => {
  const mockUserRepository = new MockUserRepository();
  let userRepository: Repository<User>;

  beforeAll(async () => {
    userRepository = await mockUserRepository.connect();
  });

  it('should get a repository of `User` entity from the connection', async () => {
    /**
     * If the repository can be created properly, the count() function should
     *   return a number
     */
    expect(typeof await userRepository.count()).toBe('number');
  });

  afterAll(async () => {
    await mockUserRepository.close();
  });
});
