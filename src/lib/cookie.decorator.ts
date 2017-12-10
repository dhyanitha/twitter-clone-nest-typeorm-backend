import { createRouteParamDecorator } from '@nestjs/common';

/**
 * Function to create RouteParam decorator function, for extracting req.cookies
 *   from an express request object
 *
 * @param cookieName parameter passed into decorator
 * @param req express request object
 * @return A string containing cookie value if cookieName is specified, otherwise
 *   return the whole req.cookies object
 */
export function extractCookieFunction(cookieName, req): { [cookieKey: string]: string } | string {
  if (!req.cookies) {
    return {};
  } else if (!cookieName) {
    return req.cookies;
  } else if (!req.cookies[cookieName]) {
    return '';
  } else {
    return req.cookies[cookieName];
  }
}

/**
 * Create an custom decorator to export req.cookies from express request object
 *   req.cookies is being populated by cookie-parser middleware
 *
 * To use this, import { Cookie } from `./<relative_path>/cookie.decorator/`
 *
 * @Cookie() cookies - Extract all cookies
 * @Cookie('authToken') - Extract cookie authToken from all cookies
 *
 * @param cookieName <OPTIONAL> cookie name to be extracted
 * @return A string containing cookie value if cookieName is specified, otherwise
 *   return the whole req.cookies object
 */
export const Cookie = createRouteParamDecorator(extractCookieFunction);
