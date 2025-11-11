import { userRepository } from '../repositories/user.repository';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';  
import { CreateUserInput, UpdateUserInput, UserResponse } from '../types/user';
import { toUserResponse, comparePassword } from '../utils/user-mapper';  
import { verifyGoogleToken } from '../utils/googleAuth';

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

  async login( email: string, password: string): Promise<{ user: UserResponse; accessToken: string; refreshToken: string }> {
    const user = await userRepository.findByEmail(email);
    if (!user || !user.password) throw new Error('Invalid credentials');

    const isValid = await comparePassword(password, user.password);
    if (!isValid) throw new Error('Invalid credentials');

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
    if (!decoded) throw new Error('Invalid refresh token');

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
};