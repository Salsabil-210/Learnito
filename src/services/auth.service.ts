import { userRepository } from '../repositories/user.repository';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';  
import { CreateUserInput, UpdateUserInput, UserResponse } from '../types/user';
import { toUserResponse, comparePassword } from '../utils/user-mapper';  
import { verifyGoogleToken } from '../utils/googleAuth';
import redisClient from '../config/redis';
import { JwtPayload } from '../utils/jwt';

export const authService = {

  async googleAuth(idToken: string): Promise<{ user: UserResponse; accessToken: string; refreshToken: string }> {
    const googleUser = await verifyGoogleToken(idToken);

    let user = await userRepository.findByEmail(googleUser.email);

    if (!user) {
      user = await userRepository.signup({
        email: googleUser.email,
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
        fullName: `${googleUser.firstName} ${googleUser.lastName}`, 
        avatar: googleUser.avatar,
        emailVerified: googleUser.emailVerified,
        password: '', 
        phone: null,
      });
    }

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    return {
      user: toUserResponse(user),
      accessToken,
      refreshToken,
    };
  },

  async signup(data: CreateUserInput): Promise<UserResponse> {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) throw new Error('User already exists');

    const user = await userRepository.signup(data);
    return toUserResponse(user);
  },

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user || !user.password) throw new Error("Invalid credentials");

    const isValid = await comparePassword(password, user.password);
    if (!isValid) throw new Error("Invalid credentials");

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    return {
      accessToken,
      refreshToken,
    };
  },

  async refreshToken(payload: JwtPayload, refreshToken: string): Promise<{ accessToken: string }> {
    // Check blacklist only - validation already done in middleware
    if (redisClient.status === 'ready') {
      const blacklistKey = `blacklist:${refreshToken}`;
      const isBlacklisted = await redisClient.get(blacklistKey);
      if (isBlacklisted) throw new Error('Token has been revoked');
    }

    const accessToken = generateAccessToken({ 
      userId: payload.userId, 
      email: payload.email 
    });

    return { accessToken };
  },

  async getUserById(id: string): Promise<UserResponse | null> {
    const user = await userRepository.findById(id);
    return user ? toUserResponse(user) : null;
  },

  async updateUser(id: string, data: UpdateUserInput): Promise<UserResponse> {
    const user = await userRepository.update(id, data);
    return toUserResponse(user);
  },

  async logout(refreshToken: string): Promise<{ message: string }> {
    // No validation needed - middleware already did it
    try {
      const blacklistKey = `blacklist:${refreshToken}`;
      const expirationSeconds = 7 * 24 * 60 * 60; // 7 days

      if (redisClient.status === 'ready') {
        await redisClient.setex(blacklistKey, expirationSeconds, '1');
      } else {
        console.warn('Redis not available, token blacklisting skipped');
      }
    } catch (error) {
      console.error('Error blacklisting token:', error);
    }

    return { message: 'Logged out successfully' };
  },
};