import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import {
  uploadFileToStorage,
  uploadFilesToStorage,
  deleteFilesFromStorage,
  UploadedStorageFile
} from '../src/service/storage.service';

interface QuestionnaireImage {
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

interface NormalizedQuestionnaireImage {
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

interface CuestionarioDB {
  id: string;
  titulo: string;
  resumen: string;
  riesgo: string | null;
  cover_img: string | null;
  puntaje_maximo: number | null;
  archivo_url: string | null;
  archivo_nombre: string | null;
  archivo_tipo: string | null;
  imagenes: string[] | null;
}

interface CuestionarioUsuarioDB {
  id: string;
  usuario_id: string;
  cuestionario_id: string;
  fecha_respuesta: string;
  puntaje_obtenido: number | null;
  estatus: string | null;
}

interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

const QUESTIONNAIRES_TABLE =
  process.env.SUPABASE_QUESTIONNAIRES_TABLE || 'cuestionario';

const CUESTIONARIO_USUARIO_TABLE = 'cuestionario_usuario';

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

const normalizeRiskForDB = (value?: string): string => {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (normalized === 'alto') return 'alto';
  if (normalized === 'bajo') return 'bajo';

  return 'medio';
};

const normalizeRiskForFrontend = (value?: string | null): string => {
  const normalized = normalizeRiskForDB(value || '');

  if (normalized === 'alto') return 'ALTO';
  if (normalized === 'bajo') return 'BAJO';

  return 'MEDIO';
};

const normalizeQuestionnaireStatus = (value?: string | null): string => {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (normalized === 'pendiente') return 'pendiente';
  if (normalized === 'en proceso' || normalized === 'en_proceso') {
    return 'en proceso';
  }

  return 'completado';
};

const normalizeScore = (
  value: unknown,
  fallbackValue: number
): number => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) return fallbackValue;

  const rounded = Math.round(parsed);

  if (rounded < 0) return 0;
  if (rounded > fallbackValue) return fallbackValue;

