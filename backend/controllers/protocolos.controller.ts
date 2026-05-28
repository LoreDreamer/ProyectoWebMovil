import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import {
  uploadFilesToStorage,
  deleteFilesFromStorage,
  UploadedStorageFile
} from '../src/service/storage.service';

interface ArchivoProtocolo {
  id?: string;
  name?: string;
  originalName?: string;
  url?: string;
  path?: string;
  type?: string;
  size?: number | null;
  order?: number;
}

interface ArchivoProtocoloNormalizado {
  id: string;
  name: string;
  originalName: string;
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
  categoria: string;
  archivo_url: string | null;
  archivo_nombre: string | null;
  archivo_tipo: string | null;
  archivos: ArchivoProtocolo[] | null;
}

const PROTOCOLOS_TABLE =
  process.env.SUPABASE_PROTOCOLOS_TABLE || 'protocolo';

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

const parseJsonArray = <T>(value: unknown): T[] => {
  if (!value) return [];

  if (Array.isArray(value)) return value as T[];

  if (typeof value !== 'string') return [];

  try {
    const parsed = JSON.parse(value);

    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
};

const formatFecha = (fecha?: string | null): string => {
  if (!fecha) return '';

  const date = new Date(fecha);

  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const normalizeCategoria = (categoria?: string): string => {
  const normalized = String(categoria || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (normalized.includes('teletrabajo')) {
    return 'Teletrabajo';
  }

  if (
    normalized.includes('atencion') ||
    normalized.includes('ciudadana') ||
    normalized.includes('ciudadano')
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

  const archivoPrincipal = files?.archivo || [];
  const archivosMultiples = files?.archivos || [];

  const allFiles = [...archivoPrincipal, ...archivosMultiples];

  const uniqueFiles = allFiles.filter(
    (file: Express.Multer.File, index: number, array: Express.Multer.File[]) => {
      const currentKey = `${file.originalname}-${file.size}-${file.mimetype}`;

      return (
        array.findIndex((candidate: Express.Multer.File) => {
          const candidateKey = `${candidate.originalname}-${candidate.size}-${candidate.mimetype}`;

          return candidateKey === currentKey;
        }) === index
      );
    }
  );

  return uniqueFiles;
};

const normalizeArchivos = (
  archivos: ArchivoProtocolo[]
): ArchivoProtocoloNormalizado[] => {
  if (!Array.isArray(archivos)) return [];

  return archivos
    .map(
      (
        archivoItem: ArchivoProtocolo,
        index: number
      ): ArchivoProtocoloNormalizado => {
        const fileUrl = archivoItem.url || '';
        const filePath =
          archivoItem.path || getValidStoragePath(fileUrl);
        const fileName =
          archivoItem.name ||
          archivoItem.originalName ||
          `archivo-${index + 1}`;
        const fileId =
          archivoItem.id ||
          `${index + 1}-${fileUrl || filePath || fileName}`;

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
    .filter((archivoItem: ArchivoProtocoloNormalizado): boolean => {
      const fileUrl = archivoItem.url || '';
      const filePath = archivoItem.path || '';

      if (!fileUrl && !filePath) return false;
      if (fileUrl.startsWith('blob:')) return false;
      if (fileUrl.startsWith('data:')) return false;

      return true;
    });
};

const mapUploadedFileToArchivoProtocolo = (
  uploadedFile: UploadedStorageFile,
  index: number
): ArchivoProtocoloNormalizado => {
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

const mapProtocoloResponse = (protocolo: ProtocoloDB) => {
  const archivos = normalizeArchivos(protocolo.archivos || []);
  const primerArchivo = archivos[0];

  return {
    id: protocolo.id,

    titulo: protocolo.titulo,

    resumen: protocolo.resumen,
    descripcion: protocolo.resumen,

    fecha: formatFecha(protocolo.fecha),
    fechaOriginal: protocolo.fecha,

    categoria: protocolo.categoria,

    autor: protocolo.autor,
    publicado_por: protocolo.autor,

    archivoUrl: protocolo.archivo_url || primerArchivo?.url || '',
    archivoNombre: protocolo.archivo_nombre || primerArchivo?.name || '',
    archivoTipo: protocolo.archivo_tipo || primerArchivo?.type || '',

    archivo_url: protocolo.archivo_url || primerArchivo?.url || '',
    archivo_nombre: protocolo.archivo_nombre || primerArchivo?.name || '',
    archivo_tipo: protocolo.archivo_tipo || primerArchivo?.type || '',

    archivos
  };
};

const getCurrentProtocolo = async (
  id: string
): Promise<ProtocoloDB | null> => {
  const { data, error } = await supabase
    .from(PROTOCOLOS_TABLE)
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;

  return data as ProtocoloDB;
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
      protocolos.map((protocolo: ProtocoloDB) =>
        mapProtocoloResponse(protocolo)
      )
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
  let uploadedFilesPayload: ArchivoProtocoloNormalizado[] = [];

  try {
    const {
      titulo,
      title,
      descripcion,
      resumen,
      categoria,
      archivoUrl,
      archivo_url,
      archivoNombre,
      archivo_nombre,
      archivoTipo,
      archivo_tipo,
      archivos = []
    } = req.body;

    const finalTitle = String(titulo || title || '').trim();
    const finalResumen = String(resumen || descripcion || '').trim();
    const finalCategoria = normalizeCategoria(categoria);

    if (!finalTitle || !finalResumen) {
      return res.status(400).json({
        message: 'Título y descripción son obligatorios.'
      });
    }

    const uploadedFiles = getUploadedFiles(req);

    const uploadedStorageFiles = await uploadFilesToStorage(
      uploadedFiles,
      'protocolos/archivos'
    );

    uploadedFilesPayload = uploadedStorageFiles.map(
      (
        uploadedFile: UploadedStorageFile,
        index: number
      ): ArchivoProtocoloNormalizado =>
        mapUploadedFileToArchivoProtocolo(uploadedFile, index)
    );

    const parsedExistingFiles =
      typeof archivos === 'string'
        ? parseJsonArray<ArchivoProtocolo>(archivos)
        : Array.isArray(archivos)
          ? archivos
          : [];

    const existingFiles = normalizeArchivos(parsedExistingFiles);

    const finalFiles = normalizeArchivos([
      ...existingFiles,
      ...uploadedFilesPayload
    ]).slice(0, 10);

    const mainFile = finalFiles[0];

    const tokenUser = (req as any).user;

    const payload = {
      fecha: new Date().toISOString(),
      titulo: finalTitle,
      resumen: finalResumen,
      autor: tokenUser?.id || null,
      categoria: finalCategoria,
      archivo_url: mainFile?.url || archivoUrl || archivo_url || null,
      archivo_nombre:
        mainFile?.name || archivoNombre || archivo_nombre || null,
      archivo_tipo:
        mainFile?.type || archivoTipo || archivo_tipo || null,
      archivos: finalFiles
    };

    const { data, error } = await supabase
      .from(PROTOCOLOS_TABLE)
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      await deleteFilesFromStorage(
        uploadedFilesPayload.map(
          (fileItem: ArchivoProtocoloNormalizado): string => fileItem.path
        )
      );

      throw error;
    }

    return res.status(201).json(mapProtocoloResponse(data as ProtocoloDB));
  } catch (error: any) {
    await deleteFilesFromStorage(
      uploadedFilesPayload.map(
        (fileItem: ArchivoProtocoloNormalizado): string => fileItem.path
      )
    );

    console.error('Error en createProtocolo:', error);

    return res.status(500).json({
      message: 'Error al crear protocolo.',
      error: error.message || 'Error desconocido'
    });
  }
};

export const updateProtocolo = async (req: Request, res: Response) => {
  let uploadedFilesPayload: ArchivoProtocoloNormalizado[] = [];

  try {
    const protocoloId = String(req.params.id || '').trim();

    if (!protocoloId) {
      return res.status(400).json({
        message: 'ID de protocolo no proporcionado.'
      });
    }

    const protocoloActual = await getCurrentProtocolo(protocoloId);

    if (!protocoloActual) {
      return res.status(404).json({
        message: 'Protocolo no encontrado.'
      });
    }

    const {
      titulo,
      title,
      descripcion,
      resumen,
      categoria,
      archivos,
      existingFiles,
      archivosOrden,
      archivoUrl,
      archivo_url,
      archivoNombre,
      archivo_nombre,
      archivoTipo,
      archivo_tipo
    } = req.body;

    const finalTitle = String(titulo || title || '').trim();
    const finalResumen = String(resumen || descripcion || '').trim();
    const finalCategoria = normalizeCategoria(categoria);

    if (!finalTitle || !finalResumen) {
      return res.status(400).json({
        message: 'Título y descripción son obligatorios.'
      });
    }

    const hasFilesPayload =
      typeof archivos !== 'undefined' ||
      typeof existingFiles !== 'undefined' ||
      typeof archivosOrden !== 'undefined';

    const requestedExistingFiles = hasFilesPayload
      ? normalizeArchivos(
          parseJsonArray<ArchivoProtocolo>(
            archivos || existingFiles || archivosOrden
          )
        )
      : normalizeArchivos(protocoloActual.archivos || []);

    const uploadedFiles = getUploadedFiles(req);

    const uploadedStorageFiles = await uploadFilesToStorage(
      uploadedFiles,
      'protocolos/archivos'
    );

    uploadedFilesPayload = uploadedStorageFiles.map(
      (
        uploadedFile: UploadedStorageFile,
        index: number
      ): ArchivoProtocoloNormalizado =>
        mapUploadedFileToArchivoProtocolo(
          uploadedFile,
          requestedExistingFiles.length + index
        )
    );

    const finalFiles = normalizeArchivos([
      ...requestedExistingFiles,
      ...uploadedFilesPayload
    ]).slice(0, 10);

    const mainFile = finalFiles[0];

    const currentFilePaths = normalizeArchivos(protocoloActual.archivos || [])
      .map((fileItem: ArchivoProtocoloNormalizado): string => {
        return fileItem.path || getValidStoragePath(fileItem.url);
      })
      .filter(isNonEmptyString);

    const finalFilePaths = finalFiles
      .map((fileItem: ArchivoProtocoloNormalizado): string => {
        return fileItem.path || getValidStoragePath(fileItem.url);
      })
      .filter(isNonEmptyString);

    const filePathsToDelete = currentFilePaths.filter(
      (storagePath: string): boolean => !finalFilePaths.includes(storagePath)
    );

    const payload = {
      titulo: finalTitle,
      resumen: finalResumen,
      categoria: finalCategoria,
      archivo_url: mainFile?.url || archivoUrl || archivo_url || null,
      archivo_nombre:
        mainFile?.name || archivoNombre || archivo_nombre || null,
      archivo_tipo:
        mainFile?.type || archivoTipo || archivo_tipo || null,
      archivos: finalFiles
    };

    const { data, error } = await supabase
      .from(PROTOCOLOS_TABLE)
      .update(payload)
      .eq('id', protocoloId)
      .select('*')
      .single();

    if (error) {
      await deleteFilesFromStorage(
        uploadedFilesPayload.map(
          (fileItem: ArchivoProtocoloNormalizado): string => fileItem.path
        )
      );

      throw error;
    }

    await deleteFilesFromStorage(filePathsToDelete);

    return res.json(mapProtocoloResponse(data as ProtocoloDB));
  } catch (error: any) {
    await deleteFilesFromStorage(
      uploadedFilesPayload.map(
        (fileItem: ArchivoProtocoloNormalizado): string => fileItem.path
      )
    );

    console.error('Error en updateProtocolo:', error);

    return res.status(500).json({
      message: 'Error al actualizar protocolo.',
      error: error.message || 'Error desconocido'
    });
  }
};

export const deleteProtocolo = async (req: Request, res: Response) => {
  try {
    const protocoloId = String(req.params.id || '').trim();

    if (!protocoloId) {
      return res.status(400).json({
        message: 'ID de protocolo no proporcionado.'
      });
    }

    const protocoloActual = await getCurrentProtocolo(protocoloId);

    const { error } = await supabase
      .from(PROTOCOLOS_TABLE)
      .delete()
      .eq('id', protocoloId);

    if (error) {
      throw error;
    }

    if (protocoloActual) {
      const mainFilePath = getValidStoragePath(protocoloActual.archivo_url);

      const filePaths = normalizeArchivos(protocoloActual.archivos || [])
        .map((fileItem: ArchivoProtocoloNormalizado): string => {
          return fileItem.path || getValidStoragePath(fileItem.url);
        })
        .filter(isNonEmptyString);

      await deleteFilesFromStorage([mainFilePath, ...filePaths]);
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