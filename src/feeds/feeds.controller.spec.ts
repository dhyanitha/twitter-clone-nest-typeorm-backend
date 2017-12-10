import * as jwt from 'jsonwebtoken';
import { ForbiddenException } from '@nestjs/common';

import { AuthService, User, UsersService } from '../users';

import { Tweet } from './tweet.entity';
import { Follow } from './follow.entity';

import { FeedsController } from './feeds.controller';
import { FollowsService } from './follows.service';
import { TweetsService } from './tweets.service';

export const mockUser: User = {
  ...(new User()),
  uuid: '00000000-0000-0000-0000-000000000000',
  commonName: 'Test User',
  username: 'mockuser',
  email: 'testuser@example.com',
};

export const mockFeedOwnerA: User = {
  ...(new User()),
  uuid: '00000000-0000-0000-0000-000000000001',
  commonName: 'Owner A',
  username: 'ownerA',
  email: 'ownera@example.com',
};

export const mockFeedOwnerB: User = {
  ...(new User()),
  uuid: '00000000-0000-0000-0000-000000000002',
  commonName: 'Owner B',
  username: 'ownerB',
  email: 'ownerb@example.com',
};

export const userFollowing: Follow[] = [
  { userUuid: '00000000-0000-0000-0000-000000000000', feedOwnerUuid: '00000000-0000-0000-0000-000000000001' },
  { userUuid: '00000000-0000-0000-0000-000000000000', feedOwnerUuid: '00000000-0000-0000-0000-000000000002' },
];

export const userFollower: Follow[] = [
  { userUuid: '00000000-0000-0000-0000-000000000002', feedOwnerUuid: '00000000-0000-0000-0000-000000000000' },
];

export const mockTweetsByOwnerA: Tweet[] = [
  {
    id: 4,
    userUuid: '00000000-0000-0000-0000-000000000001',
    content: 'Hello World from Today',
    tweetDatetime: new Date(Date.now()).toUTCString(),
  },
  {
    id: 1,
    userUuid: '00000000-0000-0000-0000-000000000001',
    content: 'Hello World from Yesterday',
    tweetDatetime: new Date(Date.now() - 86400000).toUTCString(),
  },
];

export const mockTweetsByMultipleOwner: Tweet[] = [
  mockTweetsByOwnerA[0],
  {
    id: 3,
    userUuid: '00000000-0000-0000-0000-000000000002',
    content: 'Hello from 6 hours ago',
    tweetDatetime: new Date(Date.now() - 21600000).toUTCString(),
  },
  {
    id: 2,
    userUuid: '00000000-0000-0000-0000-000000000002',
    content: 'Hello from 12 hours ago',
    tweetDatetime: new Date(Date.now() - 43200000).toUTCString(),
  },
  mockTweetsByOwnerA[1],
];

