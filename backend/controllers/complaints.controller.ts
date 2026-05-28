import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import {
  uploadFilesToStorage,
  deleteFilesFromStorage,
  UploadedStorageFile
} from '../src/service/storage.service';

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
  creado_en?: string | null;

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

const USERS_TABLE_CANDIDATES = process.env.SUPABASE_USERS_TABLE
  ? [process.env.SUPABASE_USERS_TABLE]
  : ['usuario', 'usuarios'];

const STORAGE_BUCKET =
  process.env.SUPABASE_STORAGE_BUCKET?.trim() || 'municipal-files';

const buildStoragePathFromPublicUrl = (url?: string | null): string => {
  if (!url) return '';

  if (!url.includes('/storage/v1/object/public/')) {
    return '';
  }

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

const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
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

const getUploadedFiles = (req: Request): Express.Multer.File[] => {
  const singleFile = req.file ? [req.file] : [];

  const fieldFiles = req.files as
    | {
        [fieldname: string]: Express.Multer.File[];
      }
    | Express.Multer.File[]
    | undefined;

  if (Array.isArray(fieldFiles)) {
    return [...singleFile, ...fieldFiles];
  }

  const archivoFiles = fieldFiles?.archivo || [];
  const archivosFiles = fieldFiles?.archivos || [];

  const allFiles = [...singleFile, ...archivoFiles, ...archivosFiles];

  return allFiles.filter(
    (
      fileItem: Express.Multer.File,
      index: number,
      array: Express.Multer.File[]
    ): boolean => {
      const currentKey = `${fileItem.originalname}-${fileItem.size}-${fileItem.mimetype}`;

      return (
        array.findIndex((candidate: Express.Multer.File): boolean => {
          const candidateKey = `${candidate.originalname}-${candidate.size}-${candidate.mimetype}`;

          return candidateKey === currentKey;
        }) === index
      );
    }
  );
};

const normalizeArchivos = (
  archivos: ArchivoDenuncia[]
): ArchivoDenunciaNormalizado[] => {
  if (!Array.isArray(archivos)) return [];

  return archivos
    .map(
      (
        archivoItem: ArchivoDenuncia,
        index: number
      ): ArchivoDenunciaNormalizado => {
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
      }
    )
    .filter((archivoItem: ArchivoDenunciaNormalizado): boolean => {
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

const mapDenunciaResponse = (denuncia: DenunciaDB) => {
  const archivos = normalizeArchivos(denuncia.archivos || []);
  const primerArchivo = archivos[0];

  const nombreCompleto = denuncia.nombre_completo || denuncia.nombre || '';
  const fechaIncidente = denuncia.fecha || denuncia.fecha_incidente || '';
  const fechaRegistro = denuncia.creado_en || denuncia.fecha_registro || '';

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

    fechaRegistro: formatFecha(fechaRegistro),
    creado_en: fechaRegistro,

    usuarioId: denuncia.usuario_id || null,
    usuario_id: denuncia.usuario_id || null
  };
};

const findUserIdByEmail = async (email?: string): Promise<string | null> => {
  if (!email) return null;

  for (const tableName of USERS_TABLE_CANDIDATES) {
    const { data, error } = await supabase
      .from(tableName)
      .select('id, correo')
      .eq('correo', email)
      .maybeSingle();

    if (error) {
      if (isMissingTableError(error)) continue;
      throw error;
    }

    if (!data) return null;

    return (data as UsuarioDB).id;
  }

  return null;
};

export const obtenerDenuncias = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from(DENUNCIAS_TABLE)
      .select('*')
      .order('creado_en', { ascending: false });

    if (error) {
      throw error;
    }

    const denuncias = (data || []) as DenunciaDB[];

    return res.status(200).json(
      denuncias.map((denuncia: DenunciaDB) => mapDenunciaResponse(denuncia))
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

    uploadedFilesPayload = uploadedStorageFiles.map(
      (
        uploadedFile: UploadedStorageFile,
        index: number
      ): ArchivoDenunciaNormalizado =>
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
      .select('*')
      .single();

    if (error) {
      await deleteFilesFromStorage(
        uploadedFilesPayload.map(
          (fileItem: ArchivoDenunciaNormalizado): string => fileItem.path
        )
      );

      throw error;
    }

    const denunciaCreada = mapDenunciaResponse(data as DenunciaDB);

    console.log('📥 Denuncia guardada en Supabase:', denunciaCreada);

    return res.status(201).json(denunciaCreada);
  } catch (error: any) {
    await deleteFilesFromStorage(
      uploadedFilesPayload.map(
        (fileItem: ArchivoDenunciaNormalizado): string => fileItem.path
      )
    );

    console.error('Error interno al guardar denuncia:', error);

    return res.status(500).json({
      error: 'Error interno al guardar la denuncia.',
      message: error.message || 'Error desconocido'
    });
  }
};