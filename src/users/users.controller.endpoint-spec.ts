import * as express from 'express';
import * as request from 'supertest';

import { Component } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { localDatabaseOption } from '../../test/local-database.mock';

import { JWT_CONFIG, DATABASE_CONFIG } from '../config';
import { DatabaseModule } from '../database';
import { BCryptModule } from '../bcrypt';

import { UsersModule } from './users.module';
import { UsersService, UsernameAlreadyExist, EmailAlreadyExist } from './users.service';

import { User } from './user.entity';
import { CreateUserDTO } from './dto';
import { Response } from 'supertest';

/**
 * Use a mocking component to get a copy of UsersService
 */
@Component()
export class MockComponent {
  constructor(
    public readonly usersService: UsersService,
  ) { }
}

/**
 * We mock the database backend with SQLite and test endpoint response
 */
describe('UsersController Endpoint', () => {
  const server = express();
  let mockComponent: MockComponent;
  let newUser;

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      modules: [UsersModule],
      components: [MockComponent],
    })
      .overrideComponent(JWT_CONFIG).useValue({
        expiresIn: '6h',
        secretKey: 'i_am_a_secret_key',
      })
      .overrideComponent(DATABASE_CONFIG).useValue({
        ...localDatabaseOption,
        entities: [
          User,
        ],
      })
      .compile();

    mockComponent = testingModule.get<MockComponent>(MockComponent);

    const app = testingModule.createNestApplication(server);
    await app.init();
  });

  it('GET /users should return empty array when there is no users', () => {
    return request(server)
      .get('/users')
      .expect(200)
      .expect([]);
  });

  it('POST /users should be able to create user properly', () => {
    return request(server)
      .post('/users')
      .send({
        commonName: 'Endpoint Test',
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'passw0rd',
      })
      .expect(201)
      .expect((res: Response) => {
        const body = res.body;
        expect(body).toHaveProperty('uuid');
        expect(body).toHaveProperty('commonName', 'Endpoint Test');
        expect(body).toHaveProperty('username', 'testuser');
        expect(body).toHaveProperty('email', 'testuser@example.com');
        expect(body).toHaveProperty('userStatus', 'active');
        expect(body).toHaveProperty('lastUpdate');
        expect(body).toHaveProperty('signupDatetime');
        newUser = body;
      });
  });

  it('POST /users should return 403 when creating duplicate user with same username', () => {
    return request(server)
      .post('/users')
      .send({
        commonName: 'Endpoint Test',
        username: 'testuser',
        email: 'anotheremail@example.com',
        password: 'passw0rd',
      })
      .expect(403)
      .expect((res: Response) => {
        expect(res.body.message).toBe(new UsernameAlreadyExist().message);
      });
  });

  it('POST /users should return 403 when creating duplicate user with same email', () => {
    return request(server)
      .post('/users')
      .send({
        commonName: 'Endpoint Test',
        username: 'anotheruser',
        email: 'testuser@example.com',
        password: 'passw0rd',
      })
      .expect(403)
      .expect((res: Response) => {
        expect(res.body.message).toBe(new EmailAlreadyExist().message);
      });
  });

  it('GET /users/testuser should return the user properly', () => {
    return request(server)
      .get('/users/testuser')
      .expect(200)
      .expect(newUser);
  });

  it('GET /users/testuser should return 404 with inexist username', () => {
    return request(server)
      .get('/users/inexistuser')
      .expect(404)
      .expect((res: Response) => {
        expect(res.body.message).toBe('User does not exist');
      });
  });

  it('GET /users should return array of user', () => {
    return request(server)
      .get('/users')
      .expect(200)
      .expect([newUser]);
  });

  afterAll(async () => {
    const user = await mockComponent.usersService.findByUsername('testuser');
    const deletedUser = await mockComponent.usersService.delete(user);

    expect(deletedUser.uuid).toBeUndefined();
  });
});
