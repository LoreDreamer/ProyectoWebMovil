import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import {
  uploadFileToStorage,
  uploadFilesToStorage,
  deleteFilesFromStorage,
  UploadedStorageFile
} from '../src/service/storage.service';

interface EducationImage {
  id?: string;
  name?: string;
  originalName?: string;
  previewUrl?: string;
  url?: string;
  path?: string;
  type?: string;
  size?: number | null;
  order?: number;
}

interface NormalizedEducationImage {
  id: string;
  name: string;
  originalName: string;
  previewUrl: string;
  url: string;
  path: string;
  type: string;
  size: number | null;
  order: number;
}

interface EducationDB {
  id: string;
  titulo: string;
  resumen: string;
  cuerpo: string | null;
  nivel: string | null;
  tipo_educacion: string | null;
  cover_img: string | null;
  imagenes: EducationImage[] | string[] | null;
  archivo_url: string | null;
  archivo_nombre: string | null;
  archivo_tipo: string | null;
  creado_en?: string | null;
}

interface EducacionUsuarioDB {
  id: string;
  usuario_id: string;
  educacion_id: string;
  fecha_lectura: string;
}

interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

const EDUCATION_TABLE = process.env.SUPABASE_EDUCATION_TABLE || 'educacion';
const EDUCACION_USUARIO_TABLE = 'educacion_usuario';

const STORAGE_BUCKET =
  process.env.SUPABASE_STORAGE_BUCKET?.trim() || 'municipal-files';

/* =============================== */
/* HELPERS GENERALES */
/* =============================== */

const getAuthenticatedUser = (req: Request): AuthenticatedUser | null => {
  const user = (req as any).user;

  if (!user?.id) return null;

  return {
    id: String(user.id),
    email: String(user.email || ''),
    role: user.role === 'admin' ? 'admin' : 'user'
  };
};

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

