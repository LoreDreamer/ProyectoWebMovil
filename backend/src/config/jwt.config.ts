import { env, isProduction } from './env';

if (isProduction && env.jwtSecret === 'mi_llave_secreta_municipal_super_segura') {
  throw new Error('JWT_SECRET debe estar configurado en producción.');
}

export const JWT_SECRET = env.jwtSecret;
