import { Request, Response } from 'express';
import { supabase } from '../../config/supabase';
import {
  uploadFileToStorage,
  uploadFilesToStorage,
  deleteFilesFromStorage,
  UploadedStorageFile
} from '../../services/storage.service';

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
  imagenes: Array<string | QuestionnaireImage> | null;
  archivo_csv_nombre?: string | null;
  archivo_csv_importado_en?: string | null;
  creado_en?: string | null;
}

interface EjercicioCuestionarioDB {
  id: string;
  pregunta: string;
  respuesta: string;
  alternativas: string[];
  cuestionario_id: string | null;
  puntaje: number;
  orden: number;
}

interface RespuestaDetalle {
  ejercicio_id: string;
  pregunta: string;
  alternativas: string[];
  respuesta_usuario: string;
  respuesta_correcta: string;
  correcta: boolean;
  puntaje: number;
  puntaje_obtenido: number;
  orden: number;
}

interface CuestionarioUsuarioDB {
  id: string;
  usuario_id: string;
  cuestionario_id: string;
  fecha_respuesta: string;
  puntaje_obtenido: number | null;
  estatus: string;
  respuestas?: RespuestaDetalle[] | null;
}

interface RespuestaUsuarioPayload {
  ejercicio_id?: string;
  ejercicioId?: string;
  id?: string;
  respuesta?: string;
  respuesta_usuario?: string;
  respuestaUsuario?: string;
  alternativa?: string;
  alternativa_id?: string;
  alternativaId?: string;
}

interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

const QUESTIONNAIRES_TABLE =
  process.env.SUPABASE_QUESTIONNAIRES_TABLE || 'cuestionario';

const EJERCICIO_CUESTIONARIO_TABLE = 'ejercicio_cuestionario';
const CUESTIONARIO_USUARIO_TABLE = 'cuestionario_usuario';

const STORAGE_BUCKET =
  process.env.SUPABASE_STORAGE_BUCKET?.trim() || 'municipal-files';

const DEFAULT_COVER_IMAGE =
  'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?auto=format&fit=crop&w=1200&q=80';

const getAuthenticatedUser = (req: Request): AuthenticatedUser | null => {
  const user = (req as any).user;

  if (!user?.id) return null;

  return {
    id: String(user.id),
    email: String(user.email || ''),
    role: user.role === 'admin' ? 'admin' : 'user'
  };
};

const normalizeText = (value?: string | null): string => {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
};

