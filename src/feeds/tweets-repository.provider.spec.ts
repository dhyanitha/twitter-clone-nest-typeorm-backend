import { Connection, ConnectionOptions, Repository } from 'typeorm';

import { localDatabaseOption } from '../../test/local-database.mock';

import { TypeORMDatabaseProvider } from '../database/typeorm.provider';

import { Tweet } from './tweet.entity';
import { TweetsRepositoryProvider } from './tweets-repository.provider';

export class MockTweetRepository {
  tweetRepositoryDbOption: ConnectionOptions = {
    ...localDatabaseOption,
    entities: [
      Tweet,
    ],
  };

  connection: Connection;
  repository: Repository<Tweet>;

  async connect() {
    this.connection = await TypeORMDatabaseProvider.useFactory(this.tweetRepositoryDbOption);
    this.repository = TweetsRepositoryProvider.useFactory(this.connection);
    return this.repository;
  }

  async close() {
    return await this.connection.close();
  }
}

describe('TweetRepository', () => {
  const mockTweetRepository = new MockTweetRepository();
  let tweetRepository: Repository<Tweet>;

  beforeAll(async () => {
    tweetRepository = await mockTweetRepository.connect();
  });

  it('should get a repository of `Tweet` entity from the connection', async () => {
    /**
     * If the repository can be created properly, the count() function should
     *   return a number
     */
    expect(typeof await tweetRepository.count()).toBe('number');
  });

  afterAll(async () => {
    await mockTweetRepository.close();
  });
});
