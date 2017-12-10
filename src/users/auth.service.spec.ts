import * as jwt from 'jsonwebtoken';

import { User } from './user.entity';
import { UsersService } from './users.service';

import { AuthService } from './auth.service';

export const mockUser: User = {
  ...(new User()),
  uuid: 'I_AM_A_UUID',
  commonName: 'Unit Test',
  username: 'testuser',
  email: 'testuser@example.com',
  hashedPassword: 'I_SHOULD_NOT_BE_VISIBLE_AT_ALL',
};

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let token;

  beforeEach(() => {
    usersService = new UsersService(undefined, undefined);
    authService = new AuthService({
      expiresIn: '5m',
      secretKey: 'secret_key',
    }, jwt, usersService);
  });

  it('should be able to sign jwt token when user can authenticate', async () => {
    jest.spyOn(usersService, 'authenticate').mockReturnValue(Promise.resolve(mockUser));

    token = await authService.authenticate('testuser', 'passw0rd');
    const decoded = jwt.decode(token);
    expect(decoded).toHaveProperty('data.uuid', 'I_AM_A_UUID');
    expect(decoded).toHaveProperty('data.commonName', 'Unit Test');
    expect(decoded).toHaveProperty('data.username', 'testuser');
    expect(decoded).toHaveProperty('data.email', 'testuser@example.com');
  });

  it('should be able to validate the jwt token', async () => {
    jest.spyOn(usersService, 'findByUsername').mockReturnValue(Promise.resolve(mockUser));

    const user = await authService.validateToken(token);

    expect(user).toHaveProperty('uuid', 'I_AM_A_UUID');
    expect(user).toHaveProperty('commonName', 'Unit Test');
    expect(user).toHaveProperty('username', 'testuser');
    expect(user).toHaveProperty('email', 'testuser@example.com');
  });
});
