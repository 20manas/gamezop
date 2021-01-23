import {describe, expect, test, beforeAll, afterEach} from '@jest/globals'

import * as db from '../loaders/postgres.js';
import * as redis from '../loaders/redis.js';
import * as users from '../services/users.js'

describe('User service tests', () => {
  beforeAll(async () => {
    await db.query('TRUNCATE users');
    await redis.client.flushall();
  });

  afterEach(async () => {
    await db.query('TRUNCATE users');
    await redis.client.flushall();
  });

  test('onNewUserCreated should get user from Redis, add to database and delete key from Redis', async () => {
    const user = {FirstName: 'randomsamplename', LastName: 'randomsamplename', Age: 30};

    const key = 'user:randomuniqueid';
    const value = JSON.stringify(user);

    await redis.client.set(key, value);
    await users.onNewUserCreated(key);

    const result = await db.query('SELECT first_name FROM users WHERE first_name=$1', [user.FirstName]);
    expect(result.rows.length).toBe(1);

    expect(await redis.client.get(key)).toBe(null);
  });
});
