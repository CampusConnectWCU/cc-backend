/**
 * @file database.providers.ts
 * @description Provides asynchronous connection providers for MongoDB.
 */

import { Logger } from "@nestjs/common";
import { ConfigService } from "../config/config.service";
import mongoose from "mongoose";

const logger = new Logger("DatabaseProviders");

/**
 * MongoDB connection provider.
 */
export const mongoProvider = {
  provide: "DATABASE_CONNECTION",
  useFactory: async (config: ConfigService): Promise<typeof mongoose> => {
    const uri = config.mongoUri;
    logger.log(
      `Connecting to MongoDB at ${uri.replace(/\/\/[^:]+:[^@]+@/, "//***:***@")}`
    );

    try {
      await mongoose.connect(uri);
      logger.log("Connected to MongoDB successfully.");
      return mongoose;
    } catch (error) {
      logger.error("Failed to connect to MongoDB:", error);
      throw error;
    }
  },
  inject: [ConfigService],
};