const normalizeHeader = (value?: string | null): string => {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
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

const getClientErrorStatus = (error: any) => {
  const message = String(error?.message || '');

  if (
    message.includes('CSV') ||
    message.startsWith('Fila ') ||
    message.includes('respuesta_correcta') ||
    message.includes('alternativa') ||
    message.includes('pregunta')
  ) {
    return 400;
  }

  return 500;
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
  const normalized = normalizeText(value);

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

const normalizeStatus = (value?: string | null): string => {
  const normalized = normalizeText(value);

  if (normalized === 'pendiente') return 'pendiente';
  if (normalized === 'en proceso' || normalized === 'en_proceso') {
    return 'en proceso';
  }

  return 'completado';
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

const getUploadedCsvFile = (req: Request): Express.Multer.File | null => {
  if (req.file) return req.file;

  const files = req.files as
    | {
        [fieldname: string]: Express.Multer.File[];
      }
    | undefined;

  return (
    files?.csv?.[0] ||
    files?.archivo_csv?.[0] ||
    files?.preguntas?.[0] ||
    files?.ejercicios?.[0] ||
    null
  );
};

const normalizeImagesFromDb = (
  rawImages: Array<string | QuestionnaireImage> | null | undefined
): NormalizedQuestionnaireImage[] => {
  if (!Array.isArray(rawImages)) return [];

  return rawImages
    .map((imageItem, index): NormalizedQuestionnaireImage => {
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

      return {
        id: imageItem.id || `${index + 1}-${imageUrl || imagePath || imageName}`,
        name: imageName,
        originalName: imageItem.originalName || imageName,
        previewUrl: imageItem.previewUrl || imageUrl,
        url: imageUrl,
        path: imagePath,
        type: imageItem.type || '',
        size: typeof imageItem.size === 'number' ? imageItem.size : null,
        order: imageItem.order || index + 1
      };
    })
    .filter((imageItem) => {
      if (!imageItem.url && !imageItem.path) return false;
      if (imageItem.url.startsWith('blob:')) return false;
      if (imageItem.url.startsWith('data:')) return false;

      return true;
    })
    .sort((a, b) => a.order - b.order);
};

const normalizeImagePayload = (
  images: Array<QuestionnaireImage | string>
): NormalizedQuestionnaireImage[] => {
  return normalizeImagesFromDb(images);
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

const mapQuestionnaireResponse = (item: CuestionarioDB) => {
  const images = normalizeImagesFromDb(item.imagenes || []);
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

    questionsCount: item.puntaje_maximo || 0,
    questions_count: item.puntaje_maximo || 0,
    puntajeMaximo: item.puntaje_maximo || 0,
    puntaje_maximo: item.puntaje_maximo || 0,

    coverUrl: item.cover_img || '',
    cover_img: item.cover_img || '',
    coverName: item.cover_img ? 'Portada' : '',

    fileUrl: item.archivo_url || '',
    fileName: item.archivo_nombre || '',
    archivo_url: item.archivo_url || '',
    archivo_nombre: item.archivo_nombre || '',
    archivo_tipo: item.archivo_tipo || '',

    images,
    imagenes: images,

    archivoCsvNombre: item.archivo_csv_nombre || '',
    archivo_csv_nombre: item.archivo_csv_nombre || '',
    archivoCsvImportadoEn: item.archivo_csv_importado_en || null,
    archivo_csv_importado_en: item.archivo_csv_importado_en || null,

    createdAt: item.creado_en || null,
    creado_en: item.creado_en || null
  };
};

const mapProgressResponse = (item: CuestionarioUsuarioDB) => {
  const estatus = normalizeStatus(item.estatus);
  const respuestas = Array.isArray(item.respuestas) ? item.respuestas : [];

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
    status: estatus === 'completado' ? 'Completado' : 'Pendiente',

    respuestas
  };
};

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

const getQuestionnaireExercises = async (
  questionnaireId: string
): Promise<EjercicioCuestionarioDB[]> => {
  const { data, error } = await supabase
    .from(EJERCICIO_CUESTIONARIO_TABLE)
    .select('id, pregunta, respuesta, alternativas, cuestionario_id, puntaje, orden')
    .eq('cuestionario_id', questionnaireId)
    .order('orden', { ascending: true });

  if (error) {
    throw error;
  }

  return (data || []) as EjercicioCuestionarioDB[];
};

const getUserQuestionnaireProgress = async (
  userId: string,
  questionnaireId: string
): Promise<CuestionarioUsuarioDB | null> => {
  const { data, error } = await supabase
    .from(CUESTIONARIO_USUARIO_TABLE)
    .select(
      'id, usuario_id, cuestionario_id, fecha_respuesta, puntaje_obtenido, estatus, respuestas'
    )
    .eq('usuario_id', userId)
    .eq('cuestionario_id', questionnaireId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as CuestionarioUsuarioDB | null;
};

const parseCsvLine = (line: string, separator = ';'): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === separator && !inQuotes) {
      result.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  result.push(current.trim());

  return result;
};

const resolveCorrectAnswer = (
  rawValue: string,
  alternatives: string[],
  rowNumber: number
): string => {
  const value = String(rawValue || '').trim();

  if (!value) {
    throw new Error(`Fila ${rowNumber}: falta respuesta_correcta.`);
  }

  const normalized = normalizeText(value);

  const letterMap: Record<string, number> = {
    a: 0,
    b: 1,
    c: 2,
    d: 3
  };

  if (typeof letterMap[normalized] !== 'number') {
    throw new Error(
      `Fila ${rowNumber}: respuesta_correcta debe ser solo a, b, c o d.`
    );
  }

  const index = letterMap[normalized];

  if (!alternatives[index]) {
    throw new Error(
      `Fila ${rowNumber}: respuesta_correcta "${value}" no tiene alternativa asociada.`
    );
  }

  return alternatives[index];
};

const parseExercisesCsv = (
  file: Express.Multer.File,
  questionnaireId: string
) => {
  const csvText = file.buffer.toString('utf8').replace(/^\uFEFF/, '');
  const rawLines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (rawLines.length < 2) {
    throw new Error(
      'El archivo debe ser en formato CSV, incluyendo una fila de encabezados y al menos una pregunta.'
    );
  }

  const headers = parseCsvLine(rawLines[0]).map(normalizeHeader);

  const requiredHeaders = [
    'pregunta',
    'alternativa_a',
    'alternativa_b',
    'alternativa_c',
    'alternativa_d',
    'respuesta_correcta',
    'puntaje'
  ];

  const missingHeaders = requiredHeaders.filter(
    (header) => !headers.includes(header)
  );

  if (missingHeaders.length > 0) {
    throw new Error(
      `El CSV debe tener exactamente estas columnas separadas por punto y coma: ${requiredHeaders.join(
        ';'
      )}. Faltan: ${missingHeaders.join(', ')}.`
    );
  }

  const getCell = (cells: string[], aliases: string[]) => {
    for (const alias of aliases.map(normalizeHeader)) {
      const index = headers.indexOf(alias);

      if (index !== -1) {
        return cells[index] || '';
      }
    }

    return '';
  };

  return rawLines.slice(1).map((line, index) => {
    const rowNumber = index + 2;
    const cells = parseCsvLine(line);

    const pregunta = getCell(cells, ['pregunta', 'enunciado']).trim();

    const alternatives = [
      getCell(cells, ['alternativa_a']),
      getCell(cells, ['alternativa_b']),
      getCell(cells, ['alternativa_c']),
      getCell(cells, ['alternativa_d'])
    ].map((value) => value.trim());

    const respuestaCorrectaRaw = getCell(cells, [
      'respuesta_correcta',
      'respuesta',
      'correcta'
    ]);

    const puntajeRaw = getCell(cells, ['puntaje', 'puntos']);
    const ordenRaw = getCell(cells, ['orden']);

    if (!pregunta) {
      throw new Error(`Fila ${rowNumber}: falta la pregunta.`);
    }

    if (alternatives.some((alternative) => !alternative)) {
      throw new Error(
        `Fila ${rowNumber}: debes completar alternativa_a, alternativa_b, alternativa_c y alternativa_d.`
      );
    }

    const respuesta = resolveCorrectAnswer(
      respuestaCorrectaRaw,
      alternatives,
      rowNumber
    );

    const parsedScore = Number(puntajeRaw || 1);
    const parsedOrder = Number(ordenRaw || index + 1);

    const puntaje =
      Number.isFinite(parsedScore) && parsedScore > 0
        ? Math.round(parsedScore)
        : 1;

    const orden =
      Number.isFinite(parsedOrder) && parsedOrder > 0
        ? Math.round(parsedOrder)
        : index + 1;

    return {
      pregunta,
      respuesta,
      alternativas: alternatives,
      cuestionario_id: questionnaireId,
      puntaje,
      orden
    };
  });
};

type ParsedCsvExercise = ReturnType<typeof parseExercisesCsv>[number];

const replaceQuestionnaireExercisesFromCsv = async ({
  questionnaireId,
  csvFile,
  parsedExercises
}: {
  questionnaireId: string;
  csvFile: Express.Multer.File;
  parsedExercises?: ParsedCsvExercise[] | null;
}) => {
  const exercises = (parsedExercises || parseExercisesCsv(csvFile, questionnaireId))
    .map((exercise) => ({
      ...exercise,
      cuestionario_id: questionnaireId
    }))
    .sort((a, b) => a.orden - b.orden);

  if (exercises.length === 0) {
    throw new Error('El CSV debe incluir al menos una pregunta válida.');
  }

  const puntajeTotal = exercises.reduce(
    (total, item) => total + Number(item.puntaje || 0),
    0
  );

  await supabase
    .from(CUESTIONARIO_USUARIO_TABLE)
    .delete()
    .eq('cuestionario_id', questionnaireId);

  await supabase
    .from(EJERCICIO_CUESTIONARIO_TABLE)
    .delete()
    .eq('cuestionario_id', questionnaireId);

  const { data, error } = await supabase
    .from(EJERCICIO_CUESTIONARIO_TABLE)
    .insert(exercises)
    .select('id, pregunta, alternativas, cuestionario_id, puntaje, orden');

  if (error) {
    throw error;
  }

  const importedAt = new Date().toISOString();
  const csvName = csvFile.originalname || 'preguntas.csv';

  const { error: updateError } = await supabase
    .from(QUESTIONNAIRES_TABLE)
    .update({
      puntaje_maximo: puntajeTotal,
      archivo_csv_nombre: csvName,
      archivo_csv_importado_en: importedAt
    })
    .eq('id', questionnaireId);

  if (updateError) {
    throw updateError;
  }

  return {
    exercises: data || [],
    totalPreguntas: exercises.length,
    total_preguntas: exercises.length,
    puntajeMaximo: puntajeTotal,
    puntaje_maximo: puntajeTotal,
    archivoCsvNombre: csvName,
    archivo_csv_nombre: csvName,
    archivoCsvImportadoEn: importedAt,
    archivo_csv_importado_en: importedAt
  };
};

export const getQuestionnaires = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from(QUESTIONNAIRES_TABLE)
      .select('*')
      .order('titulo', { ascending: true });

    if (error) throw error;

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
  let createdQuestionnaireId = '';

  try {
    const {
      title,
      titulo,
      description,
      resumen,
      risk,
      riesgo,
      difficulty,
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

    if (!finalTitle || !finalDescription) {
      return res.status(400).json({
        message: 'Título y descripción son obligatorios.'
      });
    }

    const csvFile = getUploadedCsvFile(req);

    if (!csvFile) {
      return res.status(400).json({
        message: 'Debes adjuntar un CSV de preguntas para crear el cuestionario.'
      });
    }

    const parsedCsvExercises = parseExercisesCsv(
      csvFile,
      '__questionnaire_pending__'
    );

    const puntajeTotalCsv = parsedCsvExercises.reduce(
      (total, item) => total + Number(item.puntaje || 0),
      0
    );

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
      (uploadedFile: UploadedStorageFile, index: number) =>
        mapUploadedFileToQuestionnaireImage(uploadedFile, index)
    );

    const parsedImages =
      typeof images === 'string'
        ? parseJsonArray<QuestionnaireImage>(images)
        : Array.isArray(images)
          ? images
          : [];

    const existingImages = normalizeImagePayload(parsedImages);

    const finalImages = [
      ...existingImages,
      ...uploadedImagesPayload
    ].slice(0, 10);

    const imageUrls = finalImages
      .map((imageItem: NormalizedQuestionnaireImage): string => imageItem.url)
      .filter(isNonEmptyString);

    const payload = {
      titulo: finalTitle,
      resumen: finalDescription,
      riesgo: finalRisk,
      cover_img:
        uploadedCover?.url || coverUrl || cover_img || DEFAULT_COVER_IMAGE,
      puntaje_maximo: puntajeTotalCsv,
      archivo_url: uploadedDocument?.url || fileUrl || archivo_url || null,
      archivo_nombre:
        uploadedDocument?.name || fileName || archivo_nombre || null,
      archivo_tipo: uploadedDocument?.type || archivo_tipo || null,
      imagenes: imageUrls,
      archivo_csv_nombre: csvFile.originalname || 'preguntas.csv',
      archivo_csv_importado_en: new Date().toISOString()
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
        ...uploadedImagesPayload.map((imageItem) => imageItem.path)
      ]);

      throw error;
    }

    createdQuestionnaireId = String((data as CuestionarioDB).id);

    await replaceQuestionnaireExercisesFromCsv({
      questionnaireId: createdQuestionnaireId,
      csvFile,
      parsedExercises: parsedCsvExercises
    });

    const savedQuestionnaire =
      (await getCurrentQuestionnaire(createdQuestionnaireId)) ||
      (data as CuestionarioDB);

    return res
      .status(201)
      .json(mapQuestionnaireResponse(savedQuestionnaire as CuestionarioDB));
  } catch (error: any) {
    if (createdQuestionnaireId) {
      await supabase
        .from(CUESTIONARIO_USUARIO_TABLE)
        .delete()
        .eq('cuestionario_id', createdQuestionnaireId);

      await supabase
        .from(EJERCICIO_CUESTIONARIO_TABLE)
        .delete()
        .eq('cuestionario_id', createdQuestionnaireId);

      await supabase
        .from(QUESTIONNAIRES_TABLE)
        .delete()
        .eq('id', createdQuestionnaireId);
    }

    await deleteFilesFromStorage([
      uploadedCover?.path,
      uploadedDocument?.path,
      ...uploadedImagesPayload.map((imageItem) => imageItem.path)
    ]);

    console.error('Error en createQuestionnaire:', error);

    return res.status(getClientErrorStatus(error)).json({
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
        0
    );

    const finalScore =
      Number.isFinite(score) && score >= 0 ? Math.round(score) : 0;

    if (!finalTitle || !finalDescription) {
      return res.status(400).json({
        message: 'Título y descripción son obligatorios.'
      });
    }

    const { portada, archivo, imagenes } = getFilesFromRequest(req);
    const csvFile = getUploadedCsvFile(req);
    const tieneCsvImportado = Boolean(actual.archivo_csv_nombre);

    if (!csvFile && !tieneCsvImportado) {
      return res.status(400).json({
        message:
          'Este cuestionario no tiene CSV importado. Debes adjuntar un CSV para guardar los cambios.'
      });
    }

    const parsedCsvExercises = csvFile
      ? parseExercisesCsv(csvFile, questionnaireId)
      : null;

    let finalCoverUrl = actual.cover_img || DEFAULT_COVER_IMAGE;
    let finalFileUrl = actual.archivo_url;
    let finalFileName = actual.archivo_nombre;
    let finalFileType = actual.archivo_tipo;

    let oldCoverPathToDelete = '';
    let oldFilePathToDelete = '';

    if (removeCover === 'true') {
      oldCoverPathToDelete = buildStoragePathFromPublicUrl(actual.cover_img);
      finalCoverUrl = DEFAULT_COVER_IMAGE;
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

    if (!archivo && removeFile !== 'true' && (fileUrl || archivo_url)) {
      finalFileUrl = fileUrl || archivo_url;
      finalFileName = fileName || archivo_nombre || finalFileName;
      finalFileType = archivo_tipo || finalFileType;
    }

    if (!portada && removeCover !== 'true' && (coverUrl || cover_img)) {
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
      : normalizeImagesFromDb(actual.imagenes || []);

    const uploadedImages = await uploadFilesToStorage(
      imagenes,
      'cuestionarios/imagenes'
    );

    uploadedImagesPayload = uploadedImages.map(
      (uploadedFile: UploadedStorageFile, index: number) =>
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

    const currentImagePaths = normalizeImagesFromDb(actual.imagenes || [])
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
      cover_img: finalCoverUrl || DEFAULT_COVER_IMAGE,
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
        ...uploadedImagesPayload.map((imageItem) => imageItem.path)
      ]);

      throw error;
    }

    if (csvFile) {
      await replaceQuestionnaireExercisesFromCsv({
        questionnaireId,
        csvFile,
        parsedExercises: parsedCsvExercises
      });
    }

    await deleteFilesFromStorage([
      oldCoverPathToDelete,
      oldFilePathToDelete,
      ...imagePathsToDelete
    ]);

    const savedQuestionnaire = csvFile
      ? (await getCurrentQuestionnaire(questionnaireId)) ||
        (data as CuestionarioDB)
      : (data as CuestionarioDB);

    return res.json(mapQuestionnaireResponse(savedQuestionnaire as CuestionarioDB));
  } catch (error: any) {
    await deleteFilesFromStorage([
      uploadedCover?.path,
      uploadedDocument?.path,
      ...uploadedImagesPayload.map((imageItem) => imageItem.path)
    ]);

    console.error('Error en updateQuestionnaire:', error);

    return res.status(getClientErrorStatus(error)).json({
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

    await supabase
      .from(EJERCICIO_CUESTIONARIO_TABLE)
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

      const imagePaths = normalizeImagesFromDb(actual.imagenes || [])
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
        'id, usuario_id, cuestionario_id, fecha_respuesta, puntaje_obtenido, estatus, respuestas'
      )
      .eq('usuario_id', user.id)
      .order('fecha_respuesta', { ascending: false });

    if (error) {
      throw error;
    }

    const progreso = ((data || []) as CuestionarioUsuarioDB[]).map(
      mapProgressResponse
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

    const questionnaire = await getCurrentQuestionnaire(questionnaireId);

    if (!questionnaire) {
      return res.status(404).json({
        ok: false,
        message: 'Cuestionario no encontrado.'
      });
    }

    const finalScore = Number(
      req.body?.score ??
        req.body?.puntaje_obtenido ??
        req.body?.puntajeObtenido ??
        questionnaire.puntaje_maximo ??
        0
    );

    const payload = {
      usuario_id: user.id,
      cuestionario_id: questionnaireId,
      fecha_respuesta: new Date().toISOString(),
      puntaje_obtenido: Number.isFinite(finalScore) ? Math.round(finalScore) : 0,
      estatus: 'completado',
      respuestas: []
    };

    const { data, error } = await supabase
      .from(CUESTIONARIO_USUARIO_TABLE)
      .upsert(payload, {
        onConflict: 'usuario_id,cuestionario_id'
      })
      .select(
        'id, usuario_id, cuestionario_id, fecha_respuesta, puntaje_obtenido, estatus, respuestas'
      )
      .single();

    if (error) {
      throw error;
    }

    return res.status(200).json({
      ok: true,
      message: 'Cuestionario marcado como completado.',
      progreso: mapProgressResponse(data as CuestionarioUsuarioDB),
      progress: mapProgressResponse(data as CuestionarioUsuarioDB)
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

export const importQuestionnaireExercises = async (
  req: Request,
  res: Response
) => {
  try {
    const questionnaireId = String(req.params.id || '').trim();

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

    const csvFile = getUploadedCsvFile(req);

    if (!csvFile) {
      return res.status(400).json({
        ok: false,
        message: 'Debes subir un archivo CSV en el campo "csv".'
      });
    }

    const importResult = await replaceQuestionnaireExercisesFromCsv({
      questionnaireId,
      csvFile
    });

    return res.status(200).json({
      ok: true,
      message: 'Preguntas importadas correctamente.',
      ...importResult,
      ejercicios: importResult.exercises
    });
  } catch (error: any) {
    console.error('Error en importQuestionnaireExercises:', error);

    return res.status(getClientErrorStatus(error)).json({
      ok: false,
      message: 'Error al importar preguntas del cuestionario.',
      error: error.message || 'Error desconocido'
    });
  }
};

export const getQuestionnaireToResolve = async (
  req: Request,
  res: Response
) => {
  try {
    const user = getAuthenticatedUser(req);
    const questionnaireId = String(req.params.id || '').trim();

    if (!user) {
      return res.status(401).json({
        ok: false,
        message: 'Usuario no autenticado.'
      });
    }

    const questionnaire = await getCurrentQuestionnaire(questionnaireId);

    if (!questionnaire) {
      return res.status(404).json({
        ok: false,
        message: 'Cuestionario no encontrado.'
      });
    }

    const exercises = await getQuestionnaireExercises(questionnaireId);

    const existingProgress = await getUserQuestionnaireProgress(
      user.id,
      questionnaireId
    );

    return res.status(200).json({
      ok: true,
      cuestionario: mapQuestionnaireResponse(questionnaire),
      questionnaire: mapQuestionnaireResponse(questionnaire),
      ejercicios: exercises.map((exercise) => ({
        id: exercise.id,
        pregunta: exercise.pregunta,
        alternativas: exercise.alternativas || [],
        puntaje: exercise.puntaje || 1,
        orden: exercise.orden || 1
      })),
      resultado: existingProgress ? mapProgressResponse(existingProgress) : null,
      result: existingProgress ? mapProgressResponse(existingProgress) : null
    });
  } catch (error: any) {
    console.error('Error en getQuestionnaireToResolve:', error);

    return res.status(500).json({
      ok: false,
      message: 'Error al cargar cuestionario para resolver.',
      error: error.message || 'Error desconocido'
    });
  }
};

export const respondQuestionnaire = async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const questionnaireId = String(req.params.id || '').trim();

    if (!user) {
      return res.status(401).json({
        ok: false,
        message: 'Usuario no autenticado.'
      });
    }

    const questionnaire = await getCurrentQuestionnaire(questionnaireId);

    if (!questionnaire) {
      return res.status(404).json({
        ok: false,
        message: 'Cuestionario no encontrado.'
      });
    }

    const exercises = await getQuestionnaireExercises(questionnaireId);

    if (exercises.length === 0) {
      return res.status(400).json({
        ok: false,
        message:
          'Este cuestionario todavía no tiene preguntas importadas desde CSV.'
      });
    }

    const respuestasUsuario = Array.isArray(req.body?.respuestas)
      ? (req.body.respuestas as RespuestaUsuarioPayload[])
      : [];

    if (respuestasUsuario.length === 0) {
      return res.status(400).json({
        ok: false,
        message: 'Debes enviar al menos una respuesta.'
      });
    }

    const respuestasMap = new Map<string, string>();

    respuestasUsuario.forEach((item) => {
      const exerciseId = String(
        item.ejercicio_id || item.ejercicioId || item.id || ''
      );

      const answer = String(
        item.respuesta ||
          item.respuesta_usuario ||
          item.respuestaUsuario ||
          item.alternativa ||
          item.alternativa_id ||
          item.alternativaId ||
          ''
      );

      if (exerciseId) {
        respuestasMap.set(exerciseId, answer);
      }
    });

    const respuestasDetalle: RespuestaDetalle[] = exercises.map((exercise) => {
      const respuestaUsuario = respuestasMap.get(exercise.id) || '';
      const correcta =
        normalizeText(respuestaUsuario) === normalizeText(exercise.respuesta);

      const puntaje = Number(exercise.puntaje || 1);
      const puntajeObtenido = correcta ? puntaje : 0;

      return {
        ejercicio_id: exercise.id,
        pregunta: exercise.pregunta,
        alternativas: exercise.alternativas || [],
        respuesta_usuario: respuestaUsuario,
        respuesta_correcta: exercise.respuesta,
        correcta,
        puntaje,
        puntaje_obtenido: puntajeObtenido,
        orden: exercise.orden || 1
      };
    });

    const puntajeObtenido = respuestasDetalle.reduce(
      (total, item) => total + item.puntaje_obtenido,
      0
    );

    const puntajeMaximo = exercises.reduce(
      (total, item) => total + Number(item.puntaje || 1),
      0
    );

    if (puntajeMaximo !== Number(questionnaire.puntaje_maximo || 0)) {
      await supabase
        .from(QUESTIONNAIRES_TABLE)
        .update({
          puntaje_maximo: puntajeMaximo
        })
        .eq('id', questionnaireId);
    }

    const payload = {
      usuario_id: user.id,
      cuestionario_id: questionnaireId,
      fecha_respuesta: new Date().toISOString(),
      puntaje_obtenido: puntajeObtenido,
      estatus: 'completado',
      respuestas: respuestasDetalle
    };

    const { data, error } = await supabase
      .from(CUESTIONARIO_USUARIO_TABLE)
      .upsert(payload, {
        onConflict: 'usuario_id,cuestionario_id'
      })
      .select(
        'id, usuario_id, cuestionario_id, fecha_respuesta, puntaje_obtenido, estatus, respuestas'
      )
      .single();

    if (error) {
      throw error;
    }

    const resultado = {
      ...mapProgressResponse(data as CuestionarioUsuarioDB),
      puntajeMaximo,
      puntaje_maximo: puntajeMaximo,
      respuestas: respuestasDetalle
    };

    return res.status(200).json({
      ok: true,
      message: 'Cuestionario respondido correctamente.',
      resultado,
      result: resultado
    });
  } catch (error: any) {
    console.error('Error en respondQuestionnaire:', error);

    return res.status(500).json({
      ok: false,
      message: 'Error al responder cuestionario.',
      error: error.message || 'Error desconocido'
    });
  }
};
