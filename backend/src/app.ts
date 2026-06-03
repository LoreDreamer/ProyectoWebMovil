import express from 'express';
import cors from 'cors';
import path from 'path';

import { supabase } from './config/supabase';
import { env, isProduction } from './config/env';
import { apiRouter } from './routes';
import { errorMiddleware, notFoundMiddleware } from './middlewares/error.middleware';

export const app = express();

app.use(
  cors({
    origin: isProduction && env.frontendUrl ? env.frontendUrl : true,
    credentials: true
  })
);

app.use(
  express.json({
    limit: '25mb'
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '25mb'
  })
);

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/', (_req, res) => {
  res.json({
    ok: true,
    message: 'Backend municipal funcionando correctamente'
  });
});

app.get('/api/test-db', async (_req, res) => {
  try {
    const tableCandidates = ['usuarios', 'usuario'];

    for (const tableName of tableCandidates) {
      const { data, error } = await supabase
        .from(tableName)
        .select('id, correo, nombre_completo, tipo_usuario')
        .limit(5);

      if (error) {
        const message = `${error.message || ''} ${error.details || ''}`.toLowerCase();

        const missingTable =
          error.code === '42P01' ||
          error.code === 'PGRST205' ||
          message.includes('could not find') ||
          message.includes('does not exist') ||
          message.includes('schema cache');

        if (missingTable) {
          continue;
        }

        throw error;
      }

      return res.json({
        ok: true,
        message: `Conexión con Supabase funcionando usando tabla "${tableName}".`,
        table: tableName,
        data
      });
    }

    return res.status(500).json({
      ok: false,
      message: 'No se encontró tabla "usuarios" ni tabla "usuario" en Supabase.'
    });
  } catch (error: any) {
    console.error('Error en /api/test-db:', error);

    return res.status(500).json({
      ok: false,
      message: 'Error al conectar con Supabase.',
      error: error.message || 'Error desconocido'
    });
  }
});

app.use('/api', apiRouter);
app.use(notFoundMiddleware);
app.use(errorMiddleware);
