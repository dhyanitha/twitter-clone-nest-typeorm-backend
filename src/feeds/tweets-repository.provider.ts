import { Connection } from 'typeorm';
import { TYPEORM_DATABASE_CONNECTION } from '../database';

import { Tweet } from './tweet.entity';

export const TWEETS_REPOSITORY = 'TweetsRepository';

/**
 * Tweets repository providers for obtaining a slice of database for
 * actual db operation in services
 */
export const TweetsRepositoryProvider = {
  provide: TWEETS_REPOSITORY,
  useFactory: (connection: Connection) => connection.getRepository(Tweet),
  inject: [TYPEORM_DATABASE_CONNECTION],
};
