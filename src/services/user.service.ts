import { userRepository } from '../repositories/user.repository';
import { CreateUserInput, UpdateUserInput, UserResponse } from '../types/user';
import { toUserResponse } from '../utils/user-mapper';

export const userService = {
  async createUser(data: CreateUserInput): Promise<UserResponse> {
    const user = await userRepository.create(data);
    return toUserResponse(user);
  },

  async getAllUsers(): Promise<UserResponse[]> {
    const users = await userRepository.findAll();
    return users.map(toUserResponse);
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
