import { Request, Response } from 'express';
import { getUsuarioById, getUsuarioByEmail } from './auth.controller';

interface AlertImage {
  id: string;
  name: string;
  previewUrl: string;
  order: number;
}

interface Alerta {
  id: number;
  title: string;
  description: string;
  image: string;
  coverName?: string;
  images: AlertImage[];
  createdAt: string;
  publicado_por: string;
}

const formatFecha = (date: Date) => {
  return date.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

let alertas: Alerta[] = [
  {
    id: 1,
    title: 'Nueva campaña de prevención de phishing',
    description:
      'La municipalidad informa recomendaciones para reconocer correos fraudulentos y proteger datos personales.',
    image: '',
    coverName: '',
    images: [],
    createdAt: formatFecha(new Date('2026-05-04')),
    publicado_por: '11111111-1111-4111-8111-111111111111'
  },
  {
    id: 2,
    title: 'Actualización de seguridad en servicios digitales',
    description:
      'Se recomienda mantener contraseñas seguras y activar verificación en dos pasos en cuentas municipales.',
    image: '',
    coverName: '',
    images: [],
    createdAt: formatFecha(new Date('2026-05-18')),
    publicado_por: '33333333-3333-4333-8333-333333333333'
  }
];

const normalizeImages = (images: AlertImage[]) => {
  if (!Array.isArray(images)) return [];

  return images.map((image, index) => ({
    ...image,
    order: index + 1
  }));
};

const buildAlertResponse = (alerta: Alerta) => {
  const autor = getUsuarioById(alerta.publicado_por);

  return {
    ...alerta,
    autorNombre: autor?.nombre_completo || 'Municipalidad de Santo Domingo',
    autorCorreo: autor?.email || ''
  };
};

export const getAlerts = (req: Request, res: Response) => {
  return res.json(alertas.map(buildAlertResponse));
};

export const createAlert = (req: Request, res: Response) => {
  const {
    title,
    description,
    image = '',
    coverName = '',
    images = []
  } = req.body;

  if (!title || !description) {
    return res.status(400).json({
      message: 'Título y descripción son obligatorios.'
    });
  }

  const tokenUser = (req as any).user;

  const usuario =
    getUsuarioById(tokenUser?.id) ||
    getUsuarioByEmail(tokenUser?.email);

  if (!usuario) {
    return res.status(401).json({
      message: 'No se pudo identificar al usuario que publica la alerta.'
    });
  }

  const nuevaAlerta: Alerta = {
    id: Date.now(),
    title,
    description,
    image,
    coverName,
    images: normalizeImages(images),
    createdAt: formatFecha(new Date()),
    publicado_por: usuario.id
  };

  alertas = [nuevaAlerta, ...alertas];

  return res.status(201).json(buildAlertResponse(nuevaAlerta));
};

export const updateAlert = (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const {
    title,
    description,
    image = '',
    coverName = '',
    images = []
  } = req.body;

  const alertaExistente = alertas.find((alerta) => alerta.id === id);

  if (!alertaExistente) {
    return res.status(404).json({
      message: 'Alerta no encontrada.'
    });
  }

  if (!title || !description) {
    return res.status(400).json({
      message: 'Título y descripción son obligatorios.'
    });
  }

  alertas = alertas.map((alerta) =>
    alerta.id === id
      ? {
          ...alerta,
          title,
          description,
          image,
          coverName,
          images: normalizeImages(images)
        }
      : alerta
  );

  const alertaActualizada = alertas.find((alerta) => alerta.id === id);

  return res.json(buildAlertResponse(alertaActualizada as Alerta));
};

export const deleteAlert = (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const existe = alertas.some((alerta) => alerta.id === id);

  if (!existe) {
    return res.status(404).json({
      message: 'Alerta no encontrada.'
    });
  }

  alertas = alertas.filter((alerta) => alerta.id !== id);

  return res.json({
    message: 'Alerta eliminada correctamente.'
  });
};