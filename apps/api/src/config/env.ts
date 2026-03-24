import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().optional(),
  ADMIN_USERNAME: z.string().min(1),
  ADMIN_PASSWORD: z.string().min(1),
  WORKSHOP_JOIN_CODE: z.string().min(1).default('AWSLAB'),
  ALLOWED_ORIGINS: z
    .string()
    .default('http://localhost:5173,http://localhost:5174'),
});

export const env = envSchema.parse(process.env);
