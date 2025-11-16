import { PrismaClient, User } from '@prisma/client';
import { CreateUserInput, UpdateUserInput } from '../types/user';
import { hashPassword } from '../utils/user-mapper';  

const prisma = new PrismaClient();

export const userRepository = {
async signup(data: CreateUserInput): Promise<User> {
  const hashedPassword = await hashPassword(data.password);

  return prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      fullName: data.fullName,
      email: data.email,
      password: hashedPassword,
      phone: data.phone ?? null,
      avatar: data.avatar ?? null,
      emailVerified: data.emailVerified ?? false,
      passwordResetAt: data.passwordResetAt ?? null
    },
  });

  },

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  async update(id: string, data: UpdateUserInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  },
};
