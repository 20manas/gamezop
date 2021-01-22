import * as http from 'http';
import * as qs from 'querystring';

require('dotenv').config();

import * as redis from './loaders/redis';
import * as db from './loaders/postgres';

const getUserFromRedis = (userId: string) => {
  try {
    redis.client.get(userId, (err, res) => {
      if (err) throw err;

      const user = JSON.parse(res);

      db.query('INSERT INTO users2 VALUES ($1, $2, $3)', [user.FirstName, user.LastName, user.Age]);
      redis.client.del(userId);
    });
  } catch (err) {
    console.error(err);
  }
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET') {
      const userFirstName = qs.parse(req.url.split('?')[1]).user;
      if (!userFirstName) {
        res.writeHead(400);
        res.write('Incorrect Params');
        res.end();
        return;
      }

      const result = await db.query(
        'SELECT first_name, last_name, age FROM users2 WHERE first_name=$1',
        [userFirstName],
      );

      res.writeHead(200, {'Content-Type': 'application/json'});
      res.write(JSON.stringify(result.rows));
      res.end();
    }
  } catch (err) {
    console.error(err);
  }
});

const redisSuscriber = redis.createSubscriber('newUserCreated');
redisSuscriber.on('message', (channel, message) => {
  if (channel !== 'newUserCreated') return;

  getUserFromRedis(message);
});

server.listen(3000);
console.log('Listening at port 3000.');
