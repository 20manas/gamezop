import * as http from 'http';
import * as qs from 'querystring';

import * as redis from './loaders/redis.js';
import {onNewUserCreated} from './services/users.js';
import * as usersdb from './database/users.js';

export const server = http.createServer(
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
          return res.end();
        }

        const data = await usersdb.getUsersByFirstName(userFirstName);

        if (data.length == 0) {
          res.writeHead(404);
          return res.end();
        }

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

redis.createSubscriber('newUserCreated').then(
  subscriber => subscriber.nodeRedis.on(
    'message',
    async (channel, message) => channel === 'newUserCreated' && await onNewUserCreated(message)
  )
);

server.listen(3000);
if (process.env.NODE_ENV !== 'testing') console.log('Listening at port 3000.');
