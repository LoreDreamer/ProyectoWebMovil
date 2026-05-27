import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { supabase } from '../config/supabase';

type RiskDB = 'bajo' | 'medio' | 'alto';

interface QuestionnaireImage {
  id: string;
  name: string;
  previewUrl: string;
  url: string;
  path: string;
  type?: string;
  size?: number | null;
  order: number;
}

interface QuestionnaireDB {
  id: string;
  riesgo: RiskDB | null;
  titulo: string;
  resumen: string;
  cover_img: string | null;
  puntaje_maximo: number | null;
  archivo_url?: string | null;
  archivo_nombre?: string | null;
  archivo_tipo?: string | null;
  imagenes?: string[] | null;
}

const QUESTIONNAIRES_TABLE =
  process.env.SUPABASE_QUESTIONNAIRES_TABLE || 'cuestionario';

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

const toBoolean = (value: unknown) => {
  return value === true || value === 'true';
};

const normalizeRisk = (value?: string | null): RiskDB => {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (normalized === 'alto') return 'alto';
  if (normalized === 'bajo') return 'bajo';

  return 'medio';
};

const getRiskUpper = (risk?: string | null): 'BAJO' | 'MEDIO' | 'ALTO' => {
  const normalized = normalizeRisk(risk);

  if (normalized === 'alto') return 'ALTO';
  if (normalized === 'bajo') return 'BAJO';

  return 'MEDIO';
};

const parsePositiveNumber = (value: unknown, fallback: number) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.round(parsed);
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

