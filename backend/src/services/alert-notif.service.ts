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

  const results = await Promise.allSettled(
    subscribers.map((subscriber) => sendAlertEmail(subscriber.email, alert))
  );

  const sent = results.filter((result) => result.status === 'fulfilled').length;
  const failed = results.filter((result) => result.status === 'rejected').length;

  console.log(`Emails de alerta procesados. Enviados: ${sent}, fallidos: ${failed}`);
};