/**
 * @file health.controller.ts
 * @description Provides health check endpoints for monitoring the application status,
 * including MongoDB connectivity.
 */

import { Controller, Get } from "@nestjs/common";
import { HealthService } from "./health.service";

@Controller("health")
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * Health check endpoint that verifies the status of external dependencies.
   * @returns An object with health status of MongoDB.
   */
  @Get()
  async healthCheck(): Promise<{ mongo: string }> {
    return this.healthService.checkDatabaseHealth();
  }
}
