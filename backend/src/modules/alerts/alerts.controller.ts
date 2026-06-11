import { Request, Response } from 'express';
import { supabase } from '../../config/supabase';
import {
  uploadFileToStorage,
  uploadFilesToStorage,
  deleteFilesFromStorage,
  UploadedStorageFile,
} from '../../services/storage.service';
import { notifySubscribersAboutAlert } from '../../services/alert-notif.service';
import { getPaginationOptions, sendOptionalPaginatedResponse } from '../../shared/utils/pagination';

interface AlertImage {
  id?: string;
  name?: string;
  originalName?: string;
  url?: string;
  path?: string;
  type?: string;
  size?: number | null;
  order?: number;
}

interface NormalizedAlertImage {
  id: string;
  name: string;
  originalName: string;
  url: string;
  path: string;
  type: string;
  size: number | null;
  order: number;
}

interface AlertaDB {
  id: string;
  titulo: string;
  resumen: string;
  cuerpo: string;
  fecha: string | null;
  imagen_url: string | null;
  imagen_nombre: string | null;
  imagenes: AlertImage[] | null;
  publicado_por: string | null;
  escrito_por: string | null;
}

const ALERTS_TABLE = process.env.SUPABASE_ALERTS_TABLE || 'alertas';
const ALERT_SELECT = 'id, titulo, resumen, cuerpo, fecha, imagen_url, imagen_nombre, imagenes, publicado_por, escrito_por';
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

const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

