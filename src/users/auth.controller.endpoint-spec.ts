import * as express from 'express';
import * as request from 'supertest';

import { Component } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { localDatabaseOption } from '../../test/local-database.mock';

import { JWT_CONFIG, DATABASE_CONFIG } from '../config';
import { DatabaseModule } from '../database';
import { BCryptModule } from '../bcrypt';

import { UsersModule } from './users.module';
import { UsersService } from './users.service';

import { User } from './user.entity';
import { AuthenticateUserDTO } from './dto';
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
 * We mock the database backend with SQLite, so that we can test endpoint response
 */
describe('AuthController Endpoint', () => {
  const server = express();
  let mockComponent: MockComponent;
  let newUser: User;
  let token: string;

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

    newUser = await mockComponent.usersService.createUser({
      commonName: 'Endpoint Test',
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'passw0rd',
    });
  });

  it('POST /auth/password should return 401 when logging in with incorrect username/password', () => {
    return request(server)
      .post('/auth/password')
      .send({
        username: 'inexistUser',
        password: 'inc0rrect',
      })
      .expect(401)
      .expect((res: any) => {
        expect(res.body.message).toBe('Incorrect username/password');
      });
  });

  it('POST /auth/password should return JWT token with set cookie header with correct username/password', () => {
    return request(server)
      .post('/auth/password')
      .send({
        username: 'testuser',
        password: 'passw0rd',
      })
      .expect(200)
      .expect((res: any) => {
        expect(res.body).toHaveProperty('status', 'authorized');
        expect(res.body).toHaveProperty('token');
        token = res.body.token;
        expect(res.headers['set-cookie'][0]).toContain(`authToken=${token}`);
      });
  });

  it('GET /auth/token should handle validation request properly', () => {
    return request(server)
      .get('/auth/token')
      .set('Cookie', `authToken=${token}`)
      .expect(200)
      .expect((res: any) => {
        expect(res.body).toHaveProperty('commonName', 'Endpoint Test');
        expect(res.body).toHaveProperty('username', 'testuser');
        expect(res.body).toHaveProperty('email', 'testuser@example.com');
      });
  });

  it('POST /auth/token should handle validation request properly', () => {
    return request(server)
      .post('/auth/token')
      .send({
        access_token: token,
      })
      .expect(200)
      .expect((res: any) => {
        expect(res.body).toHaveProperty('commonName', 'Endpoint Test');
        expect(res.body).toHaveProperty('username', 'testuser');
        expect(res.body).toHaveProperty('email', 'testuser@example.com');
      });
  });

  it('GET/POST /auth/token should return 401 when token is invalid', () => {
    return request(server)
      .post('/auth/token')
      .expect(401)
      .expect((res: any) => {
        expect(res.body.message).toBe('Invalid token');
      });
  });

  afterAll(async () => {
    const deletedUser = await mockComponent.usersService.delete(newUser);
    expect(deletedUser.uuid).toBeUndefined();
  });
});
