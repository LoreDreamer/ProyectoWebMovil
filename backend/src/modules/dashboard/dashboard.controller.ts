import { Request, Response } from 'express';
import { supabase } from '../../config/supabase';

const EDUCATION_TABLE = process.env.SUPABASE_EDUCATION_TABLE || 'educacion';
const QUESTIONNAIRES_TABLE =
  process.env.SUPABASE_QUESTIONNAIRES_TABLE || 'cuestionario';
const PROTOCOLOS_TABLE = process.env.SUPABASE_PROTOCOLOS_TABLE || 'protocolo';
const ACTIVIDADES_TABLE = process.env.SUPABASE_ACTIVIDADES_TABLE || 'actividad';

const countRows = async (tableName: string): Promise<number> => {
  const { count, error } = await supabase
    .from(tableName)
    .select('id', { count: 'exact', head: true });

  if (error) {
    console.error(`Error contando registros de ${tableName}:`, error.message);
    return 0;
  }

  return count || 0;
};

export const getDashboardSummary = async (_req: Request, res: Response) => {
  try {
    const [education, questionnaires, protocols, activities] =
      await Promise.all([
        countRows(EDUCATION_TABLE),
        countRows(QUESTIONNAIRES_TABLE),
        countRows(PROTOCOLOS_TABLE),
        countRows(ACTIVIDADES_TABLE)
      ]);

    return res.json({
      ok: true,
      data: {
        education,
        questionnaires,
        protocols,
        activities
      }
    });
  } catch (error: any) {
    console.error('Error en getDashboardSummary:', error);

    return res.status(500).json({
      ok: false,
      message: 'Error al obtener resumen del dashboard.',
      error: error.message || 'Error desconocido'
    });
  }
};
