import { genSalt } from 'bcryptjs';

import { HashService } from './hash.service';

describe('HashProvider', () => {
  let hasher: HashService;

  beforeAll(async () => {
    const salt = await genSalt();
    hasher = new HashService(salt);
  });

  it('should be able to generate a hash and validate', async () => {
    const password = 'passw0rd';
    const incorrectPassword = 'passw1rd';
    const hash = await hasher.hash(password);

    expect(typeof hash).toBe('string');
    expect(await hasher.compare(password, hash)).toBeTruthy();
    expect(await hasher.compare(incorrectPassword, hash)).toBeFalsy();
  });
});
