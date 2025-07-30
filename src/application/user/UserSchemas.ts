import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'validation.requiredUsername'),
  password: z.string().min(1, 'validation.requiredPassword'),
});

export const resetPasswordSchema = z.object({
  firstPassword: z
    .string()
    .min(1, 'validation.requiredPassword')
    .min(8, { message: `validation.minimumChars:${8}` })
    .regex(/[a-zA-Z]/, 'validation.passwordLetterRequired')
    .regex(/\d/, 'validation.passwordNumberRequired'),
  secondPassword: z
    .string()
    .min(1, 'validation.requiredPassword')
    .min(8, { message: `validation.minimumChars:${8}` })
    .regex(/[a-zA-Z]/, 'validation.passwordLetterRequired')
    .regex(/\d/, 'validation.passwordNumberRequired'),
}).refine((data) => data.firstPassword === data.secondPassword, {
  message: 'validation.passwordsDontMatch',
  path: ['secondPassword'],
});
