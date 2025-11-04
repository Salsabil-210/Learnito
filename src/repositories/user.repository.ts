import { PrismaClient, User } from '@prisma/client';
import { CreateUserInput, UpdateUserInput } from '../types/user';
import { hashPassword } from '../utils/user-mapper';

const prisma = new PrismaClient();

export const userRepository = {
  async create(data: CreateUserInput): Promise<User> {
    const hashed = await hashPassword(data.password);
    return prisma.user.create({
      data: {
        ...data,
        password: hashed,
        phone: data.phone ?? null,
        avatar: data.avatar ?? null,
        emailVerified: data.emailVerified ?? false,
        passwordResetAt: data.passwordResetAt ?? null,
      },
    });
  },

  async findAll(): Promise<User[]> {
    return prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  },

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  async update(id: string, data: UpdateUserInput): Promise<User> {
    const payload: any = { ...data };
    if (data.password) {
      payload.password = await hashPassword(data.password);
    }
    return prisma.user.update({
      where: { id },
      data: payload,
    });
  },

 
};