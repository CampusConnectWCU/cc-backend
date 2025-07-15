import { Module, Logger } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Channel, ChannelSchema } from "./channel.schema";
import { Message, MessageSchema } from "./message.schema";
import { ChannelsRepository } from "./channels.repository";
import { ChannelsService } from "./channels.service";
import { MessageRepository } from "./message.repository";
import { MessageService } from "./message.service";
import { ChannelsGateway } from "./channels.gateway";
import { ChannelsController } from "./channels.controller";
import { ChannelsGuard } from "./channels.guard";
import { ConfigModule } from "../config/config.module";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { UsersModule } from "src/users/users.module";
import { JwtUtilModule } from "../jwt-util/jwt-util.module";

@Module({
  imports: [
    ConfigModule,
    JwtUtilModule,
    MongooseModule.forFeature([{ name: Channel.name, schema: ChannelSchema }]),
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    EventEmitterModule.forRoot(),
    UsersModule,
  ],
  providers: [
    ChannelsRepository,
    ChannelsService,
    MessageRepository,
    MessageService,
    ChannelsGateway,
    ChannelsGuard,
    Logger,
  ],
  controllers: [ChannelsController],
  exports: [ChannelsService, MessageService, ChannelsGateway],
})
export class ChannelsModule {}
