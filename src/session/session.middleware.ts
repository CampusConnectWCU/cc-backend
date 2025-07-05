/**
 * @file session.middleware.ts
 * @description Intercepts incoming HTTP requests, decrypts session data from the cookie,
 * and attaches the resulting session to the request object. This implementation uses an in-memory store,
 * with encryption applied to session data for additional security.
 */

import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { EncryptionService } from "../encryption/encryption.service";
import { ConfigService } from "../config/config.service";
import * as session from "express-session";

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SessionMiddleware.name);
  private sessionMiddleware: any;

  constructor(
    private readonly configService: ConfigService,
    private readonly encryptionService: EncryptionService
  ) {
    // Create an in-memory session store with encryption
    const MemoryStore = session.MemoryStore;
    const store = new MemoryStore();

    // Initialize the express-session middleware.
    this.sessionMiddleware = session({
      store,
      secret: this.configService.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: this.configService.cookieSecure,
        sameSite: this.configService.cookieSameSite,
        maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
      },
    });
  }

  /**
   * Executes the session middleware to attach the session to the request.
   * Ensures that _parsedUrl exists to avoid errors with certain Express versions.
   * @param req - Express Request object.
   * @param res - Express Response object.
   * @param next - Next middleware function.
   */
  use(req: Request, res: Response, next: NextFunction): void {
    // Ensure req.url is defined
    if (!req.url) {
      req.url = "/";
    }
    // Safely assign _parsedUrl if not already defined (needed by some Express setups)
    if (!(req as any)._parsedUrl) {
      (req as any)._parsedUrl = { pathname: req.url };
    }
    this.sessionMiddleware(req, res, next);
  }
}
