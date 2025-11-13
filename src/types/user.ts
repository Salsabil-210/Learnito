import { z } from "zod";

/** ── Zod Schemas ───────────────────────────────────────── */
export const createUserSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  fullName: z.string().min(1).max(200),
  email: z.string().email().max(150),
  password: z.string().min(6).max(255),
  phone: z.string().min(6).max(30).optional().nullable(),
  avatar: z.string().url().optional().nullable(),
  emailVerified: z.boolean().optional().default(false),
  passwordResetAt: z.date().optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  fullName: z.string().min(1).max(200).optional(),
  email: z.string().email().max(150).optional(),
  password: z.string().min(6).max(255).optional(),
  phone: z.string().min(6).max(30).optional().nullable(),
  avatar: z.string().url().optional().nullable(),
  emailVerified: z.boolean().optional(),
  passwordResetAt: z.date().optional().nullable(),
  isActive: z.boolean().optional(),
});

/** ── Inferred TS Types (this is for the controllers usage ) ─ */
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

/** ── Response Type  ─ */
export type UserResponse = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  emailVerified: boolean;
  phone: string | null;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/** ── Helpers ─ */
export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};
