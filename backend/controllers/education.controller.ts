import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { supabase } from '../config/supabase';

type DifficultyDB = 'facil' | 'medio' | 'dificil';
type EducationTypeDB = 'Phishing' | 'Seguridad' | 'VPNs' | 'Privacidad';

interface EducationImage {
  id: string;
  name: string;
  previewUrl: string;
  url: string;
  path: string;
  type?: string;
  size?: number | null;
  order: number;
}

interface EducationDB {
  id: string;
  titulo: string;
  nivel: DifficultyDB | null;
  resumen: string;
  cuerpo: string;
  imagenes: string[] | null;
  tipo_educacion: EducationTypeDB | null;
  cover_img: string | null;
  archivo_url?: string | null;
  archivo_nombre?: string | null;
  archivo_tipo?: string | null;
}

const EDUCATION_TABLE = process.env.SUPABASE_EDUCATION_TABLE || 'educacion';
const MAX_IMAGES = 10;

const getFilesFromRequest = (req: Request) => {
  const files = req.files as
    | {
        [fieldname: string]: Express.Multer.File[];
      }
    | undefined;

  return {
    portada: files?.portada?.[0] || null,
    archivo: files?.archivo?.[0] || null,
    imagenes: files?.imagenes || []
  };
};

const getUploadUrl = (file: Express.Multer.File) => {
  return `/uploads/${file.filename}`;
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

const normalizeDifficulty = (value?: string | null): DifficultyDB => {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (
    normalized === 'facil' ||
    normalized === 'basico' ||
    normalized === 'basica'
  ) {
    return 'facil';
  }

  if (
    normalized === 'dificil' ||
    normalized === 'avanzado' ||
    normalized === 'avanzada'
  ) {
    return 'dificil';
  }

  return 'medio';
};

const getDifficultyLabel = (value?: string | null) => {
  const normalized = normalizeDifficulty(value);

  if (normalized === 'facil') return 'Básico';
  if (normalized === 'dificil') return 'Avanzado';

  return 'Intermedio';
};

const normalizeEducationType = (value?: string | null): EducationTypeDB => {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (normalized.includes('phish') || normalized.includes('phis')) {
    return 'Phishing';
  }

  if (normalized.includes('vpn')) {
    return 'VPNs';
  }

  if (normalized.includes('privacidad')) {
    return 'Privacidad';
  }

  return 'Seguridad';
};

const parseImagesValue = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;

  if (typeof value === 'string') {
    return safeJsonParse<unknown[]>(value, []);
  }

  return [];
};

const getImageUrlFromPayloadItem = (image: unknown) => {
  if (typeof image === 'string') {
    return image;
  }

  if (image && typeof image === 'object') {
    const item = image as {
      url?: string;
      path?: string;
      previewUrl?: string;
    };

    return item.url || item.path || item.previewUrl || '';
  }

  return '';
};

const mergeImageUrls = (
  imagesValue: unknown,
  uploadedImageUrls: string[],
  fallbackImages: string[] = []
) => {
  const imagesFieldWasSent = typeof imagesValue !== 'undefined';
  const parsedImages = parseImagesValue(imagesValue);

  if (parsedImages.length === 0) {
    if (uploadedImageUrls.length > 0) {
      return uploadedImageUrls.slice(0, MAX_IMAGES);
    }

    if (imagesFieldWasSent) {
      return [];
    }

    return fallbackImages.slice(0, MAX_IMAGES);
  }

  const result: string[] = [];
  let uploadedIndex = 0;

  parsedImages.forEach((image) => {
    const rawUrl = getImageUrlFromPayloadItem(image);
    const cleanUrl = toRelativeUploadUrl(rawUrl);

    if (cleanUrl) {
      result.push(cleanUrl);
      return;
    }

    if (uploadedIndex < uploadedImageUrls.length) {
      result.push(uploadedImageUrls[uploadedIndex]);
      uploadedIndex += 1;
    }
  });

  while (uploadedIndex < uploadedImageUrls.length) {
    result.push(uploadedImageUrls[uploadedIndex]);
    uploadedIndex += 1;
  }

  return result.slice(0, MAX_IMAGES);
};

