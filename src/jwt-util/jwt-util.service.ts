import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '../config/config.service';
import { Request } from 'express';

@Injectable()
export class JwtUtilService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  sign(payload: object): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.jwtSecret,
      expiresIn: '1d',
    });
  }

  verify(token: string): any | null {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.jwtSecret,
      });
    } catch (err) {
      return null;
    }
  }

  extractFromRequest(req: Request): string | null {
    // Prefer cookie, fallback to Authorization header
    if (req.cookies && req.cookies.jwt) return req.cookies.jwt;
    const auth = req.headers['authorization'];
    if (auth && auth.startsWith('Bearer ')) {
      return auth.slice(7);
    }
    return null;
  }

  extractUserId(token: string): string | null {
    const payload = this.verify(token);
    return payload?.sub || null;
  }
} 