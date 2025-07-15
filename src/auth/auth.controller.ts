import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Res,
  UnauthorizedException,
  Logger,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignupDto } from "./dtos/signup.dto";
import { LoginDto } from "./dtos/login.dto";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { Request, Response } from "express";
import { CurrentUser } from "./current-user.decorator";
import { ExistsDto } from "./dtos/exists.dto";
import { UpdateUserDto } from "./dtos/update.dto";
import { ConfigService } from "../config/config.service";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  private readonly logger = new Logger(AuthController.name);
  @Post("signup")
  async signup(
    @Body() dto: SignupDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<any> {
    const { user, token } = await this.authService.signup(dto);
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: this.configService.cookieSecure,
      sameSite: this.configService.cookieSameSite,
      maxAge: 24 * 60 * 60 * 1000,
    });
    return { user };
  }

  @Post("login")
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<any> {
    const { user, token } = await this.authService.login(dto);
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: this.configService.cookieSecure,
      sameSite: this.configService.cookieSameSite,
      maxAge: 24 * 60 * 60 * 1000,
    });
    return { user };
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  async logout(@Res({ passthrough: true }) res: Response): Promise<any> {
    res.clearCookie("jwt");
    return this.authService.logout();
  }

  @UseGuards(JwtAuthGuard)
  @Get("session")
  async getSession(@CurrentUser() userId: string): Promise<any> {
    if (!userId) {
      return { message: "No active session." };
    }
    return { message: "Active session found.", userId };
  }

  /**
   *
   * @param dto
   * @returns
   */
  @Post("exists")
  async checkUserExists(@Body() dto: ExistsDto): Promise<any> {
    const user = await this.authService.checkUserExists(dto);
    return { exists: !!user };
  }

  // Protected: Get current user profile
  @UseGuards(JwtAuthGuard)
  @Get("profile")
  async getProfile(@CurrentUser() userId: string): Promise<any> {
    if (!userId) {
      return { message: "No active session." };
    }
    const profile = await this.authService.getProfile(userId);
    if (!profile) {
      throw new UnauthorizedException("Profile not found.");
    } else {
      // make a new profile object without the password field
      const { password, ...profileWithoutPassword } = profile;
      return profileWithoutPassword;
    }
  }

  @Post("update")
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @CurrentUser() userId: string,
    @Body() dto: UpdateUserDto
  ): Promise<any> {
    if (!userId) {
      throw new UnauthorizedException("No active session.");
    }
    const updatedProfile = await this.authService.updateUserProfile(
      userId,
      dto
    );
    if (!updatedProfile) {
      throw new UnauthorizedException("Profile not found.");
    } else {
      // make a new profile object without the password field
      const { password, ...profileWithoutPassword } = updatedProfile;
      return profileWithoutPassword;
    }
  }
}
