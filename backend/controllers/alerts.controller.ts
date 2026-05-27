import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { supabase } from '../config/supabase';

interface AlertImage {
  id: string;
  name: string;
  previewUrl: string;
  url: string;
  path: string;
  type: string;
  size: number | null;
  order: number;
}

interface AlertaDB {
  id: string;
  titulo: string;
  resumen: string | null;
  cuerpo: string | null;
  fecha: string | null;
  imagen_url: string | null;
  imagen_nombre: string | null;
  imagenes: AlertImage[] | null;
  publicado_por: string | null;
}

interface UsuarioAutorDB {
  id: string;
  correo: string;
  nombre_completo: string;
}

const ALERTS_TABLE = process.env.SUPABASE_ALERTS_TABLE || 'alertas';
const USERS_TABLE = process.env.SUPABASE_USERS_TABLE || 'usuario';

const MAX_ALERT_IMAGES = 10;

const formatFecha = (fecha?: string | null) => {
  if (!fecha) return '';

  const date = new Date(fecha);

  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const getPublicBaseUrl = (req: Request) => {
  return `${req.protocol}://${req.get('host')}`;
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

const buildPublicFileUrl = (req: Request, value?: string | null) => {
  const cleanUrl = toRelativeUploadUrl(value);

  if (!cleanUrl) return '';
  if (cleanUrl.startsWith('http')) return cleanUrl;
  if (cleanUrl.startsWith('/')) return `${getPublicBaseUrl(req)}${cleanUrl}`;

  return `${getPublicBaseUrl(req)}/${cleanUrl}`;
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

const getFilesFromRequest = (req: Request) => {
  const files = req.files as
    | {
        [fieldname: string]: Express.Multer.File[];
      }
    | undefined;

  return {
    portada: files?.portada?.[0] || files?.imagen?.[0] || null,
    imagenes: files?.imagenes || []
  };
};

const buildUploadedImagesPayload = (
  files: Express.Multer.File[],
  startOrder = 1
): AlertImage[] => {
  return files.map((file, index) => ({
    id: `${Date.now()}-${index}-${file.filename}`,
    name: file.originalname,
    previewUrl: `/uploads/${file.filename}`,
    url: `/uploads/${file.filename}`,
    path: `/uploads/${file.filename}`,
    type: file.mimetype,
    size: file.size,
    order: startOrder + index
  }));
};

const parseImagesValue = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;

  if (typeof value === 'string') {
    return safeJsonParse<unknown[]>(value, []);
  }

  return [];
};

const normalizeImagesForStorage = (images: unknown): AlertImage[] => {
  const parsedImages = parseImagesValue(images);

  return parsedImages
    .map((image, index) => {
      if (typeof image === 'string') {
        const url = toRelativeUploadUrl(image);

        if (!url) return null;

        return {
          id: `${index + 1}-${url}`,
          name: getFileNameFromUrl(url),
          previewUrl: url,
          url,
          path: url,
          type: '',
          size: null,
          order: index + 1
        };
      }

      if (!image || typeof image !== 'object') return null;

      const item = image as Partial<AlertImage>;

      const url = toRelativeUploadUrl(
        item.url || item.path || item.previewUrl || ''
      );

      if (!url) return null;

      return {
        id: String(item.id || `${index + 1}-${url}`),
        name: String(item.name || getFileNameFromUrl(url)),
        previewUrl: url,
        url,
        path: url,
        type: String(item.type || ''),
        size: typeof item.size === 'number' ? item.size : null,
        order: index + 1
      };
    })
    .filter(Boolean)
    .slice(0, MAX_ALERT_IMAGES) as AlertImage[];
};

const mergeImagesForStorage = (
  imagesValue: unknown,
  uploadedImages: AlertImage[],
  fallbackImages: AlertImage[] = []
) => {
  const imagesFieldWasSent = typeof imagesValue !== 'undefined';
  const parsedImages = parseImagesValue(imagesValue);

  if (!imagesFieldWasSent) {
    return reorderImages([...fallbackImages, ...uploadedImages]);
  }

  if (parsedImages.length === 0) {
    return reorderImages(uploadedImages);
  }

  const result: AlertImage[] = [];
  let uploadedIndex = 0;

  parsedImages.forEach((image) => {
    const normalizedImage = normalizeImagesForStorage([image])[0];

    if (normalizedImage) {
      result.push(normalizedImage);
      return;
    }

    if (uploadedIndex < uploadedImages.length) {
      result.push(uploadedImages[uploadedIndex]);
      uploadedIndex += 1;
    }
  });

  while (uploadedIndex < uploadedImages.length) {
    result.push(uploadedImages[uploadedIndex]);
    uploadedIndex += 1;
  }

  return reorderImages(result);
};

const reorderImages = (images: AlertImage[]) => {
  return images.slice(0, MAX_ALERT_IMAGES).map((image, index) => ({
    ...image,
    order: index + 1
  }));
};

const mapImagesForResponse = (req: Request, images: unknown): AlertImage[] => {
  const normalizedImages = normalizeImagesForStorage(images);

  return normalizedImages.map((image, index) => ({
    ...image,
    id: image.id || `${index + 1}-${image.url}`,
    previewUrl: buildPublicFileUrl(req, image.previewUrl || image.url),
    url: buildPublicFileUrl(req, image.url),
    path: image.path || image.url,
    order: index + 1
  }));
};

const getAutoresMap = async (autorIds: string[]) => {
  const uniqueIds = Array.from(new Set(autorIds.filter(Boolean)));
  const autoresMap = new Map<string, UsuarioAutorDB>();

  if (uniqueIds.length === 0) return autoresMap;

  const { data, error } = await supabase
    .from(USERS_TABLE)
    .select('id, correo, nombre_completo')
    .in('id', uniqueIds);

  if (error) {
    throw error;
  }

  (data || []).forEach((usuario) => {
    autoresMap.set(usuario.id, usuario as UsuarioAutorDB);
  });

  return autoresMap;
};

const mapAlertResponse = (
  req: Request,
  alerta: AlertaDB,
  autoresMap: Map<string, UsuarioAutorDB>
) => {
  const autor = alerta.publicado_por
    ? autoresMap.get(alerta.publicado_por)
    : null;

  return {
    id: alerta.id,

    title: alerta.titulo,
    titulo: alerta.titulo,

    description: alerta.cuerpo || alerta.resumen || '',
    resumen: alerta.resumen || '',
    cuerpo: alerta.cuerpo || '',

    image: buildPublicFileUrl(req, alerta.imagen_url),
    imagen_url: alerta.imagen_url || '',

    coverName:
      alerta.imagen_nombre ||
      getFileNameFromUrl(alerta.imagen_url),

    imagen_nombre:
      alerta.imagen_nombre ||
      getFileNameFromUrl(alerta.imagen_url),

    images: mapImagesForResponse(req, alerta.imagenes || []),
    imagenes: alerta.imagenes || [],

    createdAt: formatFecha(alerta.fecha),
    fecha: alerta.fecha,

    publicado_por: alerta.publicado_por,

    autorNombre: autor?.nombre_completo || 'Municipalidad de Santo Domingo',
    autorCorreo: autor?.correo || ''
  };
};

export const getAlerts = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from(ALERTS_TABLE)
      .select('*')
      .order('fecha', { ascending: false });

    if (error) {
      throw error;
    }

    const alertas = (data || []) as AlertaDB[];

    const autoresMap = await getAutoresMap(
      alertas
        .map((alerta) => alerta.publicado_por)
        .filter(Boolean) as string[]
    );

    return res.json(
      alertas.map((alerta) => mapAlertResponse(req, alerta, autoresMap))
    );
  } catch (error: any) {
    console.error('Error en getAlerts:', error);

    return res.status(500).json({
      message: 'Error al obtener alertas.',
      error: error.message || 'Error desconocido'
    });
  }
};

