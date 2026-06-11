import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { supabase } from '../../config/supabase';
import { getPaginationOptions, sendOptionalPaginatedResponse } from '../../shared/utils/pagination';

interface ActividadDB {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string | null;
  host: string | null;
}

const ACTIVIDADES_TABLE = process.env.SUPABASE_ACTIVIDADES_TABLE || 'actividad';
const ACTIVITY_SELECT = 'id, titulo, descripcion, fecha, host';

const formatFecha = (fecha?: string | null) => {
  if (!fecha) return '';

  const date = new Date(fecha);

  if (Number.isNaN(date.getTime())) return '';

  return date.toISOString().split('T')[0];
};

const mapActivityResponse = (actividad: ActividadDB) => {
  return {
    id: actividad.id,

    title: actividad.titulo,
    titulo: actividad.titulo,

    description: actividad.descripcion,
    descripcion: actividad.descripcion,

    date: formatFecha(actividad.fecha),
    fecha: actividad.fecha,

    host: actividad.host,

    publicado_por: actividad.host,
    createdAt: null
  };
};

export const getActivities = async (req: Request, res: Response) => {
  try {
    const pagination = getPaginationOptions(req, 10, 50);

    let query = pagination.enabled
      ? supabase.from(ACTIVIDADES_TABLE).select(ACTIVITY_SELECT, { count: 'exact' })
      : supabase.from(ACTIVIDADES_TABLE).select(ACTIVITY_SELECT);

    query = query.order('fecha', { ascending: true });

    if (pagination.enabled) {
      query = query.range(pagination.from, pagination.to);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    const actividades = (data || []) as ActividadDB[];
    const mappedActivities = actividades.map((actividad) =>
      mapActivityResponse(actividad)
    );

    return sendOptionalPaginatedResponse(
      res,
      mappedActivities,
      pagination,
      count
    );
  } catch (error: any) {
    console.error('Error en getActivities:', error);

    return res.status(500).json({
      message: 'Error al obtener actividades.',
      error: error.message || 'Error desconocido'
    });
  }
};

export const createActivity = async (req: Request, res: Response) => {
  try {
    const {
      title,
      titulo,
      description,
      descripcion,
      date,
      fecha
    } = req.body;

    const finalTitle = String(title || titulo || '').trim();
    const finalDescription = String(description || descripcion || '').trim();
    const finalDate = String(date || fecha || '').trim();

    if (!finalTitle || !finalDescription || !finalDate) {
      return res.status(400).json({
        message: 'Título, descripción y fecha son obligatorios.'
      });
    }

    const tokenUser = (req as any).user;

    const payload = {
      id: randomUUID(),
      titulo: finalTitle,
      descripcion: finalDescription,
      fecha: finalDate,
      host: tokenUser?.id || null
    };

    const { data, error } = await supabase
      .from(ACTIVIDADES_TABLE)
      .insert(payload)
      .select(ACTIVITY_SELECT)
      .single();

    if (error) {
      throw error;
    }

    return res.status(201).json(
      mapActivityResponse(data as ActividadDB)
    );
  } catch (error: any) {
    console.error('Error en createActivity:', error);

    return res.status(500).json({
      message: 'Error al crear actividad.',
      error: error.message || 'Error desconocido'
    });
  }
};

export const updateActivity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const {
      title,
      titulo,
      description,
      descripcion,
      date,
      fecha
    } = req.body;

    if (!id) {
      return res.status(400).json({
        message: 'ID de actividad no proporcionado.'
      });
    }

    const finalTitle = String(title || titulo || '').trim();
    const finalDescription = String(description || descripcion || '').trim();
    const finalDate = String(date || fecha || '').trim();

    if (!finalTitle || !finalDescription || !finalDate) {
      return res.status(400).json({
        message: 'Título, descripción y fecha son obligatorios.'
      });
    }

    const payload = {
      titulo: finalTitle,
      descripcion: finalDescription,
      fecha: finalDate
    };

    const { data, error } = await supabase
      .from(ACTIVIDADES_TABLE)
      .update(payload)
      .eq('id', id)
      .select(ACTIVITY_SELECT)
      .single();

    if (error) {
      throw error;
    }

    return res.json(
      mapActivityResponse(data as ActividadDB)
    );
  } catch (error: any) {
    console.error('Error en updateActivity:', error);

    return res.status(500).json({
      message: 'Error al actualizar actividad.',
      error: error.message || 'Error desconocido'
    });
  }
};

export const deleteActivity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: 'ID de actividad no proporcionado.'
      });
    }

    const { error } = await supabase
      .from(ACTIVIDADES_TABLE)
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return res.json({
      message: 'Actividad eliminada correctamente.'
    });
  } catch (error: any) {
    console.error('Error en deleteActivity:', error);

    return res.status(500).json({
      message: 'Error al eliminar actividad.',
      error: error.message || 'Error desconocido'
    });
  }
};