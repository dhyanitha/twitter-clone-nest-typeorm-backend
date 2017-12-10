import * as jwt from 'jsonwebtoken';
import { omit } from 'lodash';
import { UnauthorizedException } from '@nestjs/common';

import { MockExpressResponse } from '../../test/express-mock-response';

import { User } from './user.entity';

import { AuthService } from './auth.service';

import { AuthController } from './auth.controller';
import { AuthenticateUserDTO } from './dto';

export const mockUser: User = {
  ...(new User()),
  commonName: 'Unit Test',
  username: 'testuser',
  email: 'testuser@example.com',
  hashedPassword: 'I_SHOULD_NOT_BE_VISIBLE_AT_ALL',
};

export const mockJWTToken = jwt.sign({
  data: {
    uuid: 'I_AM_A_UUID',
    commonName: 'Unit Test',
    username: 'testuser',
    email: 'testuser@example.com',
  },
}, 'i_am_a_secret_key', {
  expiresIn: '6h',
});

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(() => {
    // Create a service stub for spying
    authService = new AuthService(undefined, undefined, undefined);
    authController = new AuthController(authService);
  });

  describe('authUser', () => {
    it('should be able to authenticate user', async () => {
      const responseMock = MockExpressResponse();
      // Mocking the success authenticate service response
      jest.spyOn(authService, 'authenticate').mockReturnValue(Promise.resolve(mockJWTToken));

      await authController.authUser(
        {
          username: 'testuser',
          password: 'passw0rd',
        },
        responseMock.mockResponseObj,
      );

      expect(responseMock.statusMock).toHaveBeenCalledWith(200);
      expect(responseMock.cookieMock).toHaveBeenCalledWith('authToken', mockJWTToken, {
        maxAge: 21600000,
        httpOnly: true,
        secure: true,
        domain: '.coeus.hk',
        path: '/',
      });
      expect(responseMock.jsonMock).toHaveBeenCalledWith({
        status: 'authorized',
        token: mockJWTToken,
      });
    });

    it('should throw UnauthorizedException if username/password is not correct', () => {
      const mockResponseObj: any = {};
      // Mocking the failed authenticate service response
      jest.spyOn(authService, 'authenticate').mockReturnValue(Promise.resolve(undefined));

      return authController.authUser(
        {
          username: 'testuser',
          password: 'inc0rrect',
        },
        mockResponseObj,
      ).then(() => {
        expect(true).toBeFalsy();
      }).catch((err) => {
        expect(err).toBeInstanceOf(UnauthorizedException);
        expect(err.response.message).toEqual('Incorrect username/password');
      });
    });
  });

  describe('authToken', () => {
    it('should be able to authenticate user with token with GET handler', async () => {
      jest.spyOn(authService, 'validateToken').mockReturnValue(Promise.resolve(mockUser));

      const user = await authController.authTokenGET('dummyToken', undefined);

      expect(user).toEqual(omit(mockUser, ['hashedPassword']));
    });

    it('should be able to authenticate user with token with POST handler', async () => {
      jest.spyOn(authService, 'validateToken').mockReturnValue(Promise.resolve(mockUser));

      const user = await authController.authTokenGET(undefined, 'dummyToken');

      expect(user).toEqual(omit(mockUser, ['hashedPassword']));
    });
  });
});
