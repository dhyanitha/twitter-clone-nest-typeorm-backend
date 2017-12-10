import {
  Controller,
  Get, Post,
  Param, Body, Headers, Request, Response,
  HttpCode,
  UnauthorizedException,
} from '@nestjs/common';

import { omit } from 'lodash';

import { Cookie, Token, getUserByAuthToken } from '../lib';

import { AuthenticateUserDTO } from './dto';
import { User } from './user.entity';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

/**
 * /auth Endpoint - Authentication endpoint
 * POST /auth/password - Authenticate with password
 * GET /auth/token - Authenticate with bearer token or cookie
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  /**
   * POST Endpoint for user login
   *
   * NOTE: This endpoint uses express response object for handling response as
   *   opposed to the standard method in nestjs, for detail, please refer to
   *   https://docs.nestjs.com/controllers
   *
   * @param authuserDTO Request Body, refer to `dto/authenticate-user.dto.ts`
   * @param res Express response object
   */
  @Post('password')
  async authUser(
    @Body() authuserDTO: AuthenticateUserDTO,
    @Response() res,
  ) {
    const userToken = await this.authService.authenticate(
      authuserDTO.username,
      authuserDTO.password,
    );
    /**
     * Fail the authentication if authService provide an negative response
     * Express response object handling can still catch thrown exception for
     *   error code handling
     */
    if (!userToken) {
      throw new UnauthorizedException('Incorrect username/password');
    }

    /**
     * In actual system, cookie parameter should be moved to configuration,
     *   We should also store a csrf token in the JWT Token, and add an
     *   validation check against X-CSRF-Token header.
     */
    res.status(200).cookie('authToken', userToken, {
      maxAge: 21600000,
      httpOnly: true,
      secure: true,
      domain: '.coeus.hk',
      path: '/',
    }).json({
      status: 'authorized',
      token: userToken,
    });
  }

  /**
   * GET Endpoint for token validation/authentication
   *
   * @param cookie authToken cookie, populated if the client call this endpoint
   *   with cookie, first obtained by cookie-parser middleware then extracted
   *   by Cookie decorator
   *
   * @param token populated from token from authorization header, or query param
   *   `access_token`, first obtained by express-bearer-token middleware then
   *   extracted by Token decorator
   */
  @Get('token')
  async authTokenGET( @Cookie('authToken') cookie, @Token() token) {
    /**
     * `getUserByAuthToken` will throw error and return 401 if the token is invalid
     * This should be moved to a custom decorator or guard in future
     */
    const user = await getUserByAuthToken(this.authService, cookie, token);

    return omit(user, ['hashedPassword']);
  }

  /**
   * POST Endpoint for token validation/authentication
   *
   * @param cookie authToken cookie, populated if the client call this endpoint
   *   with cookie, first obtained by cookie-parser middleware then extracted
   *   by Cookie decorator
   *
   * @param token populated from token from authorization header, or query param
   *   `access_token`, or post body param `access_token` first obtained by
   *   express-bearer-token middleware then extracted by Token decorator
   */
  @HttpCode(200)
  @Post('token')
  async authTokenPOST( @Cookie('authToken') cookie, @Token() token) {
    /**
     * `getUserByAuthToken` will throw error and return 401 if the token is invalid
     * This should be moved to a custom decorator or guard in future
     */
    const user = await getUserByAuthToken(this.authService, cookie, token);

    return omit(user, ['hashedPassword']);
  }
}