const parseJsonArray = <T,>(value: unknown): T[] => {
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

const getUploadedFiles = (req: Request) => {
  const files = req.files as
    | {
        [fieldname: string]: Express.Multer.File[];
      }
    | undefined;

  const portada = files?.portada?.[0] || files?.imagen?.[0] || null;
  const imagenes = files?.imagenes || [];

  return {
    portada,
    imagenes
  };
};

const normalizeImagesOrder = (
  images: AlertImage[]
): NormalizedAlertImage[] => {
  return images.map(
    (imageItem: AlertImage, index: number): NormalizedAlertImage => {
      const imageUrl = imageItem.url || '';
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
  images: AlertImage[]
): NormalizedAlertImage[] => {
  const normalizedImages = normalizeImagesOrder(images);

  return normalizedImages.filter(
    (imageItem: NormalizedAlertImage): boolean => {
      const imageUrl = imageItem.url || '';
      const imagePath = imageItem.path || '';

      if (!imageUrl && !imagePath) return false;
      if (imageUrl.startsWith('blob:')) return false;
      if (imageUrl.startsWith('data:')) return false;

      return true;
    }
  );
};

const mapUploadedFileToAlertImage = (
  uploadedFile: UploadedStorageFile,
  index: number
): NormalizedAlertImage => {
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

const mapAlertResponse = (alerta: AlertaDB) => {
  const images = normalizeImagesOrder(alerta.imagenes || []);

  return {
    id: alerta.id,

    title: alerta.titulo,
    titulo: alerta.titulo,

    summary: alerta.resumen,
    resumen: alerta.resumen,

    body: alerta.cuerpo,
    cuerpo: alerta.cuerpo,

    date: alerta.fecha,
    fecha: alerta.fecha,

    image: alerta.imagen_url,
    imagen_url: alerta.imagen_url,

    imageName: alerta.imagen_nombre,
    imagen_nombre: alerta.imagen_nombre,

    images,
    imagenes: images,

    publicado_por: alerta.publicado_por,

    writtenBy: alerta.escrito_por,
    escrito_por: alerta.escrito_por
  };
};

const getCurrentAlert = async (id: string): Promise<AlertaDB | null> => {
  const { data, error } = await supabase
    .from(ALERTS_TABLE)
    .select(ALERT_SELECT)
    .eq('id', id)
    .single();

  if (error || !data) return null;

  return data as AlertaDB;
};

export const getAlerts = async (req: Request, res: Response) => {
  try {
    const pagination = getPaginationOptions(req, 10, 50);

    let query = pagination.enabled
      ? supabase.from(ALERTS_TABLE).select(ALERT_SELECT, { count: 'exact' })
      : supabase.from(ALERTS_TABLE).select(ALERT_SELECT);

    query = query.order('fecha', { ascending: false });

    if (pagination.enabled) {
      query = query.range(pagination.from, pagination.to);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    const alertas = (data || []) as AlertaDB[];
    const mappedAlerts = alertas.map((alerta: AlertaDB) =>
      mapAlertResponse(alerta)
    );

    return sendOptionalPaginatedResponse(res, mappedAlerts, pagination, count);
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
      summary,
      resumen,
      body,
      cuerpo,
      date,
      fecha,
      writtenBy,
      escrito_por
    } = req.body;

    const finalTitle = String(title || titulo || '').trim();
    const finalSummary = String(summary || resumen || '').trim();
    const finalBody = String(body || cuerpo || '').trim();
    const finalDate = String(date || fecha || '').trim();
    const finalWrittenBy = String(writtenBy || escrito_por || '').trim();

    if (!finalTitle || !finalSummary || !finalBody) {
      return res.status(400).json({
        message: 'Título, resumen y cuerpo son obligatorios.'
      });
    }

    const { portada, imagenes } = getUploadedFiles(req);

    let uploadedCover: UploadedStorageFile | null = null;

    if (portada) {
      uploadedCover = await uploadFileToStorage(portada, {
        folder: 'alertas/portadas',
        order: 1
      });
    }

    const uploadedImages = await uploadFilesToStorage(
      imagenes,
      'alertas/imagenes'
    );

    const imagesPayload = normalizeImagesOrder(
      uploadedImages.map(
        (
          uploadedFile: UploadedStorageFile,
          index: number
        ): NormalizedAlertImage =>
          mapUploadedFileToAlertImage(uploadedFile, index)
      )
    );

    const tokenUser = (req as any).user;

    const payload = {
      titulo: finalTitle,
      resumen: finalSummary,
      cuerpo: finalBody,
      fecha: finalDate || new Date().toISOString(),
      imagen_url: uploadedCover?.url || null,
      imagen_nombre: uploadedCover?.name || null,
      imagenes: imagesPayload,
      publicado_por: tokenUser?.id || null,
      escrito_por: finalWrittenBy || null
    };

    const { data, error } = await supabase
      .from(ALERTS_TABLE)
      .insert(payload)
      .select(ALERT_SELECT)
      .single();

    if (error) {
      const pathsToDelete = [
        uploadedCover?.path,
        ...imagesPayload.map(
          (imageItem: NormalizedAlertImage): string => imageItem.path
        )
      ].filter(isNonEmptyString);

      await deleteFilesFromStorage(pathsToDelete);

      throw error;
    }

    const mappedAlert = mapAlertResponse(data as AlertaDB);

    notifySubscribersAboutAlert(mappedAlert).catch((emailError) => {
      console.error('Error enviando emails de alerta:', emailError);
    });

    return res.status(201).json(mappedAlert);
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
    const alertId = String(req.params.id || '').trim();

    if (!alertId) {
      return res.status(400).json({
        message: 'ID de alerta no proporcionado.'
      });
    }

    const currentAlert = await getCurrentAlert(alertId);

    if (!currentAlert) {
      return res.status(404).json({
        message: 'Alerta no encontrada.'
      });
    }

    const {
      title,
      titulo,
      summary,
      resumen,
      body,
      cuerpo,
      date,
      fecha,
      writtenBy,
      escrito_por,
      removeCover
    } = req.body;

    const finalTitle = String(title || titulo || '').trim();
    const finalSummary = String(summary || resumen || '').trim();
    const finalBody = String(body || cuerpo || '').trim();
    const finalDate = String(date || fecha || '').trim();
    const finalWrittenBy = String(writtenBy || escrito_por || '').trim();

    if (!finalTitle || !finalSummary || !finalBody) {
      return res.status(400).json({
        message: 'Título, resumen y cuerpo son obligatorios.'
      });
    }

    const { portada, imagenes } = getUploadedFiles(req);

    let finalCoverUrl = currentAlert.imagen_url;
    let finalCoverName = currentAlert.imagen_nombre;
    let oldCoverPathToDelete = '';

    if (removeCover === 'true') {
      oldCoverPathToDelete = buildStoragePathFromPublicUrl(
        currentAlert.imagen_url
      );

      finalCoverUrl = null;
      finalCoverName = null;
    }

    if (portada) {
      oldCoverPathToDelete = buildStoragePathFromPublicUrl(
        currentAlert.imagen_url
      );

      const uploadedCover = await uploadFileToStorage(portada, {
        folder: 'alertas/portadas',
        order: 1
      });

      finalCoverUrl = uploadedCover.url;
      finalCoverName = uploadedCover.name;
    }

    const hasImagesPayload =
      typeof req.body.images !== 'undefined' ||
      typeof req.body.imagenes !== 'undefined' ||
      typeof req.body.imagenesOrden !== 'undefined';

    const requestedExistingImages = hasImagesPayload
      ? filterValidExistingImages(
          parseJsonArray<AlertImage>(
            req.body.images || req.body.imagenes || req.body.imagenesOrden
          )
        )
      : normalizeImagesOrder(currentAlert.imagenes || []);

    const uploadedImages = await uploadFilesToStorage(
      imagenes,
      'alertas/imagenes'
    );

    const uploadedImagesPayload = uploadedImages.map(
      (
        uploadedFile: UploadedStorageFile,
        index: number
      ): NormalizedAlertImage =>
        mapUploadedFileToAlertImage(
          uploadedFile,
          requestedExistingImages.length + index
        )
    );

    const finalImages = normalizeImagesOrder([
      ...requestedExistingImages,
      ...uploadedImagesPayload
    ]).slice(0, 10);

    const currentImagePaths = normalizeImagesOrder(currentAlert.imagenes || [])
      .map((imageItem: NormalizedAlertImage): string => {
        return imageItem.path || buildStoragePathFromPublicUrl(imageItem.url);
      })
      .filter(isNonEmptyString);

    const finalImagePaths = finalImages
      .map((imageItem: NormalizedAlertImage): string => {
        return imageItem.path || buildStoragePathFromPublicUrl(imageItem.url);
      })
      .filter(isNonEmptyString);

    const imagePathsToDelete = currentImagePaths.filter(
      (storagePath: string): boolean => !finalImagePaths.includes(storagePath)
    );

    const payload = {
      titulo: finalTitle,
      resumen: finalSummary,
      cuerpo: finalBody,
      fecha: finalDate || currentAlert.fecha || new Date().toISOString(),
      imagen_url: finalCoverUrl,
      imagen_nombre: finalCoverName,
      imagenes: finalImages,
      escrito_por: finalWrittenBy || currentAlert.escrito_por || null
    };

    const { data, error } = await supabase
      .from(ALERTS_TABLE)
      .update(payload)
      .eq('id', alertId)
      .select(ALERT_SELECT)
      .single();

    if (error) {
      const newUploadedPaths = uploadedImagesPayload
        .map((imageItem: NormalizedAlertImage): string => imageItem.path)
        .filter(isNonEmptyString);

      await deleteFilesFromStorage(newUploadedPaths);

      throw error;
    }

    await deleteFilesFromStorage([oldCoverPathToDelete, ...imagePathsToDelete]);

    return res.json(mapAlertResponse(data as AlertaDB));
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
    const alertId = String(req.params.id || '').trim();

    if (!alertId) {
      return res.status(400).json({
        message: 'ID de alerta no proporcionado.'
      });
    }

    const currentAlert = await getCurrentAlert(alertId);

    const { error } = await supabase.from(ALERTS_TABLE).delete().eq('id', alertId);

    if (error) {
      throw error;
    }

    if (currentAlert) {
      const coverPath = buildStoragePathFromPublicUrl(currentAlert.imagen_url);

      const imagePaths = normalizeImagesOrder(currentAlert.imagenes || [])
        .map((imageItem: NormalizedAlertImage): string => {
          return imageItem.path || buildStoragePathFromPublicUrl(imageItem.url);
        })
        .filter(isNonEmptyString);

      await deleteFilesFromStorage([coverPath, ...imagePaths]);
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