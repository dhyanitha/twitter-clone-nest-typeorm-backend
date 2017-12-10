import { Inject, Component } from '@nestjs/common';
import { Repository } from 'typeorm';

import { FOLLOWS_REPOSITORY } from './follows-repository.provider';

import { Follow } from './follow.entity';

/**
 * Service for Create/List/Remove follow relationship
 */
@Component()
export class FollowsService {
  constructor(
    @Inject(FOLLOWS_REPOSITORY) private readonly followsRepository: Repository<Follow>,
  ) { }

  /**
   * Insert following relationship into db, this is a low level function and
   *   assume both uuid are validated
   *
   * @param userUuid userUUID of the follower
   * @param feedOwnerUuid userUUID of the feed owner
   */
  async create(userUuid: string, feedOwnerUuid: string): Promise<Follow> {
    const follow: Follow = new Follow();
    return await this.followsRepository.save({
      userUuid,
      feedOwnerUuid,
    });
  }

  /**
   * Remove following relationship from db, this is a low level function and
   *   assume the follow relationship exist in db
   *
   * @param userUuid userUUID of the follower
   * @param feedOwnerUuid userUUID of the feed owner
   */
  async remove(userUuid: string, feedOwnerUuid: string) {
    return await this.followsRepository.delete({
      userUuid,
      feedOwnerUuid,
    });
  }

  /**
   * List all **follows** of a user
   *
   * @param userUuid userUUID of the follower
   */
  async listFollows(userUuid: string, cache: number = 5000) {
    return await this.followsRepository
      .createQueryBuilder('follow')
      .where('follow.userUuid = :userUuid', { userUuid })
      .cache(cache)
      .getManyAndCount();
  }

  /**
   * List all **followers** of a user
   *
   * @param feedOwnerUuid userUUID of the feed owner
   */
  async listFollowers(feedOwnerUuid: string, cache: number = 5000) {
    return await this.followsRepository
      .createQueryBuilder('follow')
      .where('follow.feedOwnerUuid = :feedOwnerUuid', { feedOwnerUuid })
      .cache(cache)
      .getManyAndCount();
  }

  /**
   * Check if the user is following the feed owner
   *
   * @param userUuid userUUID of the follower
   * @param feedOwnerUuid userUUID of the feed owner
   */
  async isFollowing(userUuid: string, feedOwnerUuid: string, cache: number = 5000): Promise<boolean> {
    const follow: Follow = await this.followsRepository.findOne({
      where: {
        userUuid,
        feedOwnerUuid,
      },
      cache,
    });
    return Boolean(follow);
  }
}
