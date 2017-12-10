import {
  Entity,
  PrimaryColumn,
  Column,
} from 'typeorm';

/**
 * Database object for unit test
 */
@Entity()
export class TestObject {
  @PrimaryColumn()
  key: string;

  @Column()
  value: string;
}
