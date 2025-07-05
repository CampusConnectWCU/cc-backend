/**
 * @file database.service.ts
 * @description Provides database connectivity services for MongoDB
 * and exposing the MongoDB connection.
 */

import { Injectable, Logger } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(@InjectConnection() private readonly connection: Connection) {}

  /**
   * Gets the MongoDB connection.
   * @returns The MongoDB connection object.
   */
  getConnection(): Connection {
    return this.connection;
  }

  /**
   * Checks if the MongoDB connection is ready.
   * @returns True if the connection is ready, false otherwise.
   */
  isConnected(): boolean {
    return this.connection.readyState === 1;
  }
}
