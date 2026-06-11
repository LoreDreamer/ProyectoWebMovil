import { Request, Response } from 'express';
import { supabase } from '../../config/supabase';
import {
  uploadFilesToStorage,
  deleteFilesFromStorage,
  UploadedStorageFile
} from '../../services/storage.service';
import { getPaginationOptions, sendOptionalPaginatedResponse } from '../../shared/utils/pagination';

interface ArchivoDenuncia {
  id?: string;
  name?: string;
  originalName?: string;
  url?: string;
  path?: string;
  type?: string;
  size?: number | null;
  order?: number;
}

interface ArchivoDenunciaNormalizado {
  id: string;
  name: string;
  originalName: string;
  url: string;
  path: string;
  type: string;
  size: number | null;
  order: number;
}

interface DenunciaDB {
  id: string;
  tipo_incidente?: string | null;
  fecha?: string | null;
  descripcion?: string | null;
  adjunto_url?: string | null;
  correo?: string | null;
  nombre_completo?: string | null;
  usuario_id?: string | null;
  archivos?: ArchivoDenuncia[] | null;

  /**
   * Campos antiguos o aliases usados por frontend viejo.
   * No necesariamente existen en la tabla actual.
   */
  nombre?: string | null;
  fecha_incidente?: string | null;
  archivo_adjunto?: string | null;
  ruta_archivo?: string | null;
  fecha_registro?: string | null;
}

interface UsuarioDB {
  id: string;
  correo: string;
}

const DENUNCIAS_TABLE = process.env.SUPABASE_DENUNCIAS_TABLE || 'denuncia';
const DENUNCIA_SELECT = 'id, tipo_incidente, fecha, descripcion, adjunto_url, correo, nombre_completo, usuario_id, archivos';

const USERS_TABLE_CANDIDATES = process.env.SUPABASE_USERS_TABLE
  ? [process.env.SUPABASE_USERS_TABLE]
  : ['usuario', 'usuarios'];

const STORAGE_BUCKET =
  process.env.SUPABASE_STORAGE_BUCKET?.trim() || 'municipal-files';

/* ===============================
   HELPERS STORAGE
   =============================== */

const buildStoragePathFromPublicUrl = (url?: string | null): string => {
  if (!url) return '';

  const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
  const markerIndex = url.indexOf(marker);

  if (markerIndex === -1) return '';

  return decodeURIComponent(url.substring(markerIndex + marker.length));
};

const getValidStoragePath = (value?: string | null): string => {
  if (!value) return '';

  if (value.includes('/storage/v1/object/public/')) {
    return buildStoragePathFromPublicUrl(value);
  }

  if (value.startsWith('http')) return '';
  if (value.startsWith('/uploads')) return '';
  if (value.startsWith('uploads')) return '';

  return value;
};

const isMissingTableError = (error: any): boolean => {
  if (!error) return false;

  const message = `${error.message || ''} ${error.details || ''}`.toLowerCase();

  return (
    error.code === '42P01' ||
    error.code === 'PGRST205' ||
    message.includes('could not find') ||
    message.includes('does not exist') ||
    message.includes('schema cache')
  );
};

const formatFecha = (fecha?: string | null): string => {
  if (!fecha) return '';

  const date = new Date(fecha);

  if (Number.isNaN(date.getTime())) {
    return String(fecha);
  }

  return date.toISOString().split('T')[0];
};

/* ===============================
   FILES
   =============================== */

const getUploadedFiles = (req: Request): Express.Multer.File[] => {
  const singleFile = req.file ? [req.file] : [];

  const fieldFiles = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | Express.Multer.File[]
    | undefined;

  if (Array.isArray(fieldFiles)) {
    return [...singleFile, ...fieldFiles];
  }

  const archivoFiles = fieldFiles?.archivo || [];
  const archivosFiles = fieldFiles?.archivos || [];

  const allFiles = [...singleFile, ...archivoFiles, ...archivosFiles];

  return allFiles.filter((fileItem, index, array) => {
    const currentKey = `${fileItem.originalname}-${fileItem.size}-${fileItem.mimetype}`;

    return (
      array.findIndex((candidate) => {
        const candidateKey = `${candidate.originalname}-${candidate.size}-${candidate.mimetype}`;
        return candidateKey === currentKey;
      }) === index
    );
  });
};

