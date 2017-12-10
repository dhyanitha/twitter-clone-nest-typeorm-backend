import { ConnectionOptions } from 'typeorm';

import { DATABASE_CONFIG } from '../src/config';

import { TestObject } from './test-object';

/**
 * Local database option for unit test
 * We use in memory sqlite in typeorm **without** redis for unit test so that
 *   we don't have to mock the whole typeorm stack
 */
export const localDatabaseOption: ConnectionOptions = {
  type: 'sqlite',
  database: ':memory:',
  synchronize: true,
  logging: false,
  entities: [
    TestObject,
  ],
};

export const MockDatabaseConfigProvider = {
  provide: DATABASE_CONFIG,
  useValue: localDatabaseOption,
};