export const createAlert = async (req: Request, res: Response) => {
  try {
    const {
      title,
      titulo,
      description,
      descripcion,
      resumen,
      cuerpo,
      image = '',
      imagen_url = '',
      coverName = '',
      imagen_nombre = '',
      images,
      imagenes
    } = req.body;

    const finalTitle = String(title || titulo || '').trim();
    const finalBody = String(description || descripcion || cuerpo || '').trim();
    const finalSummary = String(resumen || finalBody.slice(0, 180)).trim();

    if (!finalTitle || !finalBody) {
      return res.status(400).json({
        message: 'Título y descripción son obligatorios.'
      });
    }

    const tokenUser = (req as any).user;

    if (!tokenUser?.id) {
      return res.status(401).json({
        message: 'No se pudo identificar al usuario que publica la alerta.'
      });
    }

    const { portada, imagenes: uploadedImageFiles } = getFilesFromRequest(req);

    const uploadedImagesPayload =
      buildUploadedImagesPayload(uploadedImageFiles);

    const finalImages = mergeImagesForStorage(
      typeof imagenes !== 'undefined' ? imagenes : images,
      uploadedImagesPayload,
      []
    );

    const portadaUrl = portada
      ? `/uploads/${portada.filename}`
      : toRelativeUploadUrl(image || imagen_url);

    const portadaNombre = portada
      ? portada.originalname
      : String(
          coverName ||
            imagen_nombre ||
            getFileNameFromUrl(portadaUrl)
        ).trim();

    const payload = {
      id: randomUUID(),
      titulo: finalTitle,
      resumen: finalSummary,
      cuerpo: finalBody,
      imagen_url: portadaUrl || null,
      imagen_nombre: portadaNombre || null,
      imagenes: finalImages,
      publicado_por: tokenUser.id
    };

    const { data, error } = await supabase
      .from(ALERTS_TABLE)
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    const alertaCreada = data as AlertaDB;

    const autoresMap = await getAutoresMap(
      alertaCreada.publicado_por ? [alertaCreada.publicado_por] : []
    );

    return res.status(201).json(
      mapAlertResponse(req, alertaCreada, autoresMap)
    );
  } catch (error: any) {
    console.error('Error en createAlert:', error);

    return res.status(500).json({
      message: 'Error al crear alerta.',
      error: error.message || 'Error desconocido'
    });
  }
};

