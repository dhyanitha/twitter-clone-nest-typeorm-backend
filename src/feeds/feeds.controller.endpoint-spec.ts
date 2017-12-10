import * as express from 'express';
import * as request from 'supertest';

import { Component } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { localDatabaseOption } from '../../test/local-database.mock';

import { JWT_CONFIG, DATABASE_CONFIG } from '../config';
import { DatabaseModule } from '../database';
import { BCryptModule } from '../bcrypt';

import { User, UsersModule, AuthService, UsersService } from '../users';

import { Follow, Tweet, FeedsModule } from './';

import { Response } from 'supertest';

/**
 * Use a mocking component to get a copy of UsersService
 */
@Component()
export class MockComponent {
  constructor(
    public readonly usersService: UsersService,
    public readonly authService: AuthService,
  ) { }
}

/**
 * We mock the database backend with SQLite, so that we can test endpoint response
 */
describe('FeedController Endpoint', () => {
  const server = express();
  let mockComponent: MockComponent;
  const testUser: any = {};
  const feedOwnerA: any = {};
  const feedOwnerB: any = {};

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      modules: [UsersModule, FeedsModule],
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
          Tweet,
          Follow,
        ],
      })
      .compile();

    mockComponent = testingModule.get<MockComponent>(MockComponent);

    const app = testingModule.createNestApplication(server);
    await app.init();

    /**
     * Create test users
     */
    testUser.userObj = await mockComponent.usersService.createUser({
      commonName: 'Endpoint Test User',
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'passw0rd',
    });

    feedOwnerA.userObj = await mockComponent.usersService.createUser({
      commonName: 'Alpha',
      username: 'alpha',
      email: 'alpha@example.com',
      password: 'passw0rd',
    });

    feedOwnerB.userObj = await mockComponent.usersService.createUser({
      commonName: 'Bravo',
      username: 'bravo',
      email: 'bravo@example.com',
      password: 'passw0rd',
    });

    /**
     * Obtain JWT token for API calls
     */
    testUser.token = await mockComponent.authService.authenticate(
      testUser.userObj.username,
      'passw0rd',
    );

    feedOwnerA.token = await mockComponent.authService.authenticate(
      feedOwnerA.userObj.username,
      'passw0rd',
    );

    feedOwnerB.token = await mockComponent.authService.authenticate(
      feedOwnerB.userObj.username,
      'passw0rd',
    );
  });

  it('POST /feeds should be able to post new post', () => {
    return request(server)
      .post('/feeds')
      .set('Cookie', `authToken=${feedOwnerA.token}`)
      .send({
        content: 'First Post!',
      })
      .expect(201)
      .expect((res: any) => {
        expect(res.body).toHaveProperty('userUuid', feedOwnerA.userObj.uuid);
        expect(res.body).toHaveProperty('content', 'First Post!');
      });
  });

  it('GET /feeds/user/:username should be able to get latest post of the owner themselves', () => {
    return request(server)
      .get(`/feeds/user/${feedOwnerA.userObj.username}`)
      .set('Cookie', `authToken=${feedOwnerA.token}`)
      .expect(200)
      .expect((res: any) => {
        expect(res.body.tweets[0]).toHaveProperty('content', 'First Post!');
      });
  });

  it('GET /feeds/user/:username should not be able to get feed of unfollowed owner', () => {
    return request(server)
      .get(`/feeds/user/${feedOwnerA.userObj.username}`)
      .set('Cookie', `authToken=${testUser.token}`)
      .expect(403)
      .expect((res: any) => {
        expect(res.body.message).toEqual('Not following feed owner');
      });
  });

  it('PUT /feeds/user/:username should follow the owner', () => {
    return request(server)
      .put(`/feeds/user/${feedOwnerA.userObj.username}`)
      .set('Cookie', `authToken=${testUser.token}`)
      .expect(200)
      .expect((res: any) => {
        expect(res.body).toEqual({
          userUuid: testUser.userObj.uuid,
          feedOwnerUuid: feedOwnerA.userObj.uuid,
        });
      });
  });

  it('POST /feeds should be able to post new post (ownerB)', () => {
    return request(server)
      .post('/feeds')
      .set('Cookie', `authToken=${feedOwnerB.token}`)
      .send({
        content: 'First Post Bravo!!',
      })
      .expect(201)
      .expect((res: any) => {
        expect(res.body).toHaveProperty('userUuid', feedOwnerB.userObj.uuid);
        expect(res.body).toHaveProperty('content', 'First Post Bravo!!');
      });
  });

  it('GET /feeds/user/:username should be able to get feed of followed owner', () => {
    return request(server)
      .get(`/feeds/user/${feedOwnerA.userObj.username}`)
      .set('Cookie', `authToken=${testUser.token}`)
      .expect(200)
      .expect((res: any) => {
        expect(res.body.tweets[0]).toHaveProperty('content', 'First Post!');
      });
  });

  it('PUT /feeds/user/:username should follow the owner bravo', () => {
    return request(server)
      .put(`/feeds/user/${feedOwnerB.userObj.username}`)
      .set('Cookie', `authToken=${testUser.token}`)
      .expect(200)
      .expect((res: any) => {
        expect(res.body).toEqual({
          userUuid: testUser.userObj.uuid,
          feedOwnerUuid: feedOwnerB.userObj.uuid,
        });
      });
  });

  it('GET /feeds should be able to get feeds of both subscribed user', () => {
    return request(server)
      .get(`/feeds`)
      .set('Cookie', `authToken=${testUser.token}`)
      .expect(200)
      .expect((res: any) => {
        expect(res.body.tweets[0]).toHaveProperty('content', 'First Post Bravo!!');
        expect(res.body.tweets[1]).toHaveProperty('content', 'First Post!');
      });
  });

  afterAll(async () => {
    await mockComponent.usersService.delete(testUser.userObj);
    await mockComponent.usersService.delete(feedOwnerA.userObj);
    await mockComponent.usersService.delete(feedOwnerB.userObj);
  });
});
