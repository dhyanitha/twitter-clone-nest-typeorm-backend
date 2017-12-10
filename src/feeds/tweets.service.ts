import { Inject, Component } from '@nestjs/common';
import { Repository } from 'typeorm';

import { TWEETS_REPOSITORY } from './tweets-repository.provider';

import { Tweet } from './tweet.entity';

/**
 * Service for Create and list tweets in feed
 */
@Component()
export class TweetsService {
  constructor(
    @Inject(TWEETS_REPOSITORY) private readonly tweetsRepository: Repository<Tweet>,
  ) { }

  /**
   * Insert a tweet into db
   *
   * @param tweet Tweet object to be created
   * @return <Promise> `Tweet` created
   */
  async create(tweet: Tweet) {
    return await this.tweetsRepository.save(tweet);
  }

  /**
   * List tweets of a user from db with latest tweets first
   * There seems to be some issues with TypeORM with DateTime handling with regard
   *   when you do query with datetime_field < :datetime_param, should revisit
   *   and refactor in future
   *
   * @param userUuid userUuid of the feed
   * @param fromId start query less than the id specified
   * @return <Promise> An array of `Tweet` entities from the database
   */
  async findTweets(
    userUuid: string,
    fromId: number,
    limit: number = 20,
  ) {
    let queryBuilder = this.tweetsRepository
      .createQueryBuilder('tweet')
      .where('tweet.userUuid = :userUuid', { userUuid });

    /**
     * If fromId is specified, we add one more where clause
     */
    if (fromId) {
      queryBuilder = queryBuilder.andWhere('tweet.id <= :fromId', { fromId });
    }

    return queryBuilder
      .orderBy('tweetDatetime', 'DESC')
      .limit(limit)
      .cache(5000) // use cache for 5 seconds
      .getManyAndCount();
  }

  /**
   * List tweets of multiple users from db with latest tweets first
   * There seems to be some issues with TypeORM with DateTime handling with regard
   *   when you do query with datetime_field < :datetime_param, should revisit
   *   and refactor in future
   *
   * @param userUuids Array of userUuid of the feed
   * @param fromId start query less than the id specified
   * @return <Promise> An array of `Tweet` entities from the database
   */
  async findTweetsMultipleUsers(
    userUuids: string[],
    fromId: number,
    limit: number = 50,
  ) {
    let queryBuilder = this.tweetsRepository
      .createQueryBuilder('tweet')
      .where('tweet.userUuid IN (:userUuids)', { userUuids });

    /**
     * If fromId is specified, we add one more where clause
     */
    if (fromId) {
      queryBuilder = queryBuilder.andWhere('tweet.id <= :fromId', { fromId });
    }

    return queryBuilder
      .orderBy('tweetDatetime', 'DESC')
      .limit(limit)
      .cache(5000) // use cache for 5 seconds
      .getManyAndCount();
  }

  /**
   * Get tweet by tweetUuid
   *
   * @param uuid `uuid` of the tweet
   * @return <Promise> `Tweet` found from database, the promise will be resolved
   *   to `undefined` if the tweet's uuid was not found
   */
  async findTweet(id: number) {
    return await this.tweetsRepository.findOne({
      where: { id },
      cache: 43200000,  // use cache for 12 hours since tweets will not be edited
    });
  }
}
