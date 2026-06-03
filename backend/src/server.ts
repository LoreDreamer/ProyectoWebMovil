import { app } from './app';
import { env } from './config/env';

app.listen(env.port, () => {
  console.log(`Servidor TypeScript corriendo en puerto ${env.port}`);
  console.log(`Prueba Supabase en http://localhost:${env.port}/api/test-db`);
});