  return rounded;
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

const normalizeImagesFromUrls = (
  imageUrls: string[]
): NormalizedQuestionnaireImage[] => {
  return imageUrls
    .filter(isNonEmptyString)
    .map((imageUrl: string, index: number): NormalizedQuestionnaireImage => {
      const imagePath = buildStoragePathFromPublicUrl(imageUrl);
      const imageName = `imagen-${index + 1}`;

      return {
        id: `${index + 1}-${imageUrl}`,
        name: imageName,
        originalName: imageName,
        previewUrl: imageUrl,
        url: imageUrl,
        path: imagePath,
        type: '',
        size: null,
        order: index + 1
      };
    });
};

const normalizeImagePayload = (
  images: Array<QuestionnaireImage | string>
): NormalizedQuestionnaireImage[] => {
  return images
    .map(
      (
        imageItem: QuestionnaireImage | string,
        index: number
      ): NormalizedQuestionnaireImage => {
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
    )
    .filter((imageItem: NormalizedQuestionnaireImage): boolean => {
      const imageUrl = imageItem.url || '';

      if (!imageUrl) return false;
      if (imageUrl.startsWith('blob:')) return false;
      if (imageUrl.startsWith('data:')) return false;

      return true;
    });
};

const mapUploadedFileToQuestionnaireImage = (
  uploadedFile: UploadedStorageFile,
  index: number
): NormalizedQuestionnaireImage => {
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

const mapQuestionnaireResponse = (item: CuestionarioDB) => {
  const images = normalizeImagesFromUrls(item.imagenes || []);
  const risk = normalizeRiskForFrontend(item.riesgo);

  return {
    id: item.id,

    title: item.titulo,
    titulo: item.titulo,

    description: item.resumen,
    resumen: item.resumen,

    risk,
    riesgo: item.riesgo || 'medio',
    difficulty: risk,

    category: 'General',

    questionsCount: item.puntaje_maximo || 10,
    questions_count: item.puntaje_maximo || 10,
    puntajeMaximo: item.puntaje_maximo || 10,
    puntaje_maximo: item.puntaje_maximo || 10,

    coverUrl: item.cover_img || '',
    cover_img: item.cover_img || '',
    coverName: item.cover_img ? 'Portada' : '',

    fileUrl: item.archivo_url || '',
    fileName: item.archivo_nombre || '',
    archivo_url: item.archivo_url || '',
    archivo_nombre: item.archivo_nombre || '',
    archivo_tipo: item.archivo_tipo || '',

    images,
    imagenes: images
  };
};

const mapCuestionarioUsuarioResponse = (item: CuestionarioUsuarioDB) => {
  const estatus = normalizeQuestionnaireStatus(item.estatus);

  return {
    id: item.id,

    usuarioId: item.usuario_id,
    usuario_id: item.usuario_id,

    questionnaireId: item.cuestionario_id,
    cuestionarioId: item.cuestionario_id,
    cuestionario_id: item.cuestionario_id,

    fechaRespuesta: item.fecha_respuesta,
    fecha_respuesta: item.fecha_respuesta,

    puntajeObtenido: item.puntaje_obtenido || 0,
    puntaje_obtenido: item.puntaje_obtenido || 0,
    score: item.puntaje_obtenido || 0,

    estatus,
    status: estatus === 'completado' ? 'Completado' : 'Pendiente'
  };
};

/* =============================== */
/* CONSULTAS AUXILIARES */
/* =============================== */

const getCurrentQuestionnaire = async (
  id: string
): Promise<CuestionarioDB | null> => {
  const { data, error } = await supabase
    .from(QUESTIONNAIRES_TABLE)
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;

  return data as CuestionarioDB;
};

/* =============================== */
/* CUESTIONARIOS - CRUD */
/* =============================== */

export const getQuestionnaires = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from(QUESTIONNAIRES_TABLE)
      .select('*')
      .order('titulo', { ascending: true });

    if (error) {
      throw error;
    }

    const questionnaires = (data || []) as CuestionarioDB[];

    return res.json(
      questionnaires.map((item: CuestionarioDB) =>
        mapQuestionnaireResponse(item)
      )
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
  let uploadedCover: UploadedStorageFile | null = null;
  let uploadedDocument: UploadedStorageFile | null = null;
  let uploadedImagesPayload: NormalizedQuestionnaireImage[] = [];

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
      coverUrl,
      cover_img,
      fileUrl,
      archivo_url,
      fileName,
      archivo_nombre,
      archivo_tipo,
      images = []
    } = req.body;

    const finalTitle = String(title || titulo || '').trim();
    const finalDescription = String(description || resumen || '').trim();
    const finalRisk = normalizeRiskForDB(risk || riesgo || difficulty);

    const score = Number(
      puntajeMaximo || puntaje_maximo || questionsCount || questions_count || 10
    );

    const finalScore =
      Number.isFinite(score) && score > 0 ? Math.round(score) : 10;

    if (!finalTitle || !finalDescription) {
      return res.status(400).json({
        message: 'Título y descripción son obligatorios.'
      });
    }

    const { portada, archivo, imagenes } = getFilesFromRequest(req);

    if (portada) {
      uploadedCover = await uploadFileToStorage(portada, {
        folder: 'cuestionarios/portadas',
        order: 1
      });
    }

    if (archivo) {
      uploadedDocument = await uploadFileToStorage(archivo, {
        folder: 'cuestionarios/documentos',
        order: 1
      });
    }

    const uploadedImages = await uploadFilesToStorage(
      imagenes,
      'cuestionarios/imagenes'
    );

    uploadedImagesPayload = uploadedImages.map(
      (
        uploadedFile: UploadedStorageFile,
        index: number
      ): NormalizedQuestionnaireImage =>
        mapUploadedFileToQuestionnaireImage(uploadedFile, index)
    );

    const parsedImages =
      typeof images === 'string'
        ? parseJsonArray<QuestionnaireImage>(images)
        : Array.isArray(images)
          ? images
          : [];

    const existingImages = normalizeImagePayload(parsedImages);

    const finalImages = [...existingImages, ...uploadedImagesPayload].slice(
      0,
      10
    );

    const imageUrls = finalImages
      .map((imageItem: NormalizedQuestionnaireImage): string => imageItem.url)
      .filter(isNonEmptyString);

    const payload = {
      titulo: finalTitle,
      resumen: finalDescription,
      riesgo: finalRisk,
      cover_img: uploadedCover?.url || coverUrl || cover_img || null,
      puntaje_maximo: finalScore,
      archivo_url: uploadedDocument?.url || fileUrl || archivo_url || null,
      archivo_nombre:
        uploadedDocument?.name || fileName || archivo_nombre || null,
      archivo_tipo: uploadedDocument?.type || archivo_tipo || null,
      imagenes: imageUrls
    };

    const { data, error } = await supabase
      .from(QUESTIONNAIRES_TABLE)
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      await deleteFilesFromStorage([
        uploadedCover?.path,
        uploadedDocument?.path,
        ...uploadedImagesPayload.map(
          (imageItem: NormalizedQuestionnaireImage): string => imageItem.path
        )
      ]);

      throw error;
    }

    return res
      .status(201)
      .json(mapQuestionnaireResponse(data as CuestionarioDB));
  } catch (error: any) {
    await deleteFilesFromStorage([
      uploadedCover?.path,
      uploadedDocument?.path,
      ...uploadedImagesPayload.map(
        (imageItem: NormalizedQuestionnaireImage): string => imageItem.path
      )
    ]);

    console.error('Error en createQuestionnaire:', error);

    return res.status(500).json({
      message: 'Error al crear cuestionario.',
      error: error.message || 'Error desconocido'
    });
  }
};

