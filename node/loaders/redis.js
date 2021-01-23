import redis from 'redis';

export const client = redis.createClient({host: 'redis'});

export const createSubscriber = (channel) => {
  const subscriber = redis.createClient({host: 'redis'});
  subscriber.subscribe(channel);
  return subscriber;
}
