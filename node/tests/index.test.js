import {describe, expect, test, beforeAll, afterEach} from '@jest/globals'
import request from 'supertest';

import {server} from '../index';
import * as db from '../loaders/postgres.js';
import * as redis from '../loaders/redis.js';

describe('Server tests', () => {
  beforeAll(async () => {
    await db.query('TRUNCATE users');
    await redis.client.flushall();
  });

  afterEach(async () => {
    await db.query('TRUNCATE users');
    await redis.client.flushall();
  });

  test('Retrieves details of user', async (done) => {
    const first_name = 'randomsamplename';
    const last_name = 'randomsamplename';
    const age = 30;

    await db.query('INSERT INTO users VALUES ($1, $2, $3)', [first_name, last_name, age]);

    request(server).get(`/?user=${first_name}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      const data = res.body[0];

      if (data.first_name === first_name && data.last_name === last_name && data.age === age) {
        done();
      } else {
        done(new Error('Details not retrieved correctly.'));
      }
    });
  });
});
request(server).get('/')