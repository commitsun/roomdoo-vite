import { z } from 'zod';
import type { LoginDTO } from '@/application/dto/LoginDTO';

export const loginSchema = z.object({
  username: z.string().min(1, 'REQUIRED_USERNAME'),
  password: z.string().min(1, 'REQUIRED_PASSWORD'),
}) satisfies z.ZodType<LoginDTO>;
