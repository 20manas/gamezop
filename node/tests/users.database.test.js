import {describe, expect, test, beforeAll, afterEach} from '@jest/globals'

import * as db from '../loaders/postgres.js';
import * as usersdb from '../database/users.js'

describe('User table tests', () => {
  beforeAll(async () => {
    await db.query('TRUNCATE users');
  });

  afterEach(async () => {
    await db.query('TRUNCATE users');
  });

  test('Should add new user', async () => {
    const first_name = 'randomsameplename';
    const last_name = 'randomsamplename';
    const age = 30;

    await usersdb.addNewUser(first_name, last_name, age);

    const result = await db.query('SELECT first_name FROM users WHERE first_name=$1', [first_name]);
    expect(result.rows.length).toBe(1);
  });

  test('Should retrieve user', async () => {
    const first_name = 'randomsamplename';
    const last_name = 'randomsamplename';
    const age = 30;

    await db.query('INSERT INTO users VALUES ($1, $2, $3)', [first_name, last_name, age]);

    const data = await usersdb.getUsersByFirstName(first_name);

    expect(data.length).toBe(1);
  });
});
