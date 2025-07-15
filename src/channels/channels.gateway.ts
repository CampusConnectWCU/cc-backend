import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from "@nestjs/websockets";
import { OnModuleInit } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";
import * as cookie from "cookie";
import { ConfigService } from "../config/config.service";
import { JwtUtilService } from "../jwt-util/jwt-util.service";
import { EventEmitter2 } from "@nestjs/event-emitter";

/**
 * @class ChannelsGateway
 * @description Handles WebSocket connections for channel messaging.
 * Authenticates clients via session cookies and lets them join Socket.IO rooms.
 */
@WebSocketGateway({
  namespace: "/channels",
  path: "/channels/socket.io",
  cors: {
    origin: `http://${process.env.CORS_ORIGIN}`,
    credentials: true,
  },
})
export class ChannelsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChannelsGateway.name);
  private clients: Map<string, Socket> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtUtil: JwtUtilService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  onModuleInit() {
    // Subscribe to the message.sent event
    this.eventEmitter.on("message.sent", (message) => {
      if (message && message.channelId) {
        // Broadcast the message to the channel room.
        this.server.to(message.channelId).emit("messageReceived", message);
        this.logger.log(`Emitted message to channel ${message.channelId}`);
      }
    });

    this.eventEmitter.on("channel.read", ({ channelId, userId }) => {
      this.server.to(channelId).emit("channelRead", { channelId, userId });
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
    for (const [userId, socket] of this.clients.entries()) {
      if (socket.id === client.id) {
        this.clients.delete(userId);
        this.logger.log(`Client disconnected: userId=${userId}`);
        break;
      }
    }
  }

  /**
   * Allows a client to join a channel room.
   * @param client - The connected socket.
   * @param channelId - The channel identifier.
   * @returns The socket.
   */
  @SubscribeMessage("joinChannel")
  handleJoinChannel(client: Socket, channelId: string): Socket {
    client.join(channelId);
    this.logger.log(`Client ${client.id} joined channel ${channelId}`);
    return client;
  }

  @SubscribeMessage("sendMessage")
  async handleSendMessage(
    client: Socket,
    payload: { channelId: string; senderId: string; content: string }
  ): Promise<void> {
    const { channelId, senderId, content } = payload;
    if (!channelId || !senderId || !content) {
      client.emit("error", "Missing required fields in message payload");
      return;
    }
    this.logger.log(
      `Received sendMessage from ${senderId} for channel ${channelId}`
    );
  }

  @SubscribeMessage("leaveChannel")
  handleLeaveChannel(client: Socket, channelId: string): void {
    client.leave(channelId);
    this.logger.log(`Client ${client.id} left channel ${channelId}`);
  }

  @SubscribeMessage("markRead")
  handleMarkRead(client: Socket, channelId: string) {
    client
      .to(channelId)
      .emit("channelRead", { channelId, userId: /* lookup */ "" });
    return client;
  }
}