const normalizeArchivos = (
  archivos: ArchivoDenuncia[] | null | undefined
): ArchivoDenunciaNormalizado[] => {
  if (!Array.isArray(archivos)) return [];

  return archivos
    .map((archivoItem, index): ArchivoDenunciaNormalizado => {
      const fileUrl = archivoItem.url || '';
      const filePath = archivoItem.path || getValidStoragePath(fileUrl);
      const fileName =
        archivoItem.name ||
        archivoItem.originalName ||
        `archivo-${index + 1}`;

      const fileId =
        archivoItem.id || `${index + 1}-${fileUrl || filePath || fileName}`;

      return {
        id: fileId,
        name: fileName,
        originalName: archivoItem.originalName || fileName,
        url: fileUrl,
        path: filePath,
        type: archivoItem.type || '',
        size: typeof archivoItem.size === 'number' ? archivoItem.size : null,
        order: index + 1
      };
    })
    .filter((archivoItem) => {
      const fileUrl = archivoItem.url || '';
      const filePath = archivoItem.path || '';

      if (!fileUrl && !filePath) return false;
      if (fileUrl.startsWith('blob:')) return false;
      if (fileUrl.startsWith('data:')) return false;

      return true;
    });
};

const mapUploadedFileToArchivoDenuncia = (
  uploadedFile: UploadedStorageFile,
  index: number
): ArchivoDenunciaNormalizado => {
  const fallbackId = `${index + 1}-${
    uploadedFile.path || uploadedFile.url || uploadedFile.name
  }`;

  return {
    id: uploadedFile.id || fallbackId,
    name: uploadedFile.name,
    originalName: uploadedFile.originalName,
    url: uploadedFile.url,
    path: uploadedFile.path,
    type: uploadedFile.type,
    size: uploadedFile.size,
    order: index + 1
  };
};

/* ===============================
   MAPPERS
   =============================== */

const mapDenunciaResponse = (denuncia: DenunciaDB) => {
  const archivos = normalizeArchivos(denuncia.archivos);
  const primerArchivo = archivos[0];

  const nombreCompleto = denuncia.nombre_completo || denuncia.nombre || '';
  const fechaIncidente = denuncia.fecha || denuncia.fecha_incidente || '';
  const fechaRegistro = denuncia.fecha || denuncia.fecha_registro || '';

  const archivoNombre =
    primerArchivo?.name || denuncia.archivo_adjunto || 'Ninguno';

  const archivoUrl =
    primerArchivo?.url || denuncia.adjunto_url || denuncia.ruta_archivo || null;

  return {
    id: denuncia.id,

    nombre: nombreCompleto,
    nombreCompleto,
    nombre_completo: nombreCompleto,

    correo: denuncia.correo || '',

    tipoIncidente: denuncia.tipo_incidente || '',
    tipo_incidente: denuncia.tipo_incidente || '',

    fechaIncidente,
    fecha: fechaIncidente,

    descripcion: denuncia.descripcion || '',

    archivoAdjunto: archivoNombre,
    archivo_adjunto: archivoNombre,

    rutaArchivo: archivoUrl,
    adjunto_url: archivoUrl,

    archivos,

    /**
     * Aliases para frontend.
     * Estos campos se generan en la respuesta, no se consultan como columnas.
     */
    fechaRegistro: formatFecha(fechaRegistro),
    creado_en: fechaRegistro,

    usuarioId: denuncia.usuario_id || null,
    usuario_id: denuncia.usuario_id || null
  };
};

/* ===============================
   USERS
   =============================== */

const findUserIdByEmail = async (email?: string): Promise<string | null> => {
  const finalEmail = String(email || '').trim();

  if (!finalEmail) return null;

  for (const tableName of USERS_TABLE_CANDIDATES) {
    const { data, error } = await supabase
      .from(tableName)
      .select('id, correo')
      .eq('correo', finalEmail)
      .maybeSingle();

    if (error) {
      if (isMissingTableError(error)) continue;
      throw error;
    }

    if (data) {
      return (data as UsuarioDB).id;
    }
  }

  return null;
};

/* ===============================
   CONTROLLERS
   =============================== */

