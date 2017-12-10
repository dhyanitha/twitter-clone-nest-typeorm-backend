import { createConnection, ConnectionOptions } from 'typeorm';

import { DATABASE_CONFIG } from '../config';

export const TYPEORM_DATABASE_CONNECTION = 'DatabaseConnection';

/**
 * Database providers used by Database Module, such that we can inject this
 * into other modules that require database support
 */
export const TypeORMDatabaseProvider = {
  provide: TYPEORM_DATABASE_CONNECTION,
  useFactory: async (options: ConnectionOptions) => await createConnection(options),
  inject: [DATABASE_CONFIG],
};