const mapImageUrlsToResponse = (imagenes?: string[] | null): EducationImage[] => {
  if (!Array.isArray(imagenes)) return [];

  return imagenes
    .map((url, index) => {
      const cleanUrl = toRelativeUploadUrl(url);

      return {
        id: `${index + 1}-${cleanUrl}`,
        name: getFileNameFromUrl(cleanUrl) || `imagen-${index + 1}`,
        previewUrl: cleanUrl,
        url: cleanUrl,
        path: cleanUrl,
        type: undefined,
        size: null,
        order: index + 1
      };
    })
    .filter((image) => Boolean(image.url));
};

const mapEducationResponse = (item: EducationDB) => {
  const coverUrl = item.cover_img || '';
  const fileUrl = item.archivo_url || '';

  return {
    id: item.id,

    title: item.titulo,
    titulo: item.titulo,

    description: item.resumen,
    resumen: item.resumen,

    body: item.cuerpo,
    cuerpo: item.cuerpo,
    content: item.cuerpo,

    category: item.tipo_educacion || 'Seguridad',
    tipo_educacion: item.tipo_educacion || 'Seguridad',

    duration: '10 min',

    level: getDifficultyLabel(item.nivel),
    nivel: item.nivel || 'medio',

    image: coverUrl,
    cover_img: coverUrl,
    coverName: getFileNameFromUrl(coverUrl),

    fileName: item.archivo_nombre || getFileNameFromUrl(fileUrl),
    fileUrl,
    archivo_nombre: item.archivo_nombre || getFileNameFromUrl(fileUrl),
    archivo_url: fileUrl,
    archivo_tipo: item.archivo_tipo || '',

    images: mapImageUrlsToResponse(item.imagenes),
    imagenes: item.imagenes || [],

    createdAt: null
  };
};

export const getEducationModules = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from(EDUCATION_TABLE)
      .select('*')
      .order('titulo', { ascending: true });

    if (error) {
      throw error;
    }

    const modules = (data || []) as EducationDB[];

    return res.json(modules.map((item) => mapEducationResponse(item)));
  } catch (error: any) {
    console.error('Error en getEducationModules:', error);

    return res.status(500).json({
      message: 'Error al obtener módulos educativos.',
      error: error.message || 'Error desconocido'
    });
  }
};

export const createEducationModule = async (req: Request, res: Response) => {
  try {
    const {
      title,
      titulo,
      description,
      resumen,
      body,
      cuerpo,
      content,
      category,
      tipo_educacion,
      level,
      nivel,
      image = '',
      cover_img = '',
      fileName = '',
      archivo_nombre = '',
      fileUrl = '',
      archivo_url = '',
      archivo_tipo = '',
      images
    } = req.body;

    const finalTitle = String(title || titulo || '').trim();
    const finalDescription = String(description || resumen || '').trim();
    const finalBody = String(body || cuerpo || content || finalDescription).trim();

    if (!finalTitle || !finalDescription) {
      return res.status(400).json({
        message: 'Título y descripción son obligatorios.'
      });
    }

    const { portada, archivo, imagenes } = getFilesFromRequest(req);

    const uploadedImageUrls = imagenes.map((file) => getUploadUrl(file));
    const finalImages = mergeImageUrls(images, uploadedImageUrls, []);

    const portadaUrl = portada
      ? getUploadUrl(portada)
      : toRelativeUploadUrl(image || cover_img);

    const archivoUrl = archivo
      ? getUploadUrl(archivo)
      : toRelativeUploadUrl(fileUrl || archivo_url);

    const archivoNombre = archivo
      ? archivo.originalname
      : String(fileName || archivo_nombre || getFileNameFromUrl(archivoUrl)).trim();

    const archivoTipo = archivo
      ? archivo.mimetype
      : String(archivo_tipo || '').trim();

    const payload = {
      id: randomUUID(),
      titulo: finalTitle,
      resumen: finalDescription,
      cuerpo: finalBody,
      nivel: normalizeDifficulty(level || nivel),
      tipo_educacion: normalizeEducationType(category || tipo_educacion),
      cover_img: portadaUrl,
      imagenes: finalImages,
      archivo_url: archivoUrl,
      archivo_nombre: archivoNombre,
      archivo_tipo: archivoTipo
    };

    const { data, error } = await supabase
      .from(EDUCATION_TABLE)
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return res.status(201).json(mapEducationResponse(data as EducationDB));
  } catch (error: any) {
    console.error('Error en createEducationModule:', error);

    return res.status(500).json({
      message: 'Error al crear módulo educativo.',
      error: error.message || 'Error desconocido'
    });
  }
};

