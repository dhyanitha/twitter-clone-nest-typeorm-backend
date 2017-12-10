import {
  Entity,
  PrimaryColumn,
  Column,
  Index,
} from 'typeorm';

/**
 * Follow relations entity
 *
 *         userUuid --follow--> feedOwnerUuid
 *
 * while we are using `userUuid, feedOwnerUuid` as primary key,
 *   we also need to create an index `feedOwnerUuid, userUuid` since indices
 *   are not reversible.
 *
 */
@Entity()
@Index(['feedOwnerUuid', 'userUuid'])
export class Follow {

  /**
   * The follower uuid
   */
  @PrimaryColumn({
    length: 36, // for standard RFC4122 8-4-4-4-12 uuid
  })
  userUuid: string;

  /**
   * The feed owner uuid
   */
  @PrimaryColumn({
    length: 36, // for standard RFC4122 8-4-4-4-12 uuid
  })
  feedOwnerUuid: string;
}
