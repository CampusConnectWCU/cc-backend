/**
 * @file database.providers.ts
 * @description Provides asynchronous connection providers for MongoDB and Redis.
 * Uses environment variables from ConfigService.
 */

import { MongooseModuleAsyncOptions } from '@nestjs/mongoose';

import { ConfigService } from '../config/config.service';
import { Logger } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

const logger = new Logger('DatabaseProviders');

/**
 * MongoDB connection provider using Mongoose.
 */
export const mongoProvider: MongooseModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const uri = configService.mongoUri;
    logger.log(`Connecting to MongoDB at ${uri}`);

    return {
      uri,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
  },
};

/**
 * Redis connection provider.
 */
export const redisProvider = {
  provide: 'REDIS_CLIENT',
  inject: [ConfigService],
  useFactory: async (configService: ConfigService): Promise<RedisClientType> => {
    const redisUri = configService.redisUri;
    logger.log(`Attempting to connect to Redis at: ${redisUri.replace(/\/\/:[^@]*@/, '//:***@')}`);
    
    const client: RedisClientType = createClient({ 
      url: redisUri,
      socket: {
        connectTimeout: 10000, // 10 seconds
        lazyConnect: true, // Don't connect immediately
        tls: redisUri.startsWith('rediss://') ? true : false
      }
    });
    
    client.on('error', (err) => logger.error('Redis Error:', err));
    client.on('connect', () => logger.log('Redis client connected'));
    client.on('ready', () => logger.log('Redis client ready'));
    client.on('end', () => logger.log('Redis client disconnected'));
    
    try {
      await client.connect();
      logger.log('Connected to Redis successfully.');
      return client;
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  },
};

