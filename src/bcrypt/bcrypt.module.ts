import { Module } from '@nestjs/common';
import { SaltGeneratorProvider } from './salt.provider';
import { HashService } from './hash.service';

/**
 * This module provides a hashing function to other modules for hashing password
 */
@Module({
  components: [SaltGeneratorProvider, HashService],
  exports: [HashService],
})
export class BCryptModule { }
