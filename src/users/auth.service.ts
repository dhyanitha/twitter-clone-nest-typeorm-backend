import { Inject, Component } from '@nestjs/common';

import { JWT_CONFIG } from '../config';

import { JWT } from './jwt.provider';
import { UsersService } from './users.service';
import { User } from './user.entity';

/**
 * Authentication Service
 * We are using JWT for authentication and user validation instead of
 *   traditional server-side session.
 */
@Component()
export class AuthService {
  constructor(
    @Inject(JWT_CONFIG) private readonly jwtConfig,
    @Inject(JWT) private readonly jwt,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Authenticate the user and return a valid JWT token
   *
   * @param username username of the user to be authenticated
   * @param password password of the user to be authenticated
   * @return <Promise> Valid JWT token string of the user, will return empty
   *   string if username / password are not correct
   */
  async authenticate(username: string, password: string): Promise<string> {
    const user = await this.usersService.authenticate(username, password);
    if (!user) {
      return '';
    }

    /**
     * In actual system, we should also add a csrf token in the JWT Token,
     *   and add an validation check against X-CSRF-Token header while
     *   validating token
     */
    // TODO: Change to asynchronous jwt token signing
    return this.jwt.sign({
      data: {
        uuid: user.uuid,
        commonName: user.commonName,
        username: user.username,
        email: user.email,
      },
    }, this.jwtConfig.secretKey, {
      expiresIn: this.jwtConfig.expiresIn,
    });
  }

  /**
   * Validate the user and return a valid user object
   *
   * @param token JWT token of the user
   * @return <Promise> `User` entity of the user authorized by the token,
   *   `undefined` if the token is not valid or user is no longer in the database
   */
  async validateToken(token: string): Promise<User> {
    try {
      // TODO: Change to asynchronous jwt token verification
      const payload = this.jwt.verify(token, this.jwtConfig.secretKey);

      return await this.usersService.findByUsername(payload.data.username);
    } catch (err) {
      // jwt.verify will throw error on invalid token
      return;
    }
  }
}
