import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '../config/config.module';
import { JwtUtilService } from './jwt-util.service';

@Module({
  imports: [ConfigModule, JwtModule.register({})],
  providers: [JwtUtilService],
  exports: [JwtUtilService],
})
export class JwtUtilModule {} 