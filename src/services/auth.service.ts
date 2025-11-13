import { userRepository } from '../repositories/user.repository';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';  
import { CreateUserInput, UpdateUserInput, UserResponse } from '../types/user';
import { toUserResponse, comparePassword } from '../utils/user-mapper';  
import { verifyGoogleToken } from '../utils/googleAuth';
import { UnauthorizedError, ConflictError, NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';

export const authService = {

    async googleAuth(idToken: string): Promise<{ user: UserResponse; accessToken: string; refreshToken: string }> {
    const googleUser = await verifyGoogleToken(idToken);

    let user = await userRepository.findByEmail(googleUser.email);

    if (!user) {
      logger.info('Creating new user from Google OAuth', { email: googleUser.email });
      user = await userRepository.signup({
        email: googleUser.email,
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
        fullName: `${googleUser.firstName} ${googleUser.lastName}`, 
        avatar: googleUser.avatar,
        emailVerified: googleUser.emailVerified,
        password: '', 
        phone: null,
        isActive: true,
      });
    } else if (!user.isActive) {
      logger.warn('Google auth attempt for inactive user', { userId: user.id, email: user.email });
      throw new UnauthorizedError('User account is inactive');
    } else {
      logger.info('User logged in via Google OAuth', { userId: user.id, email: user.email });
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
    if (existing) {
      logger.warn('Signup attempt with existing email', { email: data.email });
      throw new ConflictError('User already exists');
    }

    logger.info('Creating new user', { email: data.email });
    const user = await userRepository.signup(data);
    return toUserResponse(user);
  },

  async login( email: string, password: string): Promise<{ user: UserResponse; accessToken: string; refreshToken: string }> {
    const user = await userRepository.findByEmail(email);
    if (!user || !user.password) {
      logger.warn('Login attempt with invalid credentials', { email });
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!user.isActive) {
      logger.warn('Login attempt for inactive user', { userId: user.id, email });
      throw new UnauthorizedError('User account is inactive');
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      logger.warn('Login attempt with incorrect password', { email });
      throw new UnauthorizedError('Invalid credentials');
    }

    logger.info('User logged in successfully', { userId: user.id, email });
    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    return { 
      user: toUserResponse(user), 
      accessToken, 
      refreshToken 
    };
  },


  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      logger.warn('Invalid refresh token provided');
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Validate user exists and is active before generating new access token
    const user = await userRepository.findById(decoded.userId);
    if (!user) {
      logger.warn('Refresh token for non-existent user', { userId: decoded.userId });
      throw new UnauthorizedError('User not found');
    }

    if (!user.isActive) {
      logger.warn('Refresh token for inactive user', { userId: user.id });
      throw new UnauthorizedError('User account is inactive');
    }

    // Use fresh user data from database for token generation
    logger.debug('Generating new access token', { userId: user.id });
    const accessToken = generateAccessToken({ 
      userId: user.id, 
      email: user.email 
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
};