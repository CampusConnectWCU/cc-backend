/**
 * @file env.validation.ts
 * @description Validates environment variables using Joi.
 */
import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  API_PREFIX: Joi.string().default('api'),
  CORS_ORIGIN: Joi.string().default('*'),

  // Mongo configuration
  MONGODB_URI: Joi.string().optional(), // For MongoDB Atlas
  MONGO_HOST: Joi.string().when('MONGODB_URI', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required()
  }),
  MONGO_PORT: Joi.number().when('MONGODB_URI', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required()
  }),
  MONGO_DB: Joi.string().when('MONGODB_URI', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required()
  }),

  // Redis configuration
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().required(),

  SESSION_SECRET: Joi.string().required(),
  ENCRYPTION_KEY: Joi.string().required(),
  COOKIE_SECURE: Joi.boolean().default(false),
  COOKIE_SAME_SITE: Joi.string().default('strict'),
});
