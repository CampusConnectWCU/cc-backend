/**
 * @file health.service.ts
 * @description Provides health check functionality for external dependencies like MongoDB.
 */

import { Injectable, Logger } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Checks the health of all external dependencies.
   * @returns An object with the status of MongoDB.
   */
  async checkDatabaseHealth(): Promise<{ mongo: string }> {
    const isConnected = this.databaseService.isConnected();
    return { mongo: isConnected ? "healthy" : "unhealthy" };
  }
}
