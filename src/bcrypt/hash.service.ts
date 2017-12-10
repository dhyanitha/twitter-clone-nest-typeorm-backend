import {
  Component,
  Inject,
} from '@nestjs/common';

import { hash, compare } from 'bcryptjs';

import { SALT_GENERATOR } from './salt.provider';

/**
 * Password hashing service for injecting into nest application
 */
@Component()
export class HashService {
  constructor(
    @Inject(SALT_GENERATOR) private readonly salt: string,
  ) {}

  /**
   * Asynchronously generate a salted hash for a given string
   *
   * @param s String to be hashed
   * @return <Promise> hashed value of the given string
   */
  hash(s: string): Promise<string> {
    return hash(s, this.salt);
  }

  /**
   * Asynchronously check if the given hash is hashed from the given string
   *
   * @param s String to be compared with the hashed string
   * @param hashedString Hashed string to be compared
   * @return <Promise> boolean of the comparison result
   */
  compare(s: string, hashedString: string): Promise<boolean> {
    return compare(s, hashedString);
  }
}
