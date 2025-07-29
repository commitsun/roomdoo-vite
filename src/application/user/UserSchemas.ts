import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'REQUIRED_USERNAME'),
  password: z.string().min(1, 'REQUIRED_PASSWORD'),
});

export const resetPasswordSchema = z.object({
  firstPassword: z
    .string()
    .min(1, 'REQUIRED_PASSWORD')
    .min(8, 'MINIMUM_CHARS')
    .regex(/[a-zA-Z]/, 'PASSWORD_LETTER_REQUIRED')
    .regex(/\d/, 'PASSWORD_NUMBER_REQUIRED'),
  secondPassword: z
    .string()
    .min(1, 'REQUIRED_CONFIRM_PASSWORD')
    .min(8, 'MINIMUM_CHARS')
    .regex(/[a-zA-Z]/, 'PASSWORD_LETTER_REQUIRED')
    .regex(/\d/, 'PASSWORD_NUMBER_REQUIRED'),
}).refine((data) => data.firstPassword === data.secondPassword, {
  message: 'PASSWORDS_DO_NOT_MATCH',
  path: ['secondPassword'],
});
