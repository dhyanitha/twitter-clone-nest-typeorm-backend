import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { User } from './user.entity';
import { UsersService, UsernameAlreadyExist, EmailAlreadyExist } from './users.service';

import { UsersController } from './users.controller';
import { CreateUserDTO } from './dto';

export const mockUser: User = {
  ...(new User()),
  commonName: 'Unit Test',
  username: 'testuser',
  email: 'testuser@example.com',
  hashedPassword: 'I_SHOULD_NOT_BE_VISIBLE_AT_ALL',
};

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  beforeEach(() => {
    // Create a service stub for spying
    usersService = new UsersService(undefined, undefined);
    usersController = new UsersController(usersService);
  });

  describe('createUser', () => {
    const createUserBody: CreateUserDTO = {
      commonName: 'Unit Test',
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'passw0rd',
    };

    it('should return sanitized user', async () => {
      jest.spyOn(usersService, 'createUser').mockReturnValue(Promise.resolve(mockUser));

      const response = await usersController.createUser(createUserBody);
      expect(response).not.toHaveProperty('hashedPassword');
    });

    it('should throw ForbiddenException if Username already exist is thrown by service', () => {
      const mockError = new UsernameAlreadyExist();
      jest.spyOn(usersService, 'createUser').mockReturnValue(Promise.reject(mockError));

      return usersController.createUser(createUserBody)
        .then(() => {
          expect(true).toBeFalsy();
        })
        .catch((err) => {
          expect(err).toBeInstanceOf(ForbiddenException);
          expect(err.response.message).toEqual(mockError.message);
        });
    });

    it('should throw ForbiddenException if Email already exist is thrown by service', () => {
      const mockError = new EmailAlreadyExist();
      jest.spyOn(usersService, 'createUser').mockReturnValue(Promise.reject(mockError));

      return usersController.createUser(createUserBody)
        .then(() => {
          expect(true).toBeFalsy();
        })
        .catch((err) => {
          expect(err).toBeInstanceOf(ForbiddenException);
          expect(err.response.message).toEqual(mockError.message);
        });
    });

    it('should throw Errors as it is', () => {
      const mockError = new Error('unknown error occurred');
      jest.spyOn(usersService, 'createUser').mockReturnValue(Promise.reject(mockError));

      return usersController.createUser(createUserBody)
        .then(() => {
          expect(true).toBeFalsy();
        })
        .catch((err) => {
          expect(err).toEqual(mockError);
        });
    });
  });

  describe('listUsers', () => {
    it('should return sanitized user list', async () => {
      jest.spyOn(usersService, 'findAll').mockReturnValue(Promise.resolve([mockUser]));

      const response = await usersController.listUsers();
      expect(response[0]).not.toHaveProperty('hashedPassword');
    });
  });

  describe('getUserByUsername', () => {
    it('should return sanitized user', async () => {
      jest.spyOn(usersService, 'findByUsername').mockReturnValue(Promise.resolve(mockUser));

      const response = await usersController.getUserByUsername('testuser');
      expect(response).not.toHaveProperty('hashedPassword');
    });

    it('should throw NotFoundException if username does not exist', () => {
      jest.spyOn(usersService, 'findByUsername').mockReturnValue(Promise.resolve(undefined));

      return usersController.getUserByUsername('testuser')
        .then(() => {
          expect(true).toBeFalsy();
        })
        .catch((err) => {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.response.message).toEqual('User does not exist');
        });
    });
  });
});
