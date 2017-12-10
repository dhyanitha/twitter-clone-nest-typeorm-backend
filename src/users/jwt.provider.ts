import * as jwt from 'jsonwebtoken';

export const JWT = 'JsonWebToken';

/**
 * Instead of having services that require JWT to import in source file,
 *   we should put this in a provider and obtain later
 */
export const JsonWebTokenProvider = {
  provide: JWT,
  useFactory: () => jwt,
};