const mapImageUrlsToResponse = (
  imagenes?: string[] | null
): QuestionnaireImage[] => {
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

const mapQuestionnaireResponse = (item: QuestionnaireDB) => {
  const coverUrl = item.cover_img || '';
  const fileUrl = item.archivo_url || '';
  const score = item.puntaje_maximo || 10;

  return {
    id: item.id,

    title: item.titulo,
    titulo: item.titulo,

    description: item.resumen,
    resumen: item.resumen,

    category: 'General',

    questionsCount: score,
    questions_count: score,
    puntajeMaximo: score,
    puntaje_maximo: score,

    difficulty: getRiskUpper(item.riesgo),
    risk: getRiskUpper(item.riesgo),
    riesgo: item.riesgo || 'medio',

    coverUrl,
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

export const getQuestionnaires = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from(QUESTIONNAIRES_TABLE)
      .select('*')
      .order('titulo', { ascending: true });

    if (error) {
      throw error;
    }

    const questionnaires = (data || []) as QuestionnaireDB[];

    return res.json(
      questionnaires.map((item) => mapQuestionnaireResponse(item))
    );
  } catch (error: any) {
    console.error('Error en getQuestionnaires:', error);

    return res.status(500).json({
      message: 'Error al obtener cuestionarios.',
      error: error.message || 'Error desconocido'
    });
  }
};

export const createQuestionnaire = async (req: Request, res: Response) => {
  try {
    const {
      title,
      titulo,
      description,
      resumen,
      risk,
      riesgo,
      difficulty,
      questionsCount,
      questions_count,
      puntajeMaximo,
      puntaje_maximo,
      coverUrl = '',
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
      : toRelativeUploadUrl(coverUrl || cover_img);

    const archivoUrl = archivo
      ? getUploadUrl(archivo)
      : toRelativeUploadUrl(fileUrl || archivo_url);

    const archivoNombre = archivo
      ? archivo.originalname
      : String(
          fileName || archivo_nombre || getFileNameFromUrl(archivoUrl)
        ).trim();

    const archivoTipo = archivo
      ? archivo.mimetype
      : String(archivo_tipo || '').trim();

    const finalScore = parsePositiveNumber(
      puntajeMaximo || puntaje_maximo || questionsCount || questions_count,
      10
    );

    const payload = {
      id: randomUUID(),
      titulo: finalTitle,
      resumen: finalDescription,
      riesgo: normalizeRisk(risk || riesgo || difficulty),
      cover_img: portadaUrl,
      puntaje_maximo: finalScore,
      archivo_url: archivoUrl,
      archivo_nombre: archivoNombre,
      archivo_tipo: archivoTipo,
      imagenes: finalImages
    };

    const { data, error } = await supabase
      .from(QUESTIONNAIRES_TABLE)
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return res.status(201).json(
      mapQuestionnaireResponse(data as QuestionnaireDB)
    );
  } catch (error: any) {
    console.error('Error en createQuestionnaire:', error);

    return res.status(500).json({
      message: 'Error al crear cuestionario.',
      error: error.message || 'Error desconocido'
    });
  }
};

export const updateQuestionnaire = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const {
      title,
      titulo,
      description,
      resumen,
      risk,
      riesgo,
      difficulty,
      questionsCount,
      questions_count,
      puntajeMaximo,
      puntaje_maximo,
      coverUrl = '',
      cover_img = '',
      fileName = '',
      archivo_nombre = '',
      fileUrl = '',
      archivo_url = '',
      archivo_tipo = '',
      images,
      imagenesOrden,
      removeCover = false,
      removeFile = false
    } = req.body;

    if (!id) {
      return res.status(400).json({
        message: 'ID de cuestionario no proporcionado.'
      });
    }

    const finalTitle = String(title || titulo || '').trim();
    const finalDescription = String(description || resumen || '').trim();

    if (!finalTitle || !finalDescription) {
      return res.status(400).json({
        message: 'Título y descripción son obligatorios.'
      });
    }

    const { data: currentData, error: fetchError } = await supabase
      .from(QUESTIONNAIRES_TABLE)
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    const current = currentData as QuestionnaireDB;

    const { portada, archivo, imagenes } = getFilesFromRequest(req);

    const uploadedImageUrls = imagenes.map((file) => getUploadUrl(file));

    const finalImages = mergeImageUrls(
      typeof imagenesOrden !== 'undefined' ? imagenesOrden : images,
      uploadedImageUrls,
      current.imagenes || []
    );

    const shouldRemoveCover = toBoolean(removeCover);
    const shouldRemoveFile = toBoolean(removeFile);

    const portadaUrl = portada
      ? getUploadUrl(portada)
      : shouldRemoveCover
        ? ''
        : toRelativeUploadUrl(coverUrl || cover_img || current.cover_img || '');

    const archivoUrl = archivo
      ? getUploadUrl(archivo)
      : shouldRemoveFile
        ? ''
        : toRelativeUploadUrl(fileUrl || archivo_url || current.archivo_url || '');

    const archivoNombre = archivo
      ? archivo.originalname
      : shouldRemoveFile
        ? ''
        : String(
            fileName ||
              archivo_nombre ||
              current.archivo_nombre ||
              getFileNameFromUrl(archivoUrl)
          ).trim();

    const archivoTipo = archivo
      ? archivo.mimetype
      : shouldRemoveFile
        ? ''
        : String(archivo_tipo || current.archivo_tipo || '').trim();

    const finalScore = parsePositiveNumber(
      puntajeMaximo ||
        puntaje_maximo ||
        questionsCount ||
        questions_count ||
        current.puntaje_maximo,
      current.puntaje_maximo || 10
    );

    const payload = {
      titulo: finalTitle,
      resumen: finalDescription,
      riesgo: normalizeRisk(risk || riesgo || difficulty || current.riesgo),
      cover_img: portadaUrl,
      puntaje_maximo: finalScore,
      archivo_url: archivoUrl,
      archivo_nombre: archivoNombre,
      archivo_tipo: archivoTipo,
      imagenes: finalImages
    };

    const { data, error } = await supabase
      .from(QUESTIONNAIRES_TABLE)
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return res.json(
      mapQuestionnaireResponse(data as QuestionnaireDB)
    );
  } catch (error: any) {
    console.error('Error en updateQuestionnaire:', error);

    return res.status(500).json({
      message: 'Error al actualizar cuestionario.',
      error: error.message || 'Error desconocido'
    });
  }
};

export const deleteQuestionnaire = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: 'ID de cuestionario no proporcionado.'
      });
    }

    const { error } = await supabase
      .from(QUESTIONNAIRES_TABLE)
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return res.json({
      message: 'Cuestionario eliminado correctamente.'
    });
  } catch (error: any) {
    console.error('Error en deleteQuestionnaire:', error);

    return res.status(500).json({
      message: 'Error al eliminar cuestionario.',
      error: error.message || 'Error desconocido'
    });
  }
};