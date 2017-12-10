import { Test } from '@nestjs/testing';
import { TestingModule } from '@nestjs/testing/testing-module';
import { Component, Inject } from '@nestjs/common';
import {
  ConnectionOptions,
  Connection,
} from 'typeorm';

import { DATABASE_CONFIG } from '../config';

import { DatabaseModule, TYPEORM_DATABASE_CONNECTION } from './index';

import { MockDatabaseConfigProvider } from '../../test/local-database.mock';

/**
 * Use a mocking component to test exports from DatabaseModule
 */
@Component()
export class MockComponent {
  constructor(
    @Inject(TYPEORM_DATABASE_CONNECTION) public readonly connection: Connection,
  ) { }
}

describe('DatabaseModule', () => {
  it('should export TypeORM connection', async () => {
    const module = await Test.createTestingModule({
      modules: [DatabaseModule],
      components: [
        /**
         *  We load MockDatabaseConnfigProvider here to override the default config
         *    provided by ConfigModule, which databaseModule is depending on
         */
        MockDatabaseConfigProvider,
        MockComponent,
      ],
    }).compile();

    const mockComponent = module.get<MockComponent>(MockComponent);

    expect(mockComponent.connection.isConnected).toBeTruthy();

    await mockComponent.connection.close();
  });
});