export const updateQuestionnaire = async (req: Request, res: Response) => {
  let uploadedCover: UploadedStorageFile | null = null;
  let uploadedDocument: UploadedStorageFile | null = null;
  let uploadedImagesPayload: NormalizedQuestionnaireImage[] = [];

  try {
    const questionnaireId = String(req.params.id || '').trim();

    if (!questionnaireId) {
      return res.status(400).json({
        message: 'ID de cuestionario no proporcionado.'
      });
    }

    const actual = await getCurrentQuestionnaire(questionnaireId);

    if (!actual) {
      return res.status(404).json({
        message: 'Cuestionario no encontrado.'
      });
    }

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
      coverUrl,
      cover_img,
      fileUrl,
      archivo_url,
      fileName,
      archivo_nombre,
      archivo_tipo,
      images = [],
      imagenesOrden,
      removeCover = 'false',
      removeFile = 'false'
    } = req.body;

    const finalTitle = String(title || titulo || '').trim();
    const finalDescription = String(description || resumen || '').trim();
    const finalRisk = normalizeRiskForDB(risk || riesgo || difficulty);

    const score = Number(
      puntajeMaximo ||
        puntaje_maximo ||
        questionsCount ||
        questions_count ||
        actual.puntaje_maximo ||
        10
    );

    const finalScore =
      Number.isFinite(score) && score > 0 ? Math.round(score) : 10;

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
        folder: 'cuestionarios/portadas',
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
        folder: 'cuestionarios/documentos',
        order: 1
      });

      finalFileUrl = uploadedDocument.url;
      finalFileName = uploadedDocument.name;
      finalFileType = uploadedDocument.type;
    }

    if (!archivo && !removeFile && (fileUrl || archivo_url)) {
      finalFileUrl = fileUrl || archivo_url;
      finalFileName = fileName || archivo_nombre || finalFileName;
      finalFileType = archivo_tipo || finalFileType;
    }

    if (!portada && !removeCover && (coverUrl || cover_img)) {
      finalCoverUrl = coverUrl || cover_img;
    }

    const hasImagesPayload =
      typeof req.body.images !== 'undefined' ||
      typeof req.body.imagenes !== 'undefined' ||
      typeof req.body.imagenesOrden !== 'undefined';

    const requestedExistingImages = hasImagesPayload
      ? normalizeImagePayload(
          parseJsonArray<QuestionnaireImage>(
            images || req.body.imagenes || imagenesOrden
          )
        )
      : normalizeImagesFromUrls(actual.imagenes || []);

    const uploadedImages = await uploadFilesToStorage(
      imagenes,
      'cuestionarios/imagenes'
    );

    uploadedImagesPayload = uploadedImages.map(
      (
        uploadedFile: UploadedStorageFile,
        index: number
      ): NormalizedQuestionnaireImage =>
        mapUploadedFileToQuestionnaireImage(
          uploadedFile,
          requestedExistingImages.length + index
        )
    );

    const finalImages = [...requestedExistingImages, ...uploadedImagesPayload]
      .slice(0, 10);

    const finalImageUrls = finalImages
      .map((imageItem: NormalizedQuestionnaireImage): string => imageItem.url)
      .filter(isNonEmptyString);

    const currentImagePaths = normalizeImagesFromUrls(actual.imagenes || [])
      .map((imageItem: NormalizedQuestionnaireImage): string => {
        return imageItem.path || buildStoragePathFromPublicUrl(imageItem.url);
      })
      .filter(isNonEmptyString);

    const finalImagePaths = finalImages
      .map((imageItem: NormalizedQuestionnaireImage): string => {
        return imageItem.path || buildStoragePathFromPublicUrl(imageItem.url);
      })
      .filter(isNonEmptyString);

    const imagePathsToDelete = currentImagePaths.filter(
      (storagePath: string): boolean => !finalImagePaths.includes(storagePath)
    );

    const payload = {
      titulo: finalTitle,
      resumen: finalDescription,
      riesgo: finalRisk,
      cover_img: finalCoverUrl,
      puntaje_maximo: finalScore,
      archivo_url: finalFileUrl,
      archivo_nombre: finalFileName,
      archivo_tipo: finalFileType,
      imagenes: finalImageUrls
    };

    const { data, error } = await supabase
      .from(QUESTIONNAIRES_TABLE)
      .update(payload)
      .eq('id', questionnaireId)
      .select('*')
      .single();

    if (error) {
      await deleteFilesFromStorage([
        uploadedCover?.path,
        uploadedDocument?.path,
        ...uploadedImagesPayload.map(
          (imageItem: NormalizedQuestionnaireImage): string => imageItem.path
        )
      ]);

      throw error;
    }

    await deleteFilesFromStorage([
      oldCoverPathToDelete,
      oldFilePathToDelete,
      ...imagePathsToDelete
    ]);

    return res.json(mapQuestionnaireResponse(data as CuestionarioDB));
  } catch (error: any) {
    await deleteFilesFromStorage([
      uploadedCover?.path,
      uploadedDocument?.path,
      ...uploadedImagesPayload.map(
        (imageItem: NormalizedQuestionnaireImage): string => imageItem.path
      )
    ]);

    console.error('Error en updateQuestionnaire:', error);

    return res.status(500).json({
      message: 'Error al actualizar cuestionario.',
      error: error.message || 'Error desconocido'
    });
  }
};

