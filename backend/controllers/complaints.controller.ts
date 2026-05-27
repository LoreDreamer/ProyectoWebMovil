import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { supabase } from '../config/supabase';

interface ArchivoDenuncia {
  id: string;
  name: string;
  url: string;
  path: string;
  type: string;
  size: number | null;
  order: number;
}

interface DenunciaDB {
  id: string;
  tipo_incidente: string | null;
  fecha: string | null;
  descripcion: string | null;
  adjunto_url: string | null;
  correo: string | null;
  nombre_completo: string | null;
  usuario_id: string | null;
  archivos: ArchivoDenuncia[] | null;
}

interface UsuarioDB {
  id: string;
  correo: string;
}

const DENUNCIAS_TABLE = process.env.SUPABASE_DENUNCIAS_TABLE || 'denuncia';
const USERS_TABLE = process.env.SUPABASE_USERS_TABLE || 'usuario';

const MAX_FILES = 10;

const formatFecha = (fecha?: string | null) => {
  if (!fecha) return '';

  const date = new Date(fecha);

  if (Number.isNaN(date.getTime())) return '';

  return date.toISOString().split('T')[0];
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

const normalizeArchivos = (archivos: unknown): ArchivoDenuncia[] => {
  if (!Array.isArray(archivos)) return [];

  return archivos
    .map((archivo, index) => {
      if (!archivo || typeof archivo !== 'object') return null;

      const item = archivo as Partial<ArchivoDenuncia>;
      const url = toRelativeUploadUrl(item.url || item.path || '');

      if (!url) return null;

      return {
        id: String(item.id || `${index + 1}-${url}`),
        name: String(item.name || getFileNameFromUrl(url)),
        url,
        path: url,
        type: String(item.type || ''),
        size: typeof item.size === 'number' ? item.size : null,
        order: index + 1
      };
    })
    .filter(Boolean)
    .slice(0, MAX_FILES) as ArchivoDenuncia[];
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

  const uniqueMap = new Map<string, Express.Multer.File>();

  allFiles.forEach((file) => {
    const key = `${file.originalname}-${file.size}-${file.mimetype}`;

    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, file);
    }
  });

  return Array.from(uniqueMap.values()).slice(0, MAX_FILES);
};

const buildFilesPayload = (files: Express.Multer.File[]): ArchivoDenuncia[] => {
  return files.map((file, index) => ({
    id: `${Date.now()}-${index}-${file.filename}`,
    name: file.originalname,
    url: `/uploads/${file.filename}`,
    path: `/uploads/${file.filename}`,
    type: file.mimetype,
    size: file.size,
    order: index + 1
  }));
};

const findUserIdByEmail = async (email?: string) => {
  const finalEmail = String(email || '').trim().toLowerCase();

  if (!finalEmail) return null;

  const { data, error } = await supabase
    .from(USERS_TABLE)
    .select('id, correo')
    .eq('correo', finalEmail)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) return null;

  return (data as UsuarioDB).id;
};

const mapDenunciaResponse = (denuncia: DenunciaDB) => {
  const archivos = normalizeArchivos(denuncia.archivos || []);
  const primerArchivo = archivos[0];

  return {
    id: denuncia.id,

    nombre: denuncia.nombre_completo || '',
    nombreCompleto: denuncia.nombre_completo || '',
    nombre_completo: denuncia.nombre_completo || '',

    correo: denuncia.correo || '',

    tipoIncidente: denuncia.tipo_incidente || '',
    tipo_incidente: denuncia.tipo_incidente || '',

    fechaIncidente: formatFecha(denuncia.fecha),
    fecha: denuncia.fecha,

    descripcion: denuncia.descripcion || '',

    archivoAdjunto:
      primerArchivo?.name ||
      getFileNameFromUrl(denuncia.adjunto_url) ||
      'Ninguno',

    rutaArchivo:
      denuncia.adjunto_url ||
      primerArchivo?.url ||
      null,

    adjunto_url:
      denuncia.adjunto_url ||
      primerArchivo?.url ||
      null,

    archivos,

    usuarioId: denuncia.usuario_id,
    usuario_id: denuncia.usuario_id
  };
};

export const obtenerDenuncias = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from(DENUNCIAS_TABLE)
      .select('*')
      .order('fecha', { ascending: false });

    if (error) {
      throw error;
    }

    const denuncias = (data || []) as DenunciaDB[];

    return res.status(200).json(
      denuncias.map((denuncia) => mapDenunciaResponse(denuncia))
    );
  } catch (error: any) {
    console.error('Error al obtener denuncias:', error);

    return res.status(500).json({
      error: 'Error al obtener las denuncias.',
      message: error.message || 'Error desconocido'
    });
  }
};

export const crearDenuncia = async (req: Request, res: Response) => {
  try {
    const {
      nombre,
      nombreCompleto,
      nombre_completo,
      correo,
      tipoIncidente,
      tipo_incidente,
      fechaIncidente,
      fecha,
      descripcion
    } = req.body;

    const finalNombre = String(
      nombre || nombreCompleto || nombre_completo || ''
    ).trim();

    const finalCorreo = String(correo || '').trim().toLowerCase();

    const finalTipoIncidente = String(
      tipoIncidente || tipo_incidente || ''
    ).trim();

    const finalFecha = String(fechaIncidente || fecha || '').trim();
    const finalDescripcion = String(descripcion || '').trim();

    if (
      !finalNombre ||
      !finalCorreo ||
      !finalTipoIncidente ||
      !finalFecha ||
      !finalDescripcion
    ) {
      return res.status(400).json({
        error: 'Faltan campos obligatorios.',
        message:
          'Nombre, correo, tipo de incidente, fecha y descripción son obligatorios.'
      });
    }

    const uploadedFiles = getUploadedFiles(req);

    if (uploadedFiles.length > MAX_FILES) {
      return res.status(400).json({
        error: `Solo puedes adjuntar un máximo de ${MAX_FILES} archivos.`
      });
    }

    const archivos = buildFilesPayload(uploadedFiles);
    const primerArchivo = archivos[0] || null;

    const usuarioId = await findUserIdByEmail(finalCorreo);

    const payload = {
      id: randomUUID(),
      tipo_incidente: finalTipoIncidente,
      fecha: finalFecha,
      descripcion: finalDescripcion,
      adjunto_url: primerArchivo?.url || null,
      correo: finalCorreo,
      nombre_completo: finalNombre,
      usuario_id: usuarioId,
      archivos
    };

    const { data, error } = await supabase
      .from(DENUNCIAS_TABLE)
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    const denunciaCreada = mapDenunciaResponse(data as DenunciaDB);

    console.log('📥 Denuncia guardada en Supabase:', denunciaCreada);

    return res.status(201).json(denunciaCreada);
  } catch (error: any) {
    console.error('Error interno al guardar denuncia:', error);

    return res.status(500).json({
      error: 'Error interno al guardar la denuncia.',
      message: error.message || 'Error desconocido'
    });
  }
};