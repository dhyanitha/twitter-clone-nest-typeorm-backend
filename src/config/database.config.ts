import { ConnectionOptions } from 'typeorm';

export const DATABASE_CONFIG = 'DatabaseConfig';

/**
 * Database Configuration for TypeORM
 * TODO: should move this to a configuration file instead
 */
export const DatabaseConfig: {
  provide: string,
  useValue: ConnectionOptions,
} = {
  provide: DATABASE_CONFIG,

  /**
   * For the actual configuration parameters, please refer to
   *   https://github.com/typeorm/typeorm
   */
  useValue: {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'passw0rd123',
    database: 'twitter_clone',
    synchronize: true,
    logging: false,
    entities: [
      `${__dirname}/../**/*.entity{.ts,.js}`,
    ],
    cache: {
      type: 'redis',
      options: {
        host: 'localhost',
        port: 6379,
      },
    },
  },
};
