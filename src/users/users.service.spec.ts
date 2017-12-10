import { genSalt } from 'bcryptjs';

import { HashService } from '../bcrypt';

import { MockUserRepository } from './users-repository.provider.spec';
import { User } from './user.entity';
import { UsersService, UsernameAlreadyExist, EmailAlreadyExist } from './users.service';
import { UserStatus } from './models';

describe('UsersService', () => {
  let hasher: HashService;
  let userRepo: MockUserRepository;
  let usersService: UsersService;
  let newUserUuid: string;

  beforeAll(async () => {
    const salt = await genSalt();
    hasher = new HashService(salt);
    userRepo = new MockUserRepository();
    usersService = new UsersService(await userRepo.connect(), hasher);

    expect(usersService).toBeInstanceOf(UsersService);
  });

  it('should be able to create user', async () => {
    const user = await usersService.createUser({
      commonName: 'Unit Test',
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'passw0rd',
    });

    expect(user.uuid).toBeDefined();
    expect(user.commonName).toBe('Unit Test');
    expect(user.username).toBe('testuser');
    expect(user.email).toBe('testuser@example.com');
    expect(user.userStatus).toBe(UserStatus.ACTIVE);
    expect(await hasher.compare('passw0rd', user.hashedPassword)).toBeTruthy();
    newUserUuid = user.uuid;
  });

  it('should not be able to create user with same username', async () => {
    try {
      const user = await usersService.createUser({
        commonName: 'Unit Test',
        username: 'testuser',
        email: 'anotheremail@example.com',
        password: 'passw0rd',
      });
    } catch (err) {
      expect(err).toBeInstanceOf(UsernameAlreadyExist);
    }
  });

  it('should not be able to create user with same email', async () => {
    try {
      const user = await usersService.createUser({
        commonName: 'Unit Test',
        username: 'anotheruser',
        email: 'testuser@example.com',
        password: 'passw0rd',
      });
    } catch (err) {
      expect(err).toBeInstanceOf(EmailAlreadyExist);
    }
  });

  it('should be able to find user by uuid', async () => {
    const user = await usersService.findByUuid(newUserUuid);
    expect(user.commonName).toBe('Unit Test');
    expect(user.username).toBe('testuser');
  });

  it('should be able to find user by username', async () => {
    const user = await usersService.findByUsername('testuser');
    expect(user.commonName).toBe('Unit Test');
    expect(user.username).toBe('testuser');
    expect(user.email).toBe('testuser@example.com');
    expect(user.userStatus).toBe(UserStatus.ACTIVE);
    expect(await hasher.compare('passw0rd', user.hashedPassword)).toBeTruthy();
  });

  it('should return undefined if username cannot be found', async () => {
    const user = await usersService.findByUsername('inexist');
    expect(user).toBeUndefined();
  });

  it('should be able to find user by email', async () => {
    const user = await usersService.findByEmail('testuser@example.com');
    expect(user.commonName).toBe('Unit Test');
    expect(user.username).toBe('testuser');
    expect(user.email).toBe('testuser@example.com');
    expect(user.userStatus).toBe(UserStatus.ACTIVE);
    expect(await hasher.compare('passw0rd', user.hashedPassword)).toBeTruthy();
  });

  it('should return undefined if email cannot be found', async () => {
    const user = await usersService.findByEmail('inexist');
    expect(user).toBeUndefined();
  });

  it('should be able to list all user', async () => {
    const user = await usersService.findByUsername('testuser');
    const users = await usersService.findAll();

    expect(users).toContainEqual(user);
  });

  it('should be able to authenticate with correct credential', async () => {
    const validUser = await usersService.authenticate('testuser', 'passw0rd');
    expect(validUser).toBeTruthy();
  });

  it('should not be able to authenticate with incorrect credential', async () => {
    const incorrectPassword = await usersService.authenticate('testuser', 'passw1rd');
    expect(incorrectPassword).toBeFalsy();
  });

  it('should not be able to authenticate with inexist user', async () => {
    const inexistUser = await usersService.authenticate('test', 'passw0rd');
    expect(inexistUser).toBeFalsy();
  });

  it('should be able to delete user', async () => {
    const user = await usersService.findByUsername('testuser');
    const deletedUser = await usersService.delete(user);
    expect(deletedUser.uuid).toBeUndefined();

    const userNoLongerExist = await usersService.findByUsername('testuser');
    expect(userNoLongerExist).toBeUndefined();
  });

  afterAll(async () => {
    await userRepo.close();
  });
});
