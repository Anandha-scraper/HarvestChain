import { resolve } from 'path';
import dotenv from 'dotenv';

// Explicitly load .env from project root and override any pre-set env vars
dotenv.config({ path: resolve(process.cwd(), '.env'), override: true });

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const MONGODB_URI = process.env.MONGODB_URI;
export const JWT_SECRET = process.env.JWT_SECRET;
export const SETUP_SECRET = process.env.SETUP_SECRET;

export function assertEnvVar(name: string, value: string | undefined) {
  if (!value || value.trim() === '') {
    throw new Error(`${name} must be set in .env`);
  }
}



