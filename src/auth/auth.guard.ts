import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Request } from "express";

interface CustomRequest extends Request {
  session: {
    userId?: string;
    id: string;
  };
}

/**
 * @class AuthGuard
 * @description Protects routes by ensuring a valid session exists.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    // Checks for the presence of userId in the JWT payload.
    return Boolean(request.user && request.user.sub);
  }
}
