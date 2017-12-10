import { Controller,
  Get, Post, Put, Delete,
  Param, Body, Query,
  UnauthorizedException, ForbiddenException, NotFoundException,
} from '@nestjs/common';
import { Cookie, Token, getUserByAuthToken } from '../lib';

import { AuthService, User, UsersService } from '../users';

import { Tweet } from './tweet.entity';
import { Follow } from './follow.entity';
import { TweetsService } from './tweets.service';
import { FollowsService } from './follows.service';
import { CreateTweetDTO } from './dto/create-tweet.dto';

/**
 * /feeds Endpoint - Feed endpoint
 *
 * POST /feeds - Create tweet to your feed
 * GET /feeds - Get tweets from subscribed feeds
 * GET /feeds/following - Get list followed feed
 * GET /feeds/followers - Get list of followers
 * GET /feeds/user/:username - Get all tweet from username
 * PUT /feeds/user/:username - Follow Feed
 * DELETE /feeds/user/:username - Unfollow Feed
 *
 */
@Controller('feeds')
export class FeedsController {
  constructor(
    private readonly tweetsService: TweetsService,
    private readonly followsService: FollowsService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) { }

  /**
   * POST /feeds - Create tweet to your feed
   *
   * @param cookie authToken cookie, populated if the client call this endpoint
   *   with cookie, first obtained by cookie-parser middleware then extracted
   *   by Cookie decorator
   *
   * @param token populated from token from authorization header, or query param
   *   `access_token`, or tweet body param `access_token` first obtained by
   *   express-bearer-token middleware then extracted by Token decorator
   *
   * @param createTweetDTO Request Body, refer to `dto/create-tweet.dto.ts`
   */
  @Post()
  async createTweet(
    @Cookie('authToken') cookie,
    @Token() token,
    @Body() createTweetDTO: CreateTweetDTO,
  ) {
    /**
     * `getUserByAuthToken` will throw error and return 401 if the token is invalid
     * This should be moved to a custom decorator or guard in future
     */
    const user = await getUserByAuthToken(this.authService, cookie, token);

    const newTweet = new Tweet();
    newTweet.userUuid = user.uuid;
    newTweet.content = createTweetDTO.content;

    return await this.tweetsService.create(newTweet);
  }

  /**
   * GET /feeds - Get tweets from subscribed feeds
   *
   * @param cookie authToken cookie, populated if the client call this endpoint
   *   with cookie, first obtained by cookie-parser middleware then extracted
   *   by Cookie decorator
   *
   * @param token populated from token from authorization header, or query param
   *   `access_token`, or tweet body param `access_token` first obtained by
   *   express-bearer-token middleware then extracted by Token decorator
   *
   */
  @Get()
  async getTweets(
    @Cookie('authToken') cookie,
    @Token() token,
    @Query('b') before,
  ) {
    /**
     * `getUserByAuthToken` will throw error and return 401 if the token is invalid
     * This should be moved to a custom decorator or guard in future
     */
    const user = await getUserByAuthToken(this.authService, cookie, token);

    /**
     * First, obtain a list of followed feed
     */
    const [feedUuids, feedCount] = await this.followsService.listFollows(user.uuid);

    const [tweets, tweetCount] = await this.tweetsService.findTweetsMultipleUsers(
      feedUuids.map((f: Follow) => f.feedOwnerUuid),
      before,
    );

    return {
      tweets,
      count: tweetCount,
    };
  }

  /**
   * GET /feeds/following - Get list followed feed
   *
   * @param cookie authToken cookie, populated if the client call this endpoint
   *   with cookie, first obtained by cookie-parser middleware then extracted
   *   by Cookie decorator
   *
   * @param token populated from token from authorization header, or query param
   *   `access_token`, or tweet body param `access_token` first obtained by
   *   express-bearer-token middleware then extracted by Token decorator
   *
   */
  @Get('following')
  async getFollowing(
    @Cookie('authToken') cookie,
    @Token() token,
  ) {
    /**
     * `getUserByAuthToken` will throw error and return 401 if the token is invalid
     * This should be moved to a custom decorator or guard in future
     */
    const user = await getUserByAuthToken(this.authService, cookie, token);

    const [following, count] = await this.followsService.listFollows(user.uuid, 0);

    return {
      /**
       * Unsure if aggressively getting cached user from redis be faster than
       *   joining table, evaluate, optimize or even refactor if needed
       */
      following: await Promise.all(
        /**
         * Since this is a list that the user is following, resolving the actual
         *   user profile by feedOwnerUuid
         */
        following.map((follow: Follow) => this.usersService.findByUuid(follow.feedOwnerUuid)),
      ),
      count,
    };
  }

