export const JWT_CONFIG = 'jwtConfig';

/**
 * Configuration for JWT
 * TODO: should move this to a configuration file instead
 */
export const JWTConfig = {
  provide: JWT_CONFIG,
  useValue: {
    /**
     * expiresIn: Default token expiry time
     */
    expiresIn: '6h',

    /**
     * secretKey: SecretKey for signing JWT
     */
    secretKey: 'i_am_a_secret_key',
  },
};
