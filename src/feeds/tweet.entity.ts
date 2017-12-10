import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity()
export class Tweet {

  /**
   * Use auto increased ID for tweet ID such that we can take advantage of the
   *   id generated in sequence of creation time.
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * User UUID of the tweet owner
   * Standard RFC4122 8-4-4-4-12 uuid is 36 octet in length
   */
  @Column({
    length: 36,
  })
  userUuid: string;

  /**
   * Text content of the tweet
   */
  @Column({
    length: 140,
  })
  content: string;

  @CreateDateColumn()
  tweetDatetime: string;
}
