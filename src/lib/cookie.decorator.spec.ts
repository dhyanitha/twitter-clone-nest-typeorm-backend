import { extractCookieFunction } from './cookie.decorator';

describe('@Cookie Decorator function', () => {
  it('should be return empty object when there is req.cookies is undefined', () => {
    const result = extractCookieFunction(undefined, {});
    expect(result).toEqual({});
  });

  it('should be return cookies object when req.cookies is defined and no cookieName is passed in', () => {
    const cookies = {
      foo: 'bar',
    };
    const result = extractCookieFunction(undefined, {
      cookies,
    });
    expect(result).toEqual(cookies);
  });

  it('should be return empty string if cookieName is not found in req.cookies', () => {
    const cookies = {
      foo: 'bar',
    };
    const result = extractCookieFunction('foobar', {
      cookies,
    });
    expect(result).toEqual('');
  });

  it('should be return cookie string if cookieName is found in req.cookies', () => {
    const cookies = {
      foo: 'bar',
    };
    const result = extractCookieFunction('foo', {
      cookies,
    });
    expect(result).toEqual('bar');
  });
});
