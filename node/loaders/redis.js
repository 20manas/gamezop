import redis from 'redis';

export const client = redis.createClient({host: process.env.REDIS_HOST});

/**
 * Create new client subscribed to `channel` and return it.
 * @param {string} channel
 */
export const createSubscriber = (channel) => {
  const subscriber = redis.createClient({host: process.env.REDIS_HOST});
  subscriber.subscribe(channel);
  return subscriber;
}
