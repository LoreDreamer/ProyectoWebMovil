import { Request, Response } from 'express';
import { supabase } from '../../config/supabase';

const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const subscribeToAlerts = async (req: Request, res: Response) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        ok: false,
        message: 'Correo inválido.',
      });
    }

    const { data, error } = await supabase
      .from('suscripcion_alerta')
      .upsert(
        {
          email,
          activo: true,
        },
        {
          onConflict: 'email',
        }
      )
      .select('id, email, activo, creado_en')
      .single();

    if (error) {
      throw error;
    }

    return res.status(201).json({
      ok: true,
      message: 'Suscripción registrada correctamente.',
      data,
    });
  } catch (error: any) {
    console.error('Error en subscribeToAlerts:', error);

    return res.status(500).json({
      ok: false,
      message: 'Error al registrar suscripción.',
    });
  }
};