export const deleteQuestionnaire = async (req: Request, res: Response) => {
  try {
    const questionnaireId = String(req.params.id || '').trim();

    if (!questionnaireId) {
      return res.status(400).json({
        message: 'ID de cuestionario no proporcionado.'
      });
    }

    const actual = await getCurrentQuestionnaire(questionnaireId);

    await supabase
      .from(CUESTIONARIO_USUARIO_TABLE)
      .delete()
      .eq('cuestionario_id', questionnaireId);

    const { error } = await supabase
      .from(QUESTIONNAIRES_TABLE)
      .delete()
      .eq('id', questionnaireId);

    if (error) {
      throw error;
    }

    if (actual) {
      const coverPath = buildStoragePathFromPublicUrl(actual.cover_img);
      const documentPath = buildStoragePathFromPublicUrl(actual.archivo_url);

      const imagePaths = normalizeImagesFromUrls(actual.imagenes || [])
        .map((imageItem: NormalizedQuestionnaireImage): string => {
          return (
            imageItem.path || buildStoragePathFromPublicUrl(imageItem.url)
          );
        })
        .filter(isNonEmptyString);

      await deleteFilesFromStorage([coverPath, documentPath, ...imagePaths]);
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

/* =============================== */
/* CUESTIONARIOS - PROGRESO REAL */
/* =============================== */

export const getMyQuestionnaireProgress = async (
  req: Request,
  res: Response
) => {
  try {
    const user = getAuthenticatedUser(req);

    if (!user) {
      return res.status(401).json({
        ok: false,
        message: 'Usuario no autenticado.'
      });
    }

    const { data, error } = await supabase
      .from(CUESTIONARIO_USUARIO_TABLE)
      .select(
        'id, usuario_id, cuestionario_id, fecha_respuesta, puntaje_obtenido, estatus'
      )
      .eq('usuario_id', user.id)
      .order('fecha_respuesta', { ascending: false });

    if (error) {
      throw error;
    }

    const progreso = ((data || []) as CuestionarioUsuarioDB[]).map(
      mapCuestionarioUsuarioResponse
    );

    const completedIds = progreso
      .filter((item) => item.estatus === 'completado')
      .map((item) => item.cuestionario_id);

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
    console.error('Error en getMyQuestionnaireProgress:', error);

    return res.status(500).json({
      ok: false,
      message: 'Error al obtener progreso de cuestionarios.',
      error: error.message || 'Error desconocido'
    });
  }
};

export const completeQuestionnaire = async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const questionnaireId = String(req.params.id || '').trim();

    if (!user) {
      return res.status(401).json({
        ok: false,
        message: 'Usuario no autenticado.'
      });
    }

    if (!questionnaireId) {
      return res.status(400).json({
        ok: false,
        message: 'ID de cuestionario no proporcionado.'
      });
    }

    const questionnaire = await getCurrentQuestionnaire(questionnaireId);

    if (!questionnaire) {
      return res.status(404).json({
        ok: false,
        message: 'Cuestionario no encontrado.'
      });
    }

    const maxScore = Number(questionnaire.puntaje_maximo || 100);
    const safeMaxScore =
      Number.isFinite(maxScore) && maxScore > 0 ? Math.round(maxScore) : 100;

    const requestScore =
      req.body?.score ??
      req.body?.puntaje_obtenido ??
      req.body?.puntajeObtenido ??
      safeMaxScore;

    const finalScore = normalizeScore(requestScore, safeMaxScore);

    const payload = {
      usuario_id: user.id,
      cuestionario_id: questionnaireId,
      fecha_respuesta: new Date().toISOString(),
      puntaje_obtenido: finalScore,
      estatus: 'completado'
    };

    const { data, error } = await supabase
      .from(CUESTIONARIO_USUARIO_TABLE)
      .upsert(payload, {
        onConflict: 'usuario_id,cuestionario_id'
      })
      .select(
        'id, usuario_id, cuestionario_id, fecha_respuesta, puntaje_obtenido, estatus'
      )
      .single();

    if (error) {
      throw error;
    }

    const progreso = mapCuestionarioUsuarioResponse(
      data as CuestionarioUsuarioDB
    );

    return res.status(200).json({
      ok: true,
      message: 'Cuestionario marcado como completado.',

      progreso,
      progress: progreso,

      cuestionario: {
        ...mapQuestionnaireResponse(questionnaire),
        status: 'Completado',
        estatus: 'completado',
        score: finalScore,
        puntaje_obtenido: finalScore
      }
    });
  } catch (error: any) {
    console.error('Error en completeQuestionnaire:', error);

    return res.status(500).json({
      ok: false,
      message: 'Error al completar cuestionario.',
      error: error.message || 'Error desconocido'
    });
  }
};
