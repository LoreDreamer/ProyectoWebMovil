import { randomUUID } from 'crypto';
import path from 'path';
import { supabase } from '../config/supabase';

export interface UploadedStorageFile {
  id: string;
  name: string;
  originalName: string;
  url: string;
  path: string;
  type: string;
  size: number;
  order: number;
}

interface UploadOptions {
  folder: string;
  order?: number;
}

interface MemoryUploadFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

const STORAGE_BUCKET =
  process.env.SUPABASE_STORAGE_BUCKET?.trim() || 'municipal-files';

const sanitizeFileName = (fileName: string) => {
  const extension = path.extname(fileName || '').toLowerCase();
  const baseName = path.basename(fileName || 'archivo', extension);

  const cleanBaseName = baseName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

  return `${cleanBaseName || 'archivo'}${extension}`;
};

const buildStoragePath = (folder: string, fileName: string) => {
  const cleanFolder = String(folder || 'general')
    .replace(/^\/+|\/+$/g, '')
    .replace(/[^a-zA-Z0-9-_\/]/g, '-')
    .toLowerCase();

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');

  return `${cleanFolder}/${year}/${month}/${randomUUID()}-${sanitizeFileName(
    fileName
  )}`;
};

export const uploadFileToStorage = async (
  file: MemoryUploadFile,
  options: UploadOptions
): Promise<UploadedStorageFile> => {
  if (!file) {
    throw new Error('No se recibió archivo para subir a Supabase Storage.');
  }

  if (!file.buffer) {
    throw new Error(
      'El archivo no tiene buffer. Revisa que multer esté usando memoryStorage().'
    );
  }

  const storagePath = buildStoragePath(options.folder, file.originalname);

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, file.buffer, {
      contentType: file.mimetype || 'application/octet-stream',
      upsert: false
    });

  if (error) {
    throw new Error(`Error al subir archivo a Storage: ${error.message}`);
  }

  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(storagePath);

    return {
        id: randomUUID(),
        name: file.originalname,
        originalName: file.originalname,
        url: data.publicUrl,
        path: storagePath,
        type: file.mimetype || 'application/octet-stream',
        size: file.size || file.buffer.length,
        order: options.order || 1
    };
};

export const uploadFilesToStorage = async (
  files: MemoryUploadFile[],
  folder: string
): Promise<UploadedStorageFile[]> => {
  const uploadedFiles: UploadedStorageFile[] = [];

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];

    if (!file) continue;

    const uploadedFile = await uploadFileToStorage(file, {
      folder,
      order: index + 1
    });

    uploadedFiles.push(uploadedFile);
  }

  return uploadedFiles;
};

export const deleteFileFromStorage = async (storagePath?: string | null) => {
  if (!storagePath) return;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([storagePath]);

  if (error) {
    console.warn(
      `No se pudo eliminar archivo de Storage (${storagePath}):`,
      error.message
    );
  }
};

export const deleteFilesFromStorage = async (
  storagePaths: Array<string | null | undefined>
) => {
  const validPaths = storagePaths.filter(Boolean) as string[];

  if (validPaths.length === 0) return;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove(validPaths);

  if (error) {
    console.warn('No se pudieron eliminar archivos de Storage:', error.message);
  }
};