import * as http from 'http';
import * as qs from 'querystring';

import dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') dotenv.config();

import * as redis from './loaders/redis.js';
import {onNewUserCreated} from './services/users.js';
import * as usersdb from './database/users.js';

const server = http.createServer(
  /**
   * Accepts GET request with query params {user: string}. Fetches all users with
   * first_name = user.
   */
  async (req, res) => {
    try {
      if (!req.url) return res.end();

      if (req.method === 'GET') {
        // Try to parse user query param.
        const userFirstName = qs.parse(req.url.split('?')[1]).user;
        if (!userFirstName) {
          res.writeHead(400);
          res.write('Incorrect Params');
          res.end();
          return;
        }

        const data = await usersdb.getUsersByFirstName(userFirstName);

        // Send back JSON stringified user.
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.write(JSON.stringify(data));
        res.end();
      }
    } catch (err) {
      console.error(err);
    }
  }
);

const redisSuscriber = redis.createSubscriber('newUserCreated');
redisSuscriber.on(
  'message',
  (channel, message) => channel !== 'newUserCreated' && onNewUserCreated(message),
);

server.listen(3000);
console.log('Listening at port 3000.');
