import { Test } from '@nestjs/testing';
import { TestingModule } from '@nestjs/testing/testing-module';
import { Component } from '@nestjs/common';

import { compare } from 'bcryptjs';

import { BCryptModule, HashService } from './index';

/**
 * Use a mocking component to test exports from BCryptModule
 */
@Component()
export class MockComponent {
  constructor(
    public readonly hashService: HashService,
  ) {}
}

describe('BCryptModule', () => {
  it('should export hash provider', async () => {
    const module = await Test.createTestingModule({
      modules: [BCryptModule],
      components: [MockComponent],
    }).compile();

    const mockComponent = module.get<MockComponent>(MockComponent);

    const pwdHash = await mockComponent.hashService.hash('passw0rd');
    expect(typeof pwdHash).toBe('string');

    expect(await mockComponent.hashService.compare('passw0rd', pwdHash)).toBeTruthy();
  });
});
