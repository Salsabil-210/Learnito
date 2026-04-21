import { User } from "@prisma/client";
import { UserResponse } from "../types/user";
import bcrypt from "bcrypt";

export function toUserResponse(u: User): UserResponse {
  return {
    id: u.id,
    firstName: u.firstName || "",
    lastName: u.lastName || "",
    fullName: u.fullName || "",
    email: u.email || "",
    emailVerified: u.emailVerified,
    phone: u.phone,
    avatar: u.avatar,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

export async function hashPassword(plain: string) {
  const saltRounds = 10;
  return bcrypt.hash(plain, saltRounds);
}

export async function comparePassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}
