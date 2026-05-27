import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { supabase } from '../config/supabase';

type CategoriaProtocoloDB =
  | 'Teletrabajo'
  | 'Ciberseguridad'
  | 'Atencion Ciudadana';

interface ArchivoProtocolo {
  id: string;
  name: string;
  url: string;
  path: string;
  type: string;
  size: number | null;
  order: number;
}

interface ProtocoloDB {
  id: string;
  fecha: string | null;
  titulo: string;
  resumen: string;
  autor: string | null;
  categoria: CategoriaProtocoloDB;
  archivo_url: string | null;
  archivo_nombre: string | null;
  archivo_tipo: string | null;
  archivos: ArchivoProtocolo[] | null;
}

const PROTOCOLOS_TABLE = process.env.SUPABASE_PROTOCOLOS_TABLE || 'protocolo';
const MAX_FILES = 10;

const formatFecha = (fecha?: string | null) => {
  if (!fecha) return '';

  const date = new Date(fecha);

  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const toRelativeUploadUrl = (value?: string | null) => {
  const url = String(value || '').trim();

  if (!url) return '';
  if (url.startsWith('blob:') || url.startsWith('data:')) return '';

  const uploadsIndex = url.indexOf('/uploads/');

  if (uploadsIndex >= 0) {
    return url.substring(uploadsIndex);
  }

  return url;
};

const getFileNameFromUrl = (url?: string | null) => {
  const cleanUrl = toRelativeUploadUrl(url);

  if (!cleanUrl) return '';

  const parts = cleanUrl.split('/');
  return parts[parts.length - 1] || '';
};

const safeJsonParse = <T,>(value: unknown, fallback: T): T => {
  try {
    if (typeof value !== 'string') return fallback;
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const normalizeCategoria = (value?: string | null): CategoriaProtocoloDB => {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (normalized.includes('teletrabajo')) {
    return 'Teletrabajo';
  }

  if (
    normalized.includes('atencion') ||
    normalized.includes('ciudadan')
  ) {
    return 'Atencion Ciudadana';
  }

  return 'Ciberseguridad';
};

const getUploadedFiles = (req: Request): Express.Multer.File[] => {
  const files = req.files as
    | {
        [fieldname: string]: Express.Multer.File[];
      }
    | undefined;

  const archivoUnico = files?.archivo || [];
  const archivosMultiples = files?.archivos || [];

  const allFiles = [...archivoUnico, ...archivosMultiples];

  /*
    Evita duplicar el primer archivo cuando el frontend lo manda
    tanto en "archivo" como en "archivos".
  */
  const uniqueMap = new Map<string, Express.Multer.File>();

  allFiles.forEach((file) => {
    const key = `${file.originalname}-${file.size}-${file.mimetype}`;

    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, file);
    }
  });

  return Array.from(uniqueMap.values()).slice(0, MAX_FILES);
};

const buildFilesPayload = (
  files: Express.Multer.File[],
  startOrder = 1
): ArchivoProtocolo[] => {
  return files.map((file, index) => ({
    id: `${Date.now()}-${index}-${file.filename}`,
    name: file.originalname,
    url: `/uploads/${file.filename}`,
    path: `/uploads/${file.filename}`,
    type: file.mimetype,
    size: file.size,
    order: startOrder + index
  }));
};

const normalizeArchivos = (archivos: unknown): ArchivoProtocolo[] => {
  if (!Array.isArray(archivos)) return [];

  return archivos
    .map((archivo, index) => {
      if (!archivo || typeof archivo !== 'object') return null;

      const item = archivo as Partial<ArchivoProtocolo>;

      const url = toRelativeUploadUrl(item.url || item.path || '');

      if (!url) return null;

      return {
        id: String(item.id || `${index + 1}-${url}`),
        name: String(item.name || getFileNameFromUrl(url)),
        url,
        path: url,
        type: String(item.type || ''),
        size:
          typeof item.size === 'number'
            ? item.size
            : null,
        order: index + 1
      };
    })
    .filter(Boolean)
    .slice(0, MAX_FILES) as ArchivoProtocolo[];
};

const getExistingFilesFromBody = (value: unknown): ArchivoProtocolo[] => {
  if (typeof value === 'undefined') return [];

  if (Array.isArray(value)) {
    return normalizeArchivos(value);
  }

  if (typeof value === 'string') {
    return normalizeArchivos(
      safeJsonParse<ArchivoProtocolo[]>(value, [])
    );
  }

  return [];
};

const reorderFiles = (files: ArchivoProtocolo[]) => {
  return files.slice(0, MAX_FILES).map((file, index) => ({
    ...file,
    order: index + 1
  }));
};

const mapProtocoloResponse = (protocolo: ProtocoloDB) => {
  const archivos = reorderFiles(
    normalizeArchivos(protocolo.archivos || [])
  );

  const primerArchivo = archivos[0];

  return {
    id: protocolo.id,

    titulo: protocolo.titulo,

    descripcion: protocolo.resumen,
    resumen: protocolo.resumen,

    fecha: formatFecha(protocolo.fecha),
    fechaRaw: protocolo.fecha,

    categoria: protocolo.categoria,

    archivoUrl:
      protocolo.archivo_url ||
      primerArchivo?.url ||
      '',

    archivoNombre:
      protocolo.archivo_nombre ||
      primerArchivo?.name ||
      '',

    archivoTipo:
      protocolo.archivo_tipo ||
      primerArchivo?.type ||
      '',

    archivo_url:
      protocolo.archivo_url ||
      primerArchivo?.url ||
      '',

    archivo_nombre:
      protocolo.archivo_nombre ||
      primerArchivo?.name ||
      '',

    archivo_tipo:
      protocolo.archivo_tipo ||
      primerArchivo?.type ||
      '',

    archivos,

    autor: protocolo.autor,
    publicado_por: protocolo.autor
  };
};

export const getProtocolos = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from(PROTOCOLOS_TABLE)
      .select('*')
      .order('fecha', { ascending: false });

    if (error) {
      throw error;
    }

    const protocolos = (data || []) as ProtocoloDB[];

    return res.json(
      protocolos.map((protocolo) => mapProtocoloResponse(protocolo))
    );
  } catch (error: any) {
    console.error('Error en getProtocolos:', error);

    return res.status(500).json({
      message: 'Error al obtener protocolos.',
      error: error.message || 'Error desconocido'
    });
  }
};

