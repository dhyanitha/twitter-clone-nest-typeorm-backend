import { Connection } from 'typeorm';

import { TypeORMDatabaseProvider } from './typeorm.provider';

import { TestObject } from '../../test/test-object';
import { localDatabaseOption } from '../../test/local-database.mock';

describe('TypeORMDatabaseFactory', () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await TypeORMDatabaseProvider.useFactory(localDatabaseOption);
  });

  it('should be able to connect local postgres SQL database for unit test', () => {
    expect(connection.isConnected).toBeTruthy();
  });

  it('should be able to save new entity', async () => {
    const unittestKey = 'testkey';
    const unittestValue = 'hello world';

    // Save a new test object
    const testObj = new TestObject();
    testObj.key = unittestKey;
    testObj.value = unittestValue;

    await connection.manager.save(testObj);

    // Query the newly added test object
    const objFromDb = await connection.manager
      .findOneById(TestObject, unittestKey, {
        cache: true,
      });

    expect(objFromDb).toBeInstanceOf(TestObject);
    expect(objFromDb).toHaveProperty('key', testObj.key);
    expect(objFromDb).toHaveProperty('value', testObj.value);

    // Query the newly added test object from cache instead
    const objFromCache = await connection.manager
      .findOneById(TestObject, unittestKey, {
        cache: true,
      });

    expect(objFromCache).toBeInstanceOf(TestObject);
    expect(objFromCache).toHaveProperty('key', testObj.key);
    expect(objFromCache).toHaveProperty('value', testObj.value);

    // Remove the test object
    await connection.manager.deleteById(TestObject, unittestKey);
  });

  afterAll(async () => {
    await connection.close();
  });
});
