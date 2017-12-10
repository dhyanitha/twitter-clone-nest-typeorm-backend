import { Connection } from 'typeorm';
import { TYPEORM_DATABASE_CONNECTION } from '../database';

import { Follow } from './follow.entity';

export const FOLLOWS_REPOSITORY = 'FollowsRepository';

/**
 * Follows repository providers for obtaining a slice of database for
 * actual db operation in services
 */
export const FollowsRepositoryProvider = {
  provide: FOLLOWS_REPOSITORY,
  useFactory: (connection: Connection) => connection.getRepository(Follow),
  inject: [TYPEORM_DATABASE_CONNECTION],
};
