import redis from 'handy-redis';

export const client = redis.createNodeRedisClient({host: process.env.REDIS_HOST});

/**
 * Create new client subscribed to `channel` and return it.
 * @param {string} channel
 */
export const createSubscriber = async (channel) => {
  const subscriber = redis.createNodeRedisClient({host: process.env.REDIS_HOST});
  await subscriber.subscribe(channel);
  return subscriber;
}
