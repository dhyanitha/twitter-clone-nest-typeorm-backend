import { Module } from '@nestjs/common';

import { UsersModule } from './users';
import { FeedsModule } from './feeds';

@Module({
  modules: [UsersModule, FeedsModule],
})
export class ApplicationModule { }
