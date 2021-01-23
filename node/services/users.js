import * as redis from '../loaders/redis.js';
import * as usersdb from '../database/users.js'

/**
 * Get user from Redis, add it to the users database and remove user from Redis.
 * @param {string} userId Key stored in Redis whose value should be the user in stringified JSON.
 */
export const onNewUserCreated = (userId) => {
  try {
    redis.client.get(userId, (err, res) => {
      if (err) throw err;
      if (!res) throw 'User ID does not exist';

      const user = JSON.parse(res);

      usersdb.addNewUser(user.FirstName, user.LastName, user.Age);
      // db.query('INSERT INTO users VALUES ($1, $2, $3)', [user.FirstName, user.LastName, user.Age]);
      redis.client.del(userId);
    });
  } catch (err) {
    console.error(err);
  }
}
