import { Controller, Get, Post, Delete, Param, Body, ForbiddenException, NotFoundException } from '@nestjs/common';
import { omit } from 'lodash';

import { CreateUserDTO } from './dto';
import { User } from './user.entity';
import { UsersService, UsernameAlreadyExist, EmailAlreadyExist } from './users.service';

/**
 * /users Endpoint - User Register endpoint
 * POST /users - Create User
 * GET /users - List all Users
 * GET /users/:username - Get user with username
 */
@Controller('users')
export class UsersController {
  constructor( private readonly usersService: UsersService ) { }

  /**
   * Remove sensitive information from the user object before sending it
   *   back out in repsonse
   *
   * @param user User object
   */
  private sanitizeUser(user: User) {
    return omit(user, ['hashedPassword']);
  }

  /**
   * POST Endpoint for user creation
   *
   * @param createUserDTO Request body, refer to `dto/create-user.dto.ts`
   * @return A sanitized user entity of the newly created user
   */
  @Post()
  async createUser( @Body() createUserDTO: CreateUserDTO ) {
    try {
      const user = await this.usersService.createUser(createUserDTO);
      return this.sanitizeUser(user);
    } catch (err) {
      if (err instanceof UsernameAlreadyExist || err instanceof EmailAlreadyExist) {
        throw new ForbiddenException(err.message);
      }
      throw err;
    }
  }

  /**
   * GET Endpoint for listing all users
   *
   * @return An array of sanitized user entities of all users in database
   */
  @Get()
  async listUsers() {
    const users = await this.usersService.findAll();
    return users.map((user: User) => this.sanitizeUser(user));
  }

  /**
   * GET Endpoint for obtaining user information
   *
   * @param params Route params
   * @return A sanitized user entity of the queried user
   */
  @Get(':username')
  async getUserByUsername(@Param() params) {
    const user = await this.usersService.findByUsername(params.username);
    if (!user) {
      throw new NotFoundException('User does not exist');
    }
    return this.sanitizeUser(user);
  }
}