const normalizeDifficulty = (value?: string): string => {
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

const getDifficultyLabel = (value?: string | null): string => {
  const normalized = normalizeDifficulty(value || '');

  if (normalized === 'facil') return 'Básico';
  if (normalized === 'dificil') return 'Avanzado';

  return 'Intermedio';
};

const normalizeEducationType = (value?: string): string => {
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

/* =============================== */
/* IMÁGENES */
/* =============================== */

const normalizeImages = (
  images: Array<EducationImage | string>
): NormalizedEducationImage[] => {
  if (!Array.isArray(images)) return [];

  return images.map(
    (
      imageItem: EducationImage | string,
      index: number
    ): NormalizedEducationImage => {
      if (typeof imageItem === 'string') {
        const imageUrl = imageItem;
        const imagePath = buildStoragePathFromPublicUrl(imageUrl);
        const imageName = `imagen-${index + 1}`;

        return {
          id: `${index + 1}-${imageUrl || imageName}`,
          name: imageName,
          originalName: imageName,
          previewUrl: imageUrl,
          url: imageUrl,
          path: imagePath,
          type: '',
          size: null,
          order: index + 1
        };
      }

      const imageUrl = imageItem.url || imageItem.previewUrl || '';
      const imagePath =
        imageItem.path || buildStoragePathFromPublicUrl(imageUrl);

      const imageName =
        imageItem.name || imageItem.originalName || `imagen-${index + 1}`;

      const imageId =
        imageItem.id || `${index + 1}-${imageUrl || imagePath || imageName}`;

      return {
        id: imageId,
        name: imageName,
        originalName: imageItem.originalName || imageName,
        previewUrl: imageItem.previewUrl || imageUrl,
        url: imageUrl,
        path: imagePath,
        type: imageItem.type || '',
        size: typeof imageItem.size === 'number' ? imageItem.size : null,
        order: index + 1
      };
    }
  );
};

const filterValidExistingImages = (
  images: Array<EducationImage | string>
): NormalizedEducationImage[] => {
  const normalizedImages = normalizeImages(images);

  return normalizedImages.filter((imageItem) => {
    const imageUrl = imageItem.url || '';
    const imagePath = imageItem.path || '';

    if (!imageUrl && !imagePath) return false;
    if (imageUrl.startsWith('blob:')) return false;
    if (imageUrl.startsWith('data:')) return false;

    return true;
  });
};

const mapUploadedFileToEducationImage = (
  uploadedFile: UploadedStorageFile,
  index: number
): NormalizedEducationImage => {
  const fallbackId = `${index + 1}-${
    uploadedFile.path || uploadedFile.url || uploadedFile.name
  }`;

  return {
    id: uploadedFile.id || fallbackId,
    name: uploadedFile.name,
    originalName: uploadedFile.originalName,
    previewUrl: uploadedFile.url,
    url: uploadedFile.url,
    path: uploadedFile.path,
    type: uploadedFile.type,
    size: uploadedFile.size,
    order: index + 1
  };
};

/* =============================== */
/* MAPPERS */
/* =============================== */

const mapEducationResponse = (item: EducationDB) => {
  const images = normalizeImages(item.imagenes || []);

  return {
    id: item.id,

    title: item.titulo,
    titulo: item.titulo,

    description: item.resumen,
    resumen: item.resumen,

    body: item.cuerpo || item.resumen,
    cuerpo: item.cuerpo || item.resumen,

    category: item.tipo_educacion || 'Seguridad',
    tipo_educacion: item.tipo_educacion || 'Seguridad',

    duration: '10 min',

    level: getDifficultyLabel(item.nivel),
    nivel: item.nivel || 'medio',

    image: item.cover_img || '',
    cover_img: item.cover_img || '',
    coverName: item.cover_img ? 'Portada' : '',

    fileName: item.archivo_nombre || '',
    fileUrl: item.archivo_url || '',
    archivo_nombre: item.archivo_nombre || '',
    archivo_url: item.archivo_url || '',
    archivo_tipo: item.archivo_tipo || '',

    images,
    imagenes: images,

    createdAt: item.creado_en || null,
    created_at: item.creado_en || null,
    creado_en: item.creado_en || null
  };
};

const mapEducacionUsuarioResponse = (item: EducacionUsuarioDB) => {
  return {
    id: item.id,

    usuarioId: item.usuario_id,
    usuario_id: item.usuario_id,

    educationId: item.educacion_id,
    educacionId: item.educacion_id,
    educacion_id: item.educacion_id,

    fechaLectura: item.fecha_lectura,
    fecha_lectura: item.fecha_lectura
  };
};

/* =============================== */
/* CONSULTAS AUXILIARES */
/* =============================== */

const getCurrentEducationModule = async (
  id: string
): Promise<EducationDB | null> => {
  const { data, error } = await supabase
    .from(EDUCATION_TABLE)
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;

  return data as EducationDB;
};

/* =============================== */
/* EDUCACIÓN - CRUD */
/* =============================== */

export const getEducationModules = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from(EDUCATION_TABLE)
      .select('*')
      .order('creado_en', { ascending: false });

    if (error) {
      throw error;
    }

    const modules = (data || []) as EducationDB[];

    return res.json(
      modules.map((item: EducationDB) => mapEducationResponse(item))
    );
  } catch (error: any) {
    console.error('Error en getEducationModules:', error);

    return res.status(500).json({
      message: 'Error al obtener módulos educativos.',
      error: error.message || 'Error desconocido'
    });
  }
};

