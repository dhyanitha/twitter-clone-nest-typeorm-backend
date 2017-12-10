import { SaltGeneratorProvider } from './salt.provider';

describe('SaltGeneratorProvider', () => {
  it('should be able to generate salt', async () => {
    const salt = await SaltGeneratorProvider.useFactory();
    expect(typeof salt).toBe('string');
  });
});
