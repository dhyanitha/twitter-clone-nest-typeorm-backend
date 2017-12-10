import { Module, NestModule, MiddlewaresConsumer } from '@nestjs/common';
import { CookieParserMiddleware } from '@nest-middlewares/cookie-parser';
import { ExpressBearerTokenMiddleware } from '@nest-middlewares/express-bearer-token';
import { CorsMiddleware } from '@nest-middlewares/cors';

import { BCryptModule } from '../bcrypt';
import { ConfigModule } from '../config';
import { DatabaseModule } from '../database';

import { AuthService } from './auth.service';
import { JsonWebTokenProvider } from './jwt.provider';
import { UsersRepositoryProvider } from './users-repository.provider';
import { UsersService } from './users.service';

import { AuthController } from './auth.controller';
import { UsersController } from './users.controller';

@Module({
  modules: [
    BCryptModule,
    ConfigModule,
    DatabaseModule,
  ],
  components: [
    AuthService,
    JsonWebTokenProvider,
    UsersRepositoryProvider,
    UsersService,
  ],
  controllers: [
    AuthController,
    UsersController,
  ],
  exports: [
    AuthService,
    UsersService,
  ],
})
export class UsersModule implements NestModule {
  configure(consumer: MiddlewaresConsumer) {
    consumer.apply([
      CookieParserMiddleware,
      ExpressBearerTokenMiddleware,
      CorsMiddleware,
    ]).forRoutes(
      UsersController,
      AuthController,
    );
  }
}
