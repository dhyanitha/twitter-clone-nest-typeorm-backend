import { Module } from '@nestjs/common';
import { ConfigModule } from '../config';

import { TypeORMDatabaseProvider } from './typeorm.provider';

/**
 * We are using TypeORM here for database connection, TypeORM is one of the more
 *   mature Object Relational Mapper available, with redis support for caching
 *   query results.
 */
@Module({
  modules: [ConfigModule],
  components: [TypeORMDatabaseProvider],
  exports: [TypeORMDatabaseProvider],
})
export class DatabaseModule {}
