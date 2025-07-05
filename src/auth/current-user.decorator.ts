import { createParamDecorator, ExecutionContext } from "@nestjs/common";

/**
 * @function CurrentUser
 * @description Extracts the current user ID from the request session.
 * This decorator should be applied to a controller method parameter.
 *
 * Usage:
 *
 * @Get('profile')
 * getProfile(@CurrentUser() userId: string) { ... }
 */
export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest<any>();
    return request.user?.sub || null;
  }
);
