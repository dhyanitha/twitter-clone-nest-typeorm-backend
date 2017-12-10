import {
  Entity,
  PrimaryGeneratedColumn,
  Generated,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * User Entity, contain user profile and auth information
 * Normally we should split user profile and authentication related information
 *   into separate entity
 *
 */
@Entity()
@Index(['username', 'hashedPassword'])
@Index(['email', 'hashedPassword'])
export class User {

  // Use UUID for user unique ID
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({
    length: 128,
  })
  commonName: string;

  @Column({
    length: 32,
  })
  @Index({ unique: true })
  username: string;

  /**
   * Email address
   * Per RFC 5321 standard, email cannot be longer than 256 character with bracket included
   */
  @Column({
    length: 254,
  })
  @Index({ unique: true })
  email: string;

  /**
   * Hashed password
   * bcrypt hashing result is 60 character in length
   */
  @Column({
    length: 60,
  })
  hashedPassword: string;

  @Column({
    length: 16,
  })
  userStatus: string;

  @CreateDateColumn()
  signupDatetime: string;

  @UpdateDateColumn()
  lastUpdate: string;
}
