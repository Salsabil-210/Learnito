import { userRepository } from '../repositories/user.repository';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';  
import { CreateUserInput, UpdateUserInput, UserResponse } from '../types/user';
import { toUserResponse, comparePassword } from '../utils/user-mapper';  
import { verifyGoogleToken } from '../utils/googleAuth';
import redisClient from '../config/redis';

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
    user: toUserResponse(user),
    accessToken,
    refreshToken,
  };
},



  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) throw new Error('Invalid refresh token');

    try {
      if (redisClient.status === 'ready') {
        const blacklistKey = `blacklist:${refreshToken}`;
        const isBlacklisted = await redisClient.get(blacklistKey);
        if (isBlacklisted) {
          throw new Error('Token has been revoked');
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'Token has been revoked') {
        throw error;
      }
      // If Redis error, log but continue (fail open)
      console.error('Error checking token blacklist:', error);
    }

    const accessToken = generateAccessToken({ 
      userId: decoded.userId, 
      email: decoded.email 
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
    // Verify the token is valid before blacklisting
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) throw new Error('Invalid refresh token');

    try {
      // Add token to blacklist with 7 day expiration (matching typical refresh token expiry)
      const blacklistKey = `blacklist:${refreshToken}`;
      const expirationSeconds = 7 * 24 * 60 * 60; // 7 days

      if (redisClient.status === 'ready') {
        await redisClient.setex(blacklistKey, expirationSeconds, '1');
      } else {
        console.warn('Redis not available, token blacklisting skipped');
      }
    } catch (error) {
      console.error('Error blacklisting token:', error);
      // Don't throw - logout should succeed even if blacklisting fails
    }

    return { message: 'Logged out successfully' };
  },
};