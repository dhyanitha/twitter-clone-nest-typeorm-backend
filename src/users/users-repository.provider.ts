import { Connection } from 'typeorm';
import { TYPEORM_DATABASE_CONNECTION } from '../database';

import { User } from './user.entity';

export const USERS_REPOSITORY = 'UsersRepository';

/**
 * Users repository providers for obtaining a slice of database for
 * actual db operation in services
 */
export const UsersRepositoryProvider = {
  provide: USERS_REPOSITORY,
  useFactory: (connection: Connection) => connection.getRepository(User),
  inject: [TYPEORM_DATABASE_CONNECTION],
};