export const createEducationModule = async (req: Request, res: Response) => {
  let uploadedCover: UploadedStorageFile | null = null;
  let uploadedDocument: UploadedStorageFile | null = null;
  let uploadedImagesPayload: NormalizedEducationImage[] = [];

  try {
    const {
      title,
      titulo,
      description,
      resumen,
      body,
      cuerpo,
      category,
      tipo_educacion,
      level,
      nivel,
      image,
      fileUrl,
      images = []
    } = req.body;

    const finalTitle = String(title || titulo || '').trim();
    const finalDescription = String(description || resumen || '').trim();
    const finalBody = String(body || cuerpo || finalDescription).trim();
    const finalType = normalizeEducationType(category || tipo_educacion);
    const finalLevel = normalizeDifficulty(level || nivel);

    if (!finalTitle || !finalDescription) {
      return res.status(400).json({
        message: 'Título y descripción son obligatorios.'
      });
    }

    const { portada, archivo, imagenes } = getFilesFromRequest(req);

    if (portada) {
      uploadedCover = await uploadFileToStorage(portada, {
        folder: 'educacion/portadas',
        order: 1
      });
    }

    if (archivo) {
      uploadedDocument = await uploadFileToStorage(archivo, {
        folder: 'educacion/documentos',
        order: 1
      });
    }

    const uploadedImages = await uploadFilesToStorage(
      imagenes,
      'educacion/imagenes'
    );

    uploadedImagesPayload = normalizeImages(
      uploadedImages.map((uploadedFile, index) =>
        mapUploadedFileToEducationImage(uploadedFile, index)
      )
    );

    const parsedImages =
      typeof images === 'string'
        ? parseJsonArray<EducationImage>(images)
        : Array.isArray(images)
          ? images
          : [];

    const finalImages =
      uploadedImagesPayload.length > 0
        ? uploadedImagesPayload
        : filterValidExistingImages(parsedImages);

    const payload = {
      titulo: finalTitle,
      resumen: finalDescription,
      cuerpo: finalBody,
      nivel: finalLevel,
      tipo_educacion: finalType,
      cover_img: uploadedCover?.url || image || null,
      imagenes: normalizeImages(finalImages).slice(0, 10),
      archivo_url: uploadedDocument?.url || fileUrl || null,
      archivo_nombre: uploadedDocument?.name || null,
      archivo_tipo: uploadedDocument?.type || null
    };

    const { data, error } = await supabase
      .from(EDUCATION_TABLE)
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      await deleteFilesFromStorage([
        uploadedCover?.path,
        uploadedDocument?.path,
        ...uploadedImagesPayload.map((imageItem) => imageItem.path)
      ]);

      throw error;
    }

    return res.status(201).json(mapEducationResponse(data as EducationDB));
  } catch (error: any) {
    await deleteFilesFromStorage([
      uploadedCover?.path,
      uploadedDocument?.path,
      ...uploadedImagesPayload.map((imageItem) => imageItem.path)
    ]);

    console.error('Error en createEducationModule:', error);

    return res.status(500).json({
      message: 'Error al crear módulo educativo.',
      error: error.message || 'Error desconocido'
    });
  }
};

