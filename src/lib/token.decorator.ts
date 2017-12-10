import { createRouteParamDecorator } from '@nestjs/common';

/**
 * Function to create RouteParam decorator function, for extracting req.token
 *   from an express request object
 *
 * @param data parameter passed into decorator - not used in this function
 * @param req express request object
 * @return A string containing cookie value if cookieName is specified, otherwise
 *   return the whole req.cookies object
 */
export function extractTokenFunction(data, req): string {
  return req.token;
}

/**
 * An custom decorator to export req.token from express request object
 *   req.token is being populated by express-bearer-token middleware
 *
 * To use this, import { Token } from `./<relative_path>/token.decorator/`
 *
 * @Token() token - Extract req.token
 *
 */
export const Token = createRouteParamDecorator(extractTokenFunction);
