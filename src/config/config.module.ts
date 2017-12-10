import { Module } from '@nestjs/common';

import { DatabaseConfig } from './database.config';
import { JWTConfig } from './jwt.config';

/**
 * This module provides a configuration for the whole backend
 */
@Module({
  components: [DatabaseConfig, JWTConfig],
  exports: [DatabaseConfig, JWTConfig],
})
export class ConfigModule { }
