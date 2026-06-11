import path from 'path';
import dotenv from 'dotenv';

// Lugar oficial del .env compartido del proyecto:
// config/.env
const sharedEnvPath = path.resolve(__dirname, '../../../config/.env');

dotenv.config({ path: sharedEnvPath });

const getEnv = (key: string, fallback?: string): string => {
  const value = process.env[key]?.trim();

  if (value) return value;

  if (fallback !== undefined) return fallback;

  throw new Error(
    `Falta la variable de entorno ${key}. Revisa que exista config/.env. Puedes copiar config/.env.example como base.`
  );
};

export const env = {
  port: Number(getEnv('PORT', '3000')),
  frontendUrl: getEnv('FRONTEND_URL', 'http://localhost:5173'),
  nodeEnv: getEnv('NODE_ENV', 'development'),
  jwtSecret: getEnv('JWT_SECRET'),
  allowedOrigins: getEnv('ALLOWED_ORIGINS', getEnv('FRONTEND_URL', 'http://localhost:5173'))
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  supabaseUrl: getEnv('SUPABASE_URL'),
  supabaseServiceRoleKey: getEnv('SUPABASE_SERVICE_ROLE_KEY'),
  supabaseStorageBucket: getEnv('SUPABASE_STORAGE_BUCKET', 'municipal-files'),
  googleSafeBrowsingApiKey: process.env.GOOGLE_SAFE_BROWSING_API_KEY?.trim() || '',
  googleSafeBrowsingClientId: process.env.GOOGLE_SAFE_BROWSING_CLIENT_ID?.trim() || 'municipal-ciberseguridad',
  googleSafeBrowsingClientVersion: process.env.GOOGLE_SAFE_BROWSING_CLIENT_VERSION?.trim() || '1.0.0'
};

export const isProduction = env.nodeEnv === 'production';
export const envFilePath = sharedEnvPath;
