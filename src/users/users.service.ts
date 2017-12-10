import { Inject, Component } from '@nestjs/common';
import { Repository } from 'typeorm';
import { omit } from 'lodash';

import { HashService } from '../bcrypt';

import { USERS_REPOSITORY } from './users-repository.provider';

import { User } from './user.entity';
import { UserStatus } from './models';
import { CreateUserDTO, AuthenticateUserDTO } from './dto';

export class UsernameAlreadyExist extends Error {
  constructor() {
    super('Username is already taken');
  }
}

export class EmailAlreadyExist extends Error {
  constructor() {
    super('Email is already registered with another user');
  }
}

/**
 * Service for Create/Retrieve/Update/Delete/List operation on users entity
 */
@Component()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY) private readonly usersRepository: Repository<User>,
    private readonly hashService: HashService,
  ) { }

  /**
   * Create/Update user in database
   *
   * @param user `User` entity to be created or updated
   * @return <Promise> `User` created / updated
   */
  async upsert(user: User): Promise<User> {
    return await this.usersRepository.save(user);
  }

  /**
   * Get user from database by uuid, this is intended to be cached aggressively
   *   such that we can take advantage of redis instead of querying database
   *   and joining tables.
   *
   * @param uuid `uuid` of the user
   * @return <Promise> `User` found from database, the promise will be resolved
   *   to `undefined` if the uuid was not found
   */
  async findByUuid(uuid: string): Promise<User | undefined> {
    return await this.usersRepository.findOne({
      select: ['uuid', 'commonName', 'username'],
      where: { uuid },
      cache: 86400,
    });
  }

  /**
   * Get user from database by username
   *
   * @param username Username of the user
   * @return <Promise> `User` found from database, the promise will be resolved
   *   to `undefined` if the username was not found
   */
  async findByUsername(username: string): Promise<User | undefined> {
    return await this.usersRepository.findOne({ username });
  }

  /**
   * Get user from database by email
   *
   * @param email Email of the user
   * @return <Promise> `User` found from database, the promise will be resolved
   *   to `undefined` if the username was not found
   */
  async findByEmail(email: string): Promise<User | undefined> {
    return await this.usersRepository.findOne({ email });
  }

  /**
   * List all users from database
   *
   * @return <Promise> An array of `User` entities from the database
   */
  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  /**
   * Remove user entity from database
   *
   * @param user `User` entity to be removed
   * @return <Promise> `User` entity removed from database, `uuid` will become
   *   undefined after deletion
   */
  async delete(user: User): Promise<User> {
    return await this.usersRepository.remove(user);
  }

  /**
   * Create user in the database
   *
   * @param commonName Common name
   * @param username Username
   * @param email Email
   * @param password Original Password
   * @return <Promise> `User` entity of the newly created user
   */
  async createUser({
    commonName,
    username,
    email,
    password,
  }: CreateUserDTO): Promise<User> {
    // Make sure there is no user with same username
    if (await this.findByUsername(username)) {
      throw new UsernameAlreadyExist();
    }

    // Make sure there is no user with same email
    if (await this.findByEmail(email)) {
      throw new EmailAlreadyExist();
    }

    return await this.upsert({
      ...(new User()),
      commonName,
      username,
      email,
      hashedPassword: await this.hashService.hash(password),
      userStatus: UserStatus.ACTIVE,
    });
  }

  /**
   * Check username and password with the database
   *
   * @param username Username of the user
   * @param password Password to be authenticated with
   * @return <Promise> `User` entity if the username/password match, otherwise
   *   `undefined`
   */
  async authenticate(username: string, password: string): Promise<User> {
    const user: User = await this.findByUsername(username);
    if (user && await this.hashService.compare(password, user.hashedPassword)) {
      return user;
    }
  }
}