export const updateAlert = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const {
      title,
      titulo,
      description,
      descripcion,
      resumen,
      cuerpo,
      image = '',
      imagen_url = '',
      coverName = '',
      imagen_nombre = '',
      images,
      imagenes,
      removeCover = false
    } = req.body;

    if (!id) {
      return res.status(400).json({
        message: 'ID de alerta no proporcionado.'
      });
    }

    const finalTitle = String(title || titulo || '').trim();
    const finalBody = String(description || descripcion || cuerpo || '').trim();
    const finalSummary = String(resumen || finalBody.slice(0, 180)).trim();

    if (!finalTitle || !finalBody) {
      return res.status(400).json({
        message: 'Título y descripción son obligatorios.'
      });
    }

    const { data: currentData, error: fetchError } = await supabase
      .from(ALERTS_TABLE)
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    const currentAlert = currentData as AlertaDB;

    const { portada, imagenes: uploadedImageFiles } = getFilesFromRequest(req);

    const uploadedImagesPayload =
      buildUploadedImagesPayload(uploadedImageFiles);

    const currentImages = normalizeImagesForStorage(
      currentAlert.imagenes || []
    );

    const finalImages = mergeImagesForStorage(
      typeof imagenes !== 'undefined' ? imagenes : images,
      uploadedImagesPayload,
      currentImages
    );

    const shouldRemoveCover = toBoolean(removeCover);

    const portadaUrl = portada
      ? `/uploads/${portada.filename}`
      : shouldRemoveCover
        ? ''
        : toRelativeUploadUrl(
            image ||
              imagen_url ||
              currentAlert.imagen_url ||
              ''
          );

    const portadaNombre = portada
      ? portada.originalname
      : shouldRemoveCover
        ? ''
        : String(
            coverName ||
              imagen_nombre ||
              currentAlert.imagen_nombre ||
              getFileNameFromUrl(portadaUrl)
          ).trim();

    const payload = {
      titulo: finalTitle,
      resumen: finalSummary,
      cuerpo: finalBody,
      imagen_url: portadaUrl || null,
      imagen_nombre: portadaNombre || null,
      imagenes: finalImages
    };

    const { data, error } = await supabase
      .from(ALERTS_TABLE)
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    const alertaActualizada = data as AlertaDB;

    const autoresMap = await getAutoresMap(
      alertaActualizada.publicado_por
        ? [alertaActualizada.publicado_por]
        : []
    );

    return res.json(
      mapAlertResponse(req, alertaActualizada, autoresMap)
    );
  } catch (error: any) {
    console.error('Error en updateAlert:', error);

    return res.status(500).json({
      message: 'Error al actualizar alerta.',
      error: error.message || 'Error desconocido'
    });
  }
};

export const deleteAlert = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: 'ID de alerta no proporcionado.'
      });
    }

    const { error } = await supabase
      .from(ALERTS_TABLE)
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return res.json({
      message: 'Alerta eliminada correctamente.'
    });
  } catch (error: any) {
    console.error('Error en deleteAlert:', error);

    return res.status(500).json({
      message: 'Error al eliminar alerta.',
      error: error.message || 'Error desconocido'
    });
  }
};