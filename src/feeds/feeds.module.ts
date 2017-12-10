import { Module, NestModule, MiddlewaresConsumer } from '@nestjs/common';
import { CookieParserMiddleware } from '@nest-middlewares/cookie-parser';
import { ExpressBearerTokenMiddleware } from '@nest-middlewares/express-bearer-token';
import { CorsMiddleware } from '@nest-middlewares/cors';

import { BCryptModule } from '../bcrypt';
import { ConfigModule } from '../config';
import { DatabaseModule } from '../database';
import { UsersModule } from '../users';

import { FollowsRepositoryProvider } from './follows-repository.provider';
import { TweetsRepositoryProvider } from './tweets-repository.provider';
import { FollowsService } from './follows.service';
import { TweetsService } from './tweets.service';

import { FeedsController } from './feeds.controller';

@Module({
  modules: [
    BCryptModule,
    ConfigModule,
    DatabaseModule,
    UsersModule,
  ],
  components: [
    FollowsRepositoryProvider,
    TweetsRepositoryProvider,
    FollowsService,
    TweetsService,
  ],
  controllers: [
    FeedsController,
  ],
  exports: [
    FollowsService,
    TweetsService,
  ],
})
export class FeedsModule implements NestModule {
  configure(consumer: MiddlewaresConsumer) {
    consumer.apply([
      CookieParserMiddleware,
      ExpressBearerTokenMiddleware,
      CorsMiddleware,
    ]).forRoutes(
      FeedsController,
    );
  }
}
