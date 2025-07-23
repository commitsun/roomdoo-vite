import { z } from 'zod';
import type { LoginDTO } from '@/application/dto/LoginDTO';

export const loginSchema = z.object({
  username: z.string().min(1, 'REQUIRED_USERNAME'),
  password: z.string().min(1, 'REQUIRED_PASSWORD'),
}) satisfies z.ZodType<LoginDTO>;

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(1, 'REQUIRED_PASSWORD')
    .min(8, 'MINIMUM_CHARS')
    .regex(/[a-zA-Z]/, 'PASSWORD_LETTER_REQUIRED')
    .regex(/\d/, 'PASSWORD_NUMBER_REQUIRED'),
  confirmPassword: z
    .string()
    .min(1, 'REQUIRED_CONFIRM_PASSWORD')
    .min(8, 'MINIMUM_CHARS')
    .regex(/[a-zA-Z]/, 'PASSWORD_LETTER_REQUIRED')
    .regex(/\d/, 'PASSWORD_NUMBER_REQUIRED'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'PASSWORDS_DO_NOT_MATCH',
  path: ['confirmPassword'],
});