  /**
   * GET /feeds/followers - Get list of followers
   *
   * @param cookie authToken cookie, populated if the client call this endpoint
   *   with cookie, first obtained by cookie-parser middleware then extracted
   *   by Cookie decorator
   *
   * @param token populated from token from authorization header, or query param
   *   `access_token`, or tweet body param `access_token` first obtained by
   *   express-bearer-token middleware then extracted by Token decorator
   *
   */
  @Get('followers')
  async getFollowers(
    @Cookie('authToken') cookie,
    @Token() token,
  ) {
    /**
     * `getUserByAuthToken` will throw error and return 401 if the token is invalid
     * This should be moved to a custom decorator or guard in future
     */
    const user = await getUserByAuthToken(this.authService, cookie, token);

    const [followers, count] = await this.followsService.listFollowers(user.uuid, 0);

    return {
      /**
       * Unsure if aggressively getting cached user from redis be faster than
       *   joining table, evaluate, optimize or even refactor if needed
       */
      followers: await Promise.all(
        /**
         * Since this is a list with all the followers, resolving the actual
         *   follower user profile by userUuid
         */
        followers.map((follow: Follow) => this.usersService.findByUuid(follow.userUuid)),
      ),
      count,
    };
  }

  /**
   * GET /feeds/user/:username - Get tweet from username
   *
   * @param cookie authToken cookie, populated if the client call this endpoint
   *   with cookie, first obtained by cookie-parser middleware then extracted
   *   by Cookie decorator
   *
   * @param token populated from token from authorization header, or query param
   *   `access_token`, or tweet body param `access_token` first obtained by
   *   express-bearer-token middleware then extracted by Token decorator
   *
   */
  @Get('user/:username')
  async getFeedByUsername(
    @Cookie('authToken') cookie,
    @Token() token,
    @Param('username') username,
    @Query('b') before,
  ) {
    /**
     * `getUserByAuthToken` will throw error and return 401 if the token is invalid
     * This should be moved to a custom decorator or guard in future
     */
    const user = await getUserByAuthToken(this.authService, cookie, token);
    const feedUser = await this.usersService.findByUsername(username);

    if (user.uuid !== feedUser.uuid) {
      /**
       * Check if the user is subscribed to the feed owner
       */
      const [following] = await this.followsService.listFollows(user.uuid, 0);
      if (following.findIndex((value: Follow) => value.feedOwnerUuid === feedUser.uuid) === -1) {
        throw new ForbiddenException('Not following feed owner');
      }
    }

    const [tweets, tweetCount] = await this.tweetsService.findTweets(feedUser.uuid, before);

    return {
      tweets,
      count: tweetCount,
    };
  }

  /**
   * PUT /feeds/user/:username - Follow Feed
   *
   * @param cookie authToken cookie, populated if the client call this endpoint
   *   with cookie, first obtained by cookie-parser middleware then extracted
   *   by Cookie decorator
   *
   * @param token populated from token from authorization header, or query param
   *   `access_token`, or tweet body param `access_token` first obtained by
   *   express-bearer-token middleware then extracted by Token decorator
   *
   */
  @Put('user/:username')
  async followFeedByUsername(
    @Cookie('authToken') cookie,
    @Token() token,
    @Param('username') username,
  ) {
    /**
     * `getUserByAuthToken` will throw error and return 401 if the token is invalid
     * This should be moved to a custom decorator or guard in future
     */
    const user = await getUserByAuthToken(this.authService, cookie, token);
    const feedOwner = await this.usersService.findByUsername(username);

    return await this.followsService.create(user.uuid, feedOwner.uuid);
  }

  /**
   * DELETE /feeds/user/:username - Unfollow Feed
   *
   * @param cookie authToken cookie, populated if the client call this endpoint
   *   with cookie, first obtained by cookie-parser middleware then extracted
   *   by Cookie decorator
   *
   * @param token populated from token from authorization header, or query param
   *   `access_token`, or tweet body param `access_token` first obtained by
   *   express-bearer-token middleware then extracted by Token decorator
   *
   */
  @Delete('user/:username')
  async unfollowFeedByUsername(
    @Cookie('authToken') cookie,
    @Token() token,
    @Param('username') username,
  ) {
    /**
     * `getUserByAuthToken` will throw error and return 401 if the token is invalid
     * This should be moved to a custom decorator or guard in future
     */
    const user = await getUserByAuthToken(this.authService, cookie, token);
    const feedOwner = await this.usersService.findByUsername(username);

    return await this.followsService.remove(user.uuid, feedOwner.uuid);
  }
}
