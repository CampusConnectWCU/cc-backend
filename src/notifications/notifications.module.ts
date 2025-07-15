import { Module } from "@nestjs/common";
import { NotificationsGateway } from "./notifications.gateway";
import { NotificationsService } from "./notifications.service";
import { ConfigModule } from "../config/config.module";
import { JwtUtilModule } from "../jwt-util/jwt-util.module";

@Module({
  imports: [ConfigModule, JwtUtilModule],
  providers: [NotificationsGateway, NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
