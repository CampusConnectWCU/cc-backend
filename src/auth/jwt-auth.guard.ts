import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies?.jwt;
    if (!token) {
      throw new UnauthorizedException("Authentication token not found");
    }
    try {
      const payload = this.jwtService.verify(token);
      (request as any).user = payload;
      return true;
    } catch (err) {
      throw new UnauthorizedException(
        "Invalid or expired authentication token"
      );
    }
  }
}