describe('FeedsController', () => {
  let feedController: FeedsController;
  let authService: AuthService;
  let usersService: UsersService;
  let followsService: FollowsService;
  let tweetsService: TweetsService;

  /**
   * Setup all services and controller fresh for each test so that we can mock
   *   their public function response
   */
  beforeEach(() => {
    authService = new AuthService(undefined, undefined, undefined);
    usersService = new UsersService(undefined, undefined);
    followsService = new FollowsService(undefined);
    tweetsService = new TweetsService(undefined);
    feedController = new FeedsController(tweetsService, followsService, authService, usersService);

    /**
     * Authentication will always be successful
     */
    jest.spyOn(authService, 'validateToken').mockReturnValue(Promise.resolve(mockUser));

    /**
     * Mock users service
     */
    jest.spyOn(usersService, 'findByUuid').mockImplementation(async (userUuid) => {
      switch (userUuid) {
        case mockUser.uuid:
          return mockUser;
        case mockFeedOwnerA.uuid:
          return mockFeedOwnerA;
        case mockFeedOwnerB.uuid:
          return mockFeedOwnerB;
      }
    });

    jest.spyOn(usersService, 'findByUsername').mockImplementation(async (userUuid) => {
      switch (userUuid) {
        case mockUser.username:
          return mockUser;
        case mockFeedOwnerA.username:
          return mockFeedOwnerA;
        case mockFeedOwnerB.username:
          return mockFeedOwnerB;
      }
    });
  });

  describe('createTweet',  () => {
    it('should be able to create tweet properly', async () => {
      jest.spyOn(tweetsService, 'create').mockReturnValue(Promise.resolve(mockTweetsByOwnerA[0]));

      expect(await feedController.createTweet(undefined, undefined, {
        content: mockTweetsByOwnerA[0].content,
      })).toEqual(mockTweetsByOwnerA[0]);
    });
  });

  describe('getTweets',  () => {
    it('should be able to get tweets properly', async () => {
      jest.spyOn(followsService, 'listFollows').mockReturnValue(Promise.resolve([
        userFollowing,
        userFollowing.length,
      ]));

      jest.spyOn(tweetsService, 'findTweetsMultipleUsers').mockReturnValue(Promise.resolve([
        mockTweetsByMultipleOwner,
        mockTweetsByMultipleOwner.length,
      ]));

      expect(await feedController.getTweets(undefined, undefined, undefined)).toEqual({
        tweets: mockTweetsByMultipleOwner,
        count: mockTweetsByMultipleOwner.length,
      });
    });
  });

  describe('getFollowing',  () => {
    it('should be able to get following feeds properly', async () => {
      jest.spyOn(followsService, 'listFollows').mockReturnValue(Promise.resolve([
        userFollowing,
        userFollowing.length,
      ]));

      expect(await feedController.getFollowing(undefined, undefined)).toEqual({
        following: [
          mockFeedOwnerA,
          mockFeedOwnerB,
        ],
        count: 2,
      });
    });
  });

  describe('getFollowers', () => {
    it('should be able to get follower properly', async () => {
      jest.spyOn(followsService, 'listFollowers').mockReturnValue(Promise.resolve([
        userFollower,
        userFollower.length,
      ]));

      expect(await feedController.getFollowers(undefined, undefined)).toEqual({
        followers: [
          mockFeedOwnerB,
        ],
        count: 1,
      });
    });
  });

  describe('getFeedByUsername',  () => {
    it('should be able to get feed followed by the user', async () => {
      jest.spyOn(followsService, 'listFollows').mockReturnValue(Promise.resolve([
        userFollowing,
        userFollowing.length,
      ]));

      jest.spyOn(tweetsService, 'findTweets').mockReturnValue(Promise.resolve([
        mockTweetsByOwnerA,
        mockTweetsByOwnerA.length,
      ]));

      expect(await feedController.getFeedByUsername(undefined, undefined, mockFeedOwnerA.username, undefined))
        .toEqual({
          tweets: mockTweetsByOwnerA,
          count: mockTweetsByOwnerA.length,
        });
    });

    it('should throw ForbiddenException if the user is not following the feed owner', () => {
      jest.spyOn(followsService, 'listFollows').mockReturnValue(Promise.resolve([
        [userFollowing[1]], // ownerB only
        1,
      ]));

      return feedController.getFeedByUsername(undefined, undefined, mockFeedOwnerA.username, undefined)
        .then(() => expect(true).toBeFalsy())
        .catch((err) => {
          expect(err).toBeInstanceOf(ForbiddenException);
          expect(err.response.message).toEqual('Not following feed owner');
        });
    });
  });

  describe('followFeedByUsername',  () => {
    it('should be able to follow feed by username', async () => {
      jest.spyOn(followsService, 'create').mockReturnValue(Promise.resolve(userFollowing[0]));

      expect(await feedController.followFeedByUsername(undefined, undefined, mockFeedOwnerA.username))
        .toEqual(userFollowing[0]);
    });
  });

  describe('unfollowFeedByUsername',  () => {
    it('should be able to unfollow feed by username', async () => {
      jest.spyOn(followsService, 'remove').mockReturnValue(Promise.resolve(userFollowing[0]));

      expect(await feedController.unfollowFeedByUsername(undefined, undefined, mockFeedOwnerA.username))
        .toEqual(userFollowing[0]);
    });
  });
});
