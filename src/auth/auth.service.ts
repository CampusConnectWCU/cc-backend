import { Injectable, Logger } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { SignupDto } from "./dtos/signup.dto";
import { LoginDto } from "./dtos/login.dto";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { UpdateUserDto } from "./dtos/update.dto";

/**
 * @class AuthService
 * @description Provides authentication logic including signup, login, and logout.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  /**
   * Signs up a new user.
   * @param dto - Signup data.
   * @returns Confirmation message and created user.
   */
  async signup(dto: SignupDto): Promise<{ user: any; token: string }> {
    const user = await this.usersService.registerUser(dto);

    if (!user || !user._id) {
      throw new Error("Failed to create user.");
    }

    const token = this.jwtService.sign({ sub: user._id });
    return { user, token };
  }

  /**
   * Logs in a user by validating credentials.
   * @param dto - Login data.
   * @returns Confirmation message and authenticated user.
   */
  async login(dto: LoginDto): Promise<{ user: any; token: string }> {
    const user = await this.usersService.validateUserCredentials(dto);
    if (!user || !user._id) {
      throw new Error("Failed to authenticate user.");
    }
    const token = this.jwtService.sign({ sub: user._id });
    return { user, token };
  }

  /**
   * Logs out a user by invalidating the session.
   * @returns A logout confirmation message.
   */
  // For JWT-based auth, logout is handled on client by clearing the cookie
  async logout(): Promise<any> {
    return { message: "Logout successful" };
  }

  async getProfile(userId: string): Promise<any> {
    const user = await this.usersService.findUserByIdentifier({ id: userId });
    if (!user) {
      throw new Error("User not found.");
    }
    return user;
  }

  async checkUserExists(dto: any): Promise<any> {
    const user = await this.usersService.findUserByIdentifier(dto);
    return user;
  }

  async updateUserProfile(userId: string, update: UpdateUserDto): Promise<any> {
    const user = await this.usersService.updateUser(userId, update);
    if (!user) {
      throw new Error("Failed to update user.");
    }
    return { message: "Profile updated successfully", user };
  }
}
