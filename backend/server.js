const express = require('express');
const cors = require('cors');
const path = require('path'); // 🌟 Dejamos los módulos nativos arriba

// 1. Importar las rutas de tu proyecto
const protocolosRoutes = require('./routes/protocolos.routes');
const authRoutes = require('./routes/auth.routes'); 
const complaintsRoutes = require('./routes/complaintsRoutes'); 

const app = express();

// Configurar los middlewares globales
app.use(cors());
app.use(express.json());

// 🌟 Hacer pública la carpeta uploads (Se pone aquí para que no interfiera arriba)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 2. Conectar las rutas a sus prefijos correspondientes
app.use('/api/protocolos', protocolosRoutes);
app.use('/api/auth', authRoutes); 
app.use('/api/denuncias', complaintsRoutes); 

// Levantar el servidor
app.listen(3000, () => {
  console.log('Servidor corriendo en puerto 3000');
});