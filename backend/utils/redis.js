import Redis from 'ioredis'; //using ioredis for Redis client , can also use 'redis' package

// By default, it will connect to localhost:6379.
// const redis = new Redis();

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
});

redis.on('connect', () => {
  console.log('Redis client connected');
});

redis.on('error', (err) => {
  console.error('Redis client error:', err);
});

export default redis;

