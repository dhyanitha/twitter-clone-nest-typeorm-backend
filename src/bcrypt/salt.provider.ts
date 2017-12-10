import { genSalt } from 'bcryptjs';

export const SALT_GENERATOR = 'SaltGenerator';

/**
 * Salt provider for providing the salt to hash provider
 */
export const SaltGeneratorProvider = {
  provide: SALT_GENERATOR,
  useFactory: async () => await genSalt(),
};