export const obtenerDenuncias = async (req: Request, res: Response) => {
  try {
    const pagination = getPaginationOptions(req, 10, 50);

    let query = pagination.enabled
      ? supabase.from(DENUNCIAS_TABLE).select(DENUNCIA_SELECT, { count: 'exact' })
      : supabase.from(DENUNCIAS_TABLE).select(DENUNCIA_SELECT);

    query = query.order('fecha', { ascending: false });

    if (pagination.enabled) {
      query = query.range(pagination.from, pagination.to);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    const denuncias = (data || []) as DenunciaDB[];
    const mappedDenuncias = denuncias.map((denuncia) =>
      mapDenunciaResponse(denuncia)
    );

    return sendOptionalPaginatedResponse(
      res,
      mappedDenuncias,
      pagination,
      count
    );
  } catch (error: any) {
    console.error('Error al obtener denuncias:', error);

    return res.status(500).json({
      error: 'Error al obtener las denuncias.',
      message: error.message || 'Error desconocido'
    });
  }
};


export const eliminarDenuncia = async (req: Request, res: Response) => {
  try {
    const denunciaId = String(req.params.id || '').trim();

    if (!denunciaId) {
      return res.status(400).json({
        error: 'ID de denuncia no válido.'
      });
    }

    const { data: denunciaData, error: findError } = await supabase
      .from(DENUNCIAS_TABLE)
      .select(DENUNCIA_SELECT)
      .eq('id', denunciaId)
      .maybeSingle();

    if (findError) {
      throw findError;
    }

    if (!denunciaData) {
      return res.status(404).json({
        error: 'Denuncia no encontrada.'
      });
    }

    const denuncia = denunciaData as DenunciaDB;
    const archivos = normalizeArchivos(denuncia.archivos);
    const pathsToDelete = archivos
      .map((archivo) => archivo.path || getValidStoragePath(archivo.url))
      .filter(Boolean);

    const legacyPath = getValidStoragePath(
      denuncia.adjunto_url || denuncia.ruta_archivo || denuncia.archivo_adjunto
    );

    if (legacyPath) {
      pathsToDelete.push(legacyPath);
    }

    const uniquePathsToDelete = Array.from(new Set(pathsToDelete));

    const { error: deleteError } = await supabase
      .from(DENUNCIAS_TABLE)
      .delete()
      .eq('id', denunciaId);

    if (deleteError) {
      throw deleteError;
    }

    if (uniquePathsToDelete.length > 0) {
      await deleteFilesFromStorage(uniquePathsToDelete);
    }

    return res.status(200).json({
      ok: true,
      deletedId: denunciaId,
      message: 'Denuncia eliminada correctamente.'
    });
  } catch (error: any) {
    console.error('Error al eliminar denuncia:', error);

    return res.status(500).json({
      error: 'Error al eliminar la denuncia.',
      message: error.message || 'Error desconocido'
    });
  }
};

export const crearDenuncia = async (req: Request, res: Response) => {
  let uploadedFilesPayload: ArchivoDenunciaNormalizado[] = [];

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
      nombreCompleto || nombre_completo || nombre || ''
    ).trim();

    const finalCorreo = String(correo || '').trim();

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
        error: 'Faltan campos obligatorios.'
      });
    }

    const uploadedFiles = getUploadedFiles(req);

    const uploadedStorageFiles = await uploadFilesToStorage(
      uploadedFiles,
      'denuncias/adjuntos'
    );

    uploadedFilesPayload = uploadedStorageFiles.map((uploadedFile, index) =>
      mapUploadedFileToArchivoDenuncia(uploadedFile, index)
    );

    const primerArchivo = uploadedFilesPayload[0];
    const usuarioId = await findUserIdByEmail(finalCorreo);

    const payload = {
      tipo_incidente: finalTipoIncidente,
      fecha: finalFecha,
      descripcion: finalDescripcion,
      adjunto_url: primerArchivo?.url || null,
      correo: finalCorreo,
      nombre_completo: finalNombre,
      usuario_id: usuarioId,
      archivos: uploadedFilesPayload
    };

    const { data, error } = await supabase
      .from(DENUNCIAS_TABLE)
      .insert(payload)
      .select(DENUNCIA_SELECT)
      .single();

    if (error) {
      await deleteFilesFromStorage(
        uploadedFilesPayload.map((fileItem) => fileItem.path).filter(Boolean)
      );

      throw error;
    }

    const denunciaCreada = mapDenunciaResponse(data as DenunciaDB);

    console.log('📥 Denuncia guardada en Supabase:', denunciaCreada);

    return res.status(201).json(denunciaCreada);
  } catch (error: any) {
    await deleteFilesFromStorage(
      uploadedFilesPayload.map((fileItem) => fileItem.path).filter(Boolean)
    );

    console.error('Error interno al guardar denuncia:', error);

    return res.status(500).json({
      error: 'Error interno al guardar la denuncia.',
      message: error.message || 'Error desconocido'
    });
  }
};