export const updateEducationModule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const {
      title,
      titulo,
      description,
      resumen,
      body,
      cuerpo,
      content,
      category,
      tipo_educacion,
      level,
      nivel,
      image = '',
      cover_img = '',
      fileName = '',
      archivo_nombre = '',
      fileUrl = '',
      archivo_url = '',
      archivo_tipo = '',
      images,
      removeCover = 'false',
      removeFile = 'false'
    } = req.body;

    if (!id) {
      return res.status(400).json({
        message: 'ID de módulo no proporcionado.'
      });
    }

    const finalTitle = String(title || titulo || '').trim();
    const finalDescription = String(description || resumen || '').trim();
    const finalBody = String(body || cuerpo || content || finalDescription).trim();

    if (!finalTitle || !finalDescription) {
      return res.status(400).json({
        message: 'Título y descripción son obligatorios.'
      });
    }

    const { data: currentData, error: fetchError } = await supabase
      .from(EDUCATION_TABLE)
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    const current = currentData as EducationDB;

    const { portada, archivo, imagenes } = getFilesFromRequest(req);

    const uploadedImageUrls = imagenes.map((file) => getUploadUrl(file));

    const finalImages = mergeImageUrls(
      images,
      uploadedImageUrls,
      current.imagenes || []
    );

    const portadaUrl = portada
      ? getUploadUrl(portada)
      : removeCover === 'true'
        ? ''
        : toRelativeUploadUrl(image || cover_img || current.cover_img || '');

    const archivoUrl = archivo
      ? getUploadUrl(archivo)
      : removeFile === 'true'
        ? ''
        : toRelativeUploadUrl(fileUrl || archivo_url || current.archivo_url || '');

    const archivoNombre = archivo
      ? archivo.originalname
      : removeFile === 'true'
        ? ''
        : String(
            fileName ||
              archivo_nombre ||
              current.archivo_nombre ||
              getFileNameFromUrl(archivoUrl)
          ).trim();

    const archivoTipo = archivo
      ? archivo.mimetype
      : removeFile === 'true'
        ? ''
        : String(archivo_tipo || current.archivo_tipo || '').trim();

    const payload = {
      titulo: finalTitle,
      resumen: finalDescription,
      cuerpo: finalBody,
      nivel: normalizeDifficulty(level || nivel || current.nivel),
      tipo_educacion: normalizeEducationType(
        category || tipo_educacion || current.tipo_educacion
      ),
      cover_img: portadaUrl,
      imagenes: finalImages,
      archivo_url: archivoUrl,
      archivo_nombre: archivoNombre,
      archivo_tipo: archivoTipo
    };

    const { data, error } = await supabase
      .from(EDUCATION_TABLE)
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return res.json(mapEducationResponse(data as EducationDB));
  } catch (error: any) {
    console.error('Error en updateEducationModule:', error);

    return res.status(500).json({
      message: 'Error al actualizar módulo educativo.',
      error: error.message || 'Error desconocido'
    });
  }
};

export const deleteEducationModule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: 'ID de módulo no proporcionado.'
      });
    }

    const { error } = await supabase
      .from(EDUCATION_TABLE)
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return res.json({
      message: 'Módulo educativo eliminado correctamente.'
    });
  } catch (error: any) {
    console.error('Error en deleteEducationModule:', error);

    return res.status(500).json({
      message: 'Error al eliminar módulo educativo.',
      error: error.message || 'Error desconocido'
    });
  }
};