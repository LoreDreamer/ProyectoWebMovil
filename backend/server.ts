import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

import { supabase } from './config/supabase';

import protocolsRoutes from './routes/protocolos.routes';
import authRoutes from './routes/auth.routes';
import complaintsRoutes from './routes/complaints.routes';
import alertsRoutes from './routes/alerts.routes';
import activitiesRoutes from './routes/activities.routes';
import educationRoutes from './routes/education.routes';
import questionnairesRoutes from './routes/questionnaires.routes';
import subscriptionsRoutes from "./routes/questionnaires.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: true,
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

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* =============================== */
/* RUTA DE PRUEBA GENERAL */
/* =============================== */

app.get('/', (req, res) => {
  res.json({
    message: 'Backend municipal funcionando correctamente'
  });
});

/* =============================== */
/* RUTA DE PRUEBA SUPABASE */
/* =============================== */

app.get('/api/test-db', async (req, res) => {
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

/* =============================== */
/* RUTAS API */
/* =============================== */

app.use('/api/auth', authRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/denuncias', complaintsRoutes);
app.use('/api/protocolos', protocolsRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/questionnaires', questionnairesRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);

/* =============================== */
/* SERVER */
/* =============================== */

app.listen(PORT, () => {
  console.log(`Servidor TypeScript corriendo en puerto ${PORT}`);
  console.log(`Prueba Supabase en http://localhost:${PORT}/api/test-db`);
});