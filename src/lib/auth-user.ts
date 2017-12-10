import { UnauthorizedException } from '@nestjs/common';

import { AuthService, User } from '../users';

/**
 * Actual implementation of token validation/authentication
 * Token will override cookie if both token exist
 */
export async function getUserByAuthToken(
  authService: AuthService,
  cookie: string,
  token: string,
): Promise<User> {
  const authJWTToken = token ? token : cookie;
  const user: User = await authService.validateToken(authJWTToken);
  if (!user) {
    throw new UnauthorizedException('Invalid token');
  }

  return user;
}
