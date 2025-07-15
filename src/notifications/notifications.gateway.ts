import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import * as cookie from "cookie";
import { ConfigService } from "../config/config.service";
import { JwtUtilService } from "../jwt-util/jwt-util.service";
import { Logger, OnModuleInit } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";

/**
 * @class NotificationsGateway
 * @description Handles WebSocket connections and dispatches notifications.
 * Uses session-based authentication to map clients to user IDs.
 */
@WebSocketGateway({
  namespace: "/notifications",
  path: "/notifications/socket.io",
  cors: {
    origin: `http://${process.env.CORS_ORIGIN}`,
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  // Map to store connected client sockets by user ID.
  private clients: Map<string, Socket> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtUtil: JwtUtilService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  onModuleInit() {
    // Subscribe to notification events via EventEmitter2.
    this.eventEmitter.on("notification.sent", (notification) => {
      if (notification && notification.userId) {
        const client = this.clients.get(notification.userId);
        if (client) {
          client.emit("notification", notification);
          this.logger.log(
            `Notification sent to user ${notification.userId}: ${JSON.stringify(notification)}`
          );
        } else {
          this.logger.warn(
            `Attempted to notify user ${notification.userId}, but they are not connected.`
          );
        }
      }
    });
  }

  async handleConnection(client: Socket) {
    try {
      const cookies = cookie.parse(client.handshake.headers.cookie || "");
      const token = cookies["jwt"];
      if (!token) {
        this.logger.error("No JWT cookie found. Disconnecting client.");
        client.disconnect();
        return;
      }
      const payload = this.jwtUtil.verify(token);
      if (!payload) {
        this.logger.error("Invalid JWT. Disconnecting client.");
        client.disconnect();
        return;
      }
      const userId = payload.sub;
      if (!userId) {
        this.logger.error("No userId in JWT payload. Disconnecting client.");
        client.disconnect();
        return;
      }
      this.clients.set(userId, client);
      this.logger.log(`Client connected: userId=${userId}`);
    } catch (error) {
      this.logger.error("Error during connection authentication:", error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Remove the disconnected client from the map.
    for (const [userId, socket] of this.clients.entries()) {
      if (socket.id === client.id) {
        this.clients.delete(userId);
        this.logger.log(`Client disconnected: userId=${userId}`);
        break;
      }
    }
  }

  /**
   * Sends a notification to a specific user.
   * This method is now available so that notifications.service.ts
   * can call it without error.
   * @param userId - The target user ID.
   * @param payload - The notification payload.
   */
  public sendNotification(userId: string, payload: any): void {
    const client = this.clients.get(userId);
    if (client) {
      client.emit("notification", payload);
      this.logger.log(
        `Notification sent to user ${userId}: ${JSON.stringify(payload)}`
      );
    } else {
      this.logger.warn(
        `Attempted to notify user ${userId}, but they are not connected.`
      );
    }
  }

  @SubscribeMessage("ping")
  handlePing(client: Socket, payload: any): void {
    client.emit("pong", payload);
  }
}
