import express from 'express';
import cors from 'cors';
import path from 'path';

import protocolsRoutes from './routes/protocolos.routes';
import authRoutes from './routes/auth.routes';
import complaintsRoutes from './routes/complaints.routes';
import alertsRoutes from './routes/alerts.routes';

const app = express();

app.use(cors());

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

app.use('/api/protocolos', protocolsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/denuncias', complaintsRoutes);
app.use('/api/alerts', alertsRoutes);

app.listen(3000, () => {
  console.log('Servidor TypeScript corriendo en puerto 3000');
});