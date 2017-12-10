import { Test } from '@nestjs/testing';
import { TestingModule } from '@nestjs/testing/testing-module';
import { Component, Inject } from '@nestjs/common';

import { compare } from 'bcryptjs';

import { ConfigModule, DATABASE_CONFIG } from './index';
import { DatabaseConfig } from './database.config';
import { JWTConfig, JWT_CONFIG } from './jwt.config';

/**
 * Use a mocking component to test exports from ConfigModule
 * We inject the configuration by using magic token to this mock component, and
 *   verify if we can really get the config that is exported from the ConfigModule
 */
@Component()
export class MockComponent {
  constructor(
    @Inject(DATABASE_CONFIG) public readonly databaseConfig,
    @Inject(JWT_CONFIG) public readonly jwtConfig,
  ) { }
}

describe('ConfigModule', () => {
  it('should export database config', async () => {
    const module = await Test.createTestingModule({
      modules: [ConfigModule],
      components: [MockComponent],
    }).compile();

    const mockComponent = module.get<MockComponent>(MockComponent);

    expect(mockComponent.databaseConfig).toEqual(DatabaseConfig.useValue);
    expect(mockComponent.jwtConfig).toEqual(JWTConfig.useValue);
  });
});