export const createProtocolo = async (req: Request, res: Response) => {
  try {
    const {
      titulo,
      descripcion,
      resumen,
      categoria = 'Ciberseguridad',
      archivos: archivosBody,
      existingFiles
    } = req.body;

    const finalTitulo = String(titulo || '').trim();
    const finalResumen = String(descripcion || resumen || '').trim();

    if (!finalTitulo || !finalResumen) {
      return res.status(400).json({
        message: 'Título y descripción son obligatorios.'
      });
    }

    const uploadedFiles = getUploadedFiles(req);
    const existingFilesPayload = getExistingFilesFromBody(
      typeof existingFiles !== 'undefined' ? existingFiles : archivosBody
    );

    const newFilesPayload = buildFilesPayload(
      uploadedFiles,
      existingFilesPayload.length + 1
    );

    const archivosFinales = reorderFiles([
      ...existingFilesPayload,
      ...newFilesPayload
    ]);

    const primerArchivo = archivosFinales[0] || null;

    const tokenUser = (req as any).user;

    const payload = {
      id: randomUUID(),
      titulo: finalTitulo,
      resumen: finalResumen,
      categoria: normalizeCategoria(categoria),
      autor: tokenUser?.id || null,
      archivo_url: primerArchivo?.url || null,
      archivo_nombre: primerArchivo?.name || null,
      archivo_tipo: primerArchivo?.type || null,
      archivos: archivosFinales
    };

    const { data, error } = await supabase
      .from(PROTOCOLOS_TABLE)
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return res.status(201).json(
      mapProtocoloResponse(data as ProtocoloDB)
    );
  } catch (error: any) {
    console.error('Error en createProtocolo:', error);

    return res.status(500).json({
      message: 'Error al crear protocolo.',
      error: error.message || 'Error desconocido'
    });
  }
};

export const updateProtocolo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const {
      titulo,
      descripcion,
      resumen,
      categoria = 'Ciberseguridad',
      archivos: archivosBody,
      existingFiles
    } = req.body;

    if (!id) {
      return res.status(400).json({
        message: 'ID de protocolo no proporcionado.'
      });
    }

    const finalTitulo = String(titulo || '').trim();
    const finalResumen = String(descripcion || resumen || '').trim();

    if (!finalTitulo || !finalResumen) {
      return res.status(400).json({
        message: 'Título y descripción son obligatorios.'
      });
    }

    const { data: protocoloActual, error: fetchError } = await supabase
      .from(PROTOCOLOS_TABLE)
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    const current = protocoloActual as ProtocoloDB;

    const uploadedFiles = getUploadedFiles(req);

    const bodyHasExistingFiles =
      typeof existingFiles !== 'undefined' ||
      typeof archivosBody !== 'undefined';

    const existingFilesPayload = bodyHasExistingFiles
      ? getExistingFilesFromBody(
          typeof existingFiles !== 'undefined' ? existingFiles : archivosBody
        )
      : normalizeArchivos(current.archivos || []);

    const newFilesPayload = buildFilesPayload(
      uploadedFiles,
      existingFilesPayload.length + 1
    );

    const archivosFinales = reorderFiles([
      ...existingFilesPayload,
      ...newFilesPayload
    ]);

    const primerArchivo = archivosFinales[0] || null;

    const payload = {
      titulo: finalTitulo,
      resumen: finalResumen,
      categoria: normalizeCategoria(categoria || current.categoria),
      archivo_url: primerArchivo?.url || null,
      archivo_nombre: primerArchivo?.name || null,
      archivo_tipo: primerArchivo?.type || null,
      archivos: archivosFinales
    };

    const { data, error } = await supabase
      .from(PROTOCOLOS_TABLE)
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return res.json(
      mapProtocoloResponse(data as ProtocoloDB)
    );
  } catch (error: any) {
    console.error('Error en updateProtocolo:', error);

    return res.status(500).json({
      message: 'Error al actualizar protocolo.',
      error: error.message || 'Error desconocido'
    });
  }
};

export const deleteProtocolo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: 'ID de protocolo no proporcionado.'
      });
    }

    const { error } = await supabase
      .from(PROTOCOLOS_TABLE)
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return res.json({
      message: 'Protocolo eliminado correctamente.'
    });
  } catch (error: any) {
    console.error('Error en deleteProtocolo:', error);

    return res.status(500).json({
      message: 'Error al eliminar protocolo.',
      error: error.message || 'Error desconocido'
    });
  }
};