import * as redis from '../loaders/redis.js';
import * as usersdb from '../database/users.js'

/**
 * Get user from Redis, add it to the users database and remove user from Redis.
 * @param {string} userId Key stored in Redis whose value should be the user in stringified JSON.
 */
export const onNewUserCreated = async (userId) => {
  try {
    const user = JSON.parse(await redis.client.get(userId));

    await usersdb.addNewUser(user.FirstName, user.LastName, user.Age);

    await redis.client.del(userId);
  } catch (err) {
    console.error(err);
  }
}
