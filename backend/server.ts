import express from 'express';
import cors from 'cors';
import path from 'path';

// 1. Importar las rutas de tu proyecto (ya listas en TS)
import protocolsRoutes from './routes/protocolos.routes';
import authRoutes from './routes/auth.routes'; 
import complaintsRoutes from './routes/complaints.routes'; 

const app = express();

// Configurar los middlewares globales
app.use(cors());
app.use(express.json());

// Hacer pública la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 2. Conectar las rutas a sus prefijos correspondientes
app.use('/api/protocolos', protocolsRoutes);
app.use('/api/auth', authRoutes); 
app.use('/api/denuncias', complaintsRoutes); 

// Levantar el servidor
app.listen(3000, () => {
  console.log('Servidor TypeScript corriendo en puerto 3000');
});