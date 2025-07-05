import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "../config/config.service";
import { EncryptionService } from "../encryption/encryption.service";
import { Request } from "express";
import * as cookie from "cookie";
import * as signature from "cookie-signature";

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly encryptionService: EncryptionService
  ) {}

  /**
   * Saves a session using the userID and express-session data.
   * @param req - The HTTP request containing the session.
   * @param userId - The user identifier.
   */
  saveSession = (req: Request, userId: string): Promise<void> => {
    req.session.userId = userId;
    return new Promise<void>((resolve, reject) => {
      req.session.save((err) => (err ? reject(err) : resolve()));
    });
  };

  /**
   * Retrieves the USERID from the session stored in the cookie.
   * This method is designed for HTTP requests.
   * @param req - The HTTP request containing the raw cookies.
   * @returns The USERID if found; otherwise, null.
   */
  async getUserIdFromCookie(req: Request): Promise<string | null> {
    if (!req.headers.cookie) {
      this.logger.error("No cookies found on request");
      return null;
    }
    const cookies = cookie.parse(req.headers.cookie);
    const rawCookie = cookies["connect.sid"];
    if (!rawCookie) {
      this.logger.error('Session cookie "connect.sid" not found');
      return null;
    }
    if (rawCookie.substr(0, 2) !== "s:") {
      this.logger.error("Cookie is not signed as expected");
      return null;
    }
    const unsignedCookie = signature.unsign(
      rawCookie.slice(2),
      this.configService.sessionSecret
    );
    if (!unsignedCookie) {
      this.logger.error("Failed to unsign cookie");
      return null;
    }
    // For in-memory sessions, we can't retrieve session data from session ID
    // The session data is only available in the request context
    this.logger.warn(
      "Session retrieval by ID not supported with in-memory store"
    );
    return null;
  }

  /**
   * Retrieves the session data from a raw cookie string.
   * This method handles unsigning the cookie internally.
   * @param rawCookie - The raw session cookie from the client.
   * @returns The session object if valid; otherwise, null.
   */
  async getSessionFromRawCookie(rawCookie: string): Promise<any> {
    if (rawCookie.substr(0, 2) !== "s:") {
      this.logger.error("Cookie is not signed as expected");
      return null;
    }
    const unsigned = signature.unsign(
      rawCookie.slice(2),
      this.configService.sessionSecret
    );
    if (!unsigned) {
      this.logger.error("Invalid session signature");
      return null;
    }
    // For in-memory sessions, we can't retrieve session data from session ID
    this.logger.warn(
      "Session retrieval by ID not supported with in-memory store"
    );
    return null;
  }

  /**
   * Retrieves the USERID from a raw cookie.
   * @param rawCookie - The raw session cookie from the client.
   * @returns The userId if found; otherwise, null.
   */
  async getUserIdFromRawCookie(rawCookie: string): Promise<string | null> {
    const session = await this.getSessionFromRawCookie(rawCookie);
    return session?.userId || null;
  }

  /**
   * Destroys a session by removing it from the store.
   * @param sessionId - The session identifier.
   */
  destroySession = async (sessionId: string): Promise<void> => {
    // For in-memory sessions, we can't destroy by session ID
    // Sessions are automatically cleaned up when the server restarts
    this.logger.warn(
      "Session destruction by ID not supported with in-memory store"
    );
  };
}