export const updateEducationModule = async (req: Request, res: Response) => {
  let uploadedCover: UploadedStorageFile | null = null;
  let uploadedDocument: UploadedStorageFile | null = null;
  let uploadedImagesPayload: NormalizedEducationImage[] = [];

  try {
    const moduleId = String(req.params.id || '').trim();

    if (!moduleId) {
      return res.status(400).json({
        message: 'ID de módulo no proporcionado.'
      });
    }

    const actual = await getCurrentEducationModule(moduleId);

    if (!actual) {
      return res.status(404).json({
        message: 'Módulo educativo no encontrado.'
      });
    }

    const {
      title,
      titulo,
      description,
      resumen,
      body,
      cuerpo,
      category,
      tipo_educacion,
      level,
      nivel,
      image,
      fileUrl,
      removeCover = 'false',
      removeFile = 'false'
    } = req.body;

    const finalTitle = String(title || titulo || '').trim();
    const finalDescription = String(description || resumen || '').trim();
    const finalBody = String(body || cuerpo || finalDescription).trim();
    const finalType = normalizeEducationType(category || tipo_educacion);
    const finalLevel = normalizeDifficulty(level || nivel);

    if (!finalTitle || !finalDescription) {
      return res.status(400).json({
        message: 'Título y descripción son obligatorios.'
      });
    }

    const { portada, archivo, imagenes } = getFilesFromRequest(req);

    let finalCoverUrl = actual.cover_img;
    let finalFileUrl = actual.archivo_url;
    let finalFileName = actual.archivo_nombre;
    let finalFileType = actual.archivo_tipo;

    let oldCoverPathToDelete = '';
    let oldFilePathToDelete = '';

    if (removeCover === 'true') {
      oldCoverPathToDelete = buildStoragePathFromPublicUrl(actual.cover_img);
      finalCoverUrl = null;
    }

    if (portada) {
      oldCoverPathToDelete = buildStoragePathFromPublicUrl(actual.cover_img);

      uploadedCover = await uploadFileToStorage(portada, {
        folder: 'educacion/portadas',
        order: 1
      });

      finalCoverUrl = uploadedCover.url;
    }

    if (removeFile === 'true') {
      oldFilePathToDelete = buildStoragePathFromPublicUrl(actual.archivo_url);

      finalFileUrl = null;
      finalFileName = null;
      finalFileType = null;
    }

    if (archivo) {
      oldFilePathToDelete = buildStoragePathFromPublicUrl(actual.archivo_url);

      uploadedDocument = await uploadFileToStorage(archivo, {
        folder: 'educacion/documentos',
        order: 1
      });

      finalFileUrl = uploadedDocument.url;
      finalFileName = uploadedDocument.name;
      finalFileType = uploadedDocument.type;
    }

    if (!archivo && !removeFile && fileUrl) {
      finalFileUrl = fileUrl;
    }

    if (!portada && !removeCover && image) {
      finalCoverUrl = image;
    }

    const hasImagesPayload =
      typeof req.body.images !== 'undefined' ||
      typeof req.body.imagenes !== 'undefined' ||
      typeof req.body.imagenesOrden !== 'undefined';

    const requestedExistingImages = hasImagesPayload
      ? filterValidExistingImages(
          parseJsonArray<EducationImage>(
            req.body.images || req.body.imagenes || req.body.imagenesOrden
          )
        )
      : normalizeImages(actual.imagenes || []);

    const uploadedImages = await uploadFilesToStorage(
      imagenes,
      'educacion/imagenes'
    );

    uploadedImagesPayload = uploadedImages.map((uploadedFile, index) =>
      mapUploadedFileToEducationImage(
        uploadedFile,
        requestedExistingImages.length + index
      )
    );

    const finalImages = normalizeImages([
      ...requestedExistingImages,
      ...uploadedImagesPayload
    ]).slice(0, 10);

    const currentImagePaths = normalizeImages(actual.imagenes || [])
      .map((imageItem) => {
        return imageItem.path || buildStoragePathFromPublicUrl(imageItem.url);
      })
      .filter(isNonEmptyString);

    const finalImagePaths = finalImages
      .map((imageItem) => {
        return imageItem.path || buildStoragePathFromPublicUrl(imageItem.url);
      })
      .filter(isNonEmptyString);

    const imagePathsToDelete = currentImagePaths.filter(
      (storagePath) => !finalImagePaths.includes(storagePath)
    );

    const payload = {
      titulo: finalTitle,
      resumen: finalDescription,
      cuerpo: finalBody,
      nivel: finalLevel,
      tipo_educacion: finalType,
      cover_img: finalCoverUrl,
      imagenes: finalImages,
      archivo_url: finalFileUrl,
      archivo_nombre: finalFileName,
      archivo_tipo: finalFileType
    };

    const { data, error } = await supabase
      .from(EDUCATION_TABLE)
      .update(payload)
      .eq('id', moduleId)
      .select('*')
      .single();

    if (error) {
      await deleteFilesFromStorage([
        uploadedCover?.path,
        uploadedDocument?.path,
        ...uploadedImagesPayload.map((imageItem) => imageItem.path)
      ]);

      throw error;
    }

    await deleteFilesFromStorage([
      oldCoverPathToDelete,
      oldFilePathToDelete,
      ...imagePathsToDelete
    ]);

    return res.json(mapEducationResponse(data as EducationDB));
  } catch (error: any) {
    await deleteFilesFromStorage([
      uploadedCover?.path,
      uploadedDocument?.path,
      ...uploadedImagesPayload.map((imageItem) => imageItem.path)
    ]);

    console.error('Error en updateEducationModule:', error);

    return res.status(500).json({
      message: 'Error al actualizar módulo educativo.',
      error: error.message || 'Error desconocido'
    });
  }
};

