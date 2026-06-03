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
  jwtSecret: getEnv('JWT_SECRET', 'mi_llave_secreta_municipal_super_segura'),
  supabaseUrl: getEnv('SUPABASE_URL'),
  supabaseServiceRoleKey: getEnv('SUPABASE_SERVICE_ROLE_KEY'),
  supabaseStorageBucket: getEnv('SUPABASE_STORAGE_BUCKET', 'municipal-files')
};

export const isProduction = env.nodeEnv === 'production';
export const envFilePath = sharedEnvPath;
