import * as redis from 'redis';

export const client = redis.createClient();

export const createSubscriber = (channel: string) => {
  const subscriber = redis.createClient();
  subscriber.subscribe(channel);
  return subscriber;
}