export const deleteEducationModule = async (req: Request, res: Response) => {
  try {
    const moduleId = String(req.params.id || '').trim();

    if (!moduleId) {
      return res.status(400).json({
        message: 'ID de módulo no proporcionado.'
      });
    }

    const actual = await getCurrentEducationModule(moduleId);

    await supabase
      .from(EDUCACION_USUARIO_TABLE)
      .delete()
      .eq('educacion_id', moduleId);

    const { error } = await supabase
      .from(EDUCATION_TABLE)
      .delete()
      .eq('id', moduleId);

    if (error) {
      throw error;
    }

    if (actual) {
      const coverPath = buildStoragePathFromPublicUrl(actual.cover_img);
      const documentPath = buildStoragePathFromPublicUrl(actual.archivo_url);

      const imagePaths = normalizeImages(actual.imagenes || [])
        .map((imageItem) => {
          return imageItem.path || buildStoragePathFromPublicUrl(imageItem.url);
        })
        .filter(isNonEmptyString);

      await deleteFilesFromStorage([coverPath, documentPath, ...imagePaths]);
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

/* =============================== */
/* EDUCACIÓN - PROGRESO REAL */
/* =============================== */

export const getMyEducationProgress = async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);

    if (!user) {
      return res.status(401).json({
        ok: false,
        message: 'Usuario no autenticado.'
      });
    }

    const { data, error } = await supabase
      .from(EDUCACION_USUARIO_TABLE)
      .select('id, usuario_id, educacion_id, fecha_lectura')
      .eq('usuario_id', user.id)
      .order('fecha_lectura', { ascending: false });

    if (error) {
      throw error;
    }

    const progreso = ((data || []) as EducacionUsuarioDB[]).map(
      mapEducacionUsuarioResponse
    );

    const completedIds = progreso.map((item) => item.educacion_id);

    return res.status(200).json({
      ok: true,

      progreso,
      progress: progreso,

      completados: completedIds,
      completedIds,

      totalCompletados: completedIds.length,
      total_completed: completedIds.length
    });
  } catch (error: any) {
    console.error('Error en getMyEducationProgress:', error);

    return res.status(500).json({
      ok: false,
      message: 'Error al obtener progreso educativo.',
      error: error.message || 'Error desconocido'
    });
  }
};

export const completeEducationModule = async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const moduleId = String(req.params.id || '').trim();

    if (!user) {
      return res.status(401).json({
        ok: false,
        message: 'Usuario no autenticado.'
      });
    }

    if (!moduleId) {
      return res.status(400).json({
        ok: false,
        message: 'ID de módulo no proporcionado.'
      });
    }

    const module = await getCurrentEducationModule(moduleId);

    if (!module) {
      return res.status(404).json({
        ok: false,
        message: 'Módulo educativo no encontrado.'
      });
    }

    // 1. Verificar si el usuario ya registró progreso en este módulo
    const { data: existente, error: selectError } = await supabase
      .from(EDUCACION_USUARIO_TABLE)
      .select('*')
      .eq('usuario_id', user.id)
      .eq('educacion_id', moduleId)
      .maybeSingle();

    if (selectError) {
      throw selectError;
    }

    let registroFinal = existente;

    // 2. Si no existe, creamos el registro de lectura con la hora local ajustada
    if (!existente) {
      // CORRECCIÓN HORARIA: Forzamos el cálculo restando el desfase local de minutos a milisegundos
      const tzoffset = (new Date()).getTimezoneOffset() * 60000;
      const localISODate = new Date(Date.now() - tzoffset).toISOString();

      const payload = {
        usuario_id: user.id,
        educacion_id: moduleId,
        fecha_lectura: localISODate
      };

      const { data: insertado, error: insertError } = await supabase
        .from(EDUCACION_USUARIO_TABLE)
        .insert(payload)
        .select('id, usuario_id, educacion_id, fecha_lectura')
        .single();

      if (insertError) {
        throw insertError;
      }
      
      registroFinal = insertado;
    }

    const progreso = mapEducacionUsuarioResponse(registroFinal as EducacionUsuarioDB);

    return res.status(200).json({
      ok: true,
      message: existente 
        ? 'El módulo ya estaba marcado como completado.' 
        : 'Módulo educativo marcado como completado exitosamente.',
      progreso,
      progress: progreso,
      modulo: {
        ...mapEducationResponse(module),
        status: 'Completado',
        estatus: 'Completado'
      }
    });
  } catch (error: any) {
    console.error('Error en completeEducationModule:', error);

    return res.status(500).json({
      ok: false,
      message: 'Error al completar módulo educativo.',
      error: error.message || 'Error desconocido'
    });
  }
};