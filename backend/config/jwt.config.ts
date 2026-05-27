import dotenv from 'dotenv';

dotenv.config();

export const JWT_SECRET =
  process.env.JWT_SECRET || 'mi_llave_secreta_municipal_super_segura';