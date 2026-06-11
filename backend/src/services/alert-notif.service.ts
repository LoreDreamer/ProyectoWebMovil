import { supabase } from '../config/supabase';
import { sendAlertEmail } from './email.service';

interface AlertPayload {
  id: string;
  titulo?: string;
  title?: string;
  resumen?: string;
  summary?: string;
  cuerpo?: string;
  body?: string;
  fecha?: string | null;
  date?: string | null;
}

interface SubscriberRow {
  email: string;
}

const EMAIL_BATCH_SIZE = 10;

const chunkArray = <T>(items: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }

  return chunks;
};

export const notifySubscribersAboutAlert = async (alert: AlertPayload) => {
  const { data, error } = await supabase
    .from('suscripcion_alerta')
    .select('email')
    .eq('activo', true);

  if (error) {
    console.error('Error obteniendo suscriptores:', error.message);
    return;
  }

  const subscribers = (data || []) as SubscriberRow[];

  if (subscribers.length === 0) {
    console.log('No hay suscriptores activos para alertas.');
    return;
  }

  let sent = 0;
  let failed = 0;

  for (const batch of chunkArray(subscribers, EMAIL_BATCH_SIZE)) {
    const results = await Promise.allSettled(
      batch.map((subscriber) => sendAlertEmail(subscriber.email, alert))
    );

    sent += results.filter((result) => result.status === 'fulfilled').length;
    failed += results.filter((result) => result.status === 'rejected').length;
  }

  console.log(
    `Emails de alerta procesados por lotes. Enviados: ${sent}, fallidos: ${failed}`
  );
};