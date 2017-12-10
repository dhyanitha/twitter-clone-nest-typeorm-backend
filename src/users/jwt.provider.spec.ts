import { JsonWebTokenProvider } from './jwt.provider';

describe('JsonWebTokenProvider', () => {
  it('should be able to get jwt library', () => {
    const jwt = JsonWebTokenProvider.useFactory();
  });
});
