import { useEffect, useMemo, useState } from 'react';
import seguridad from '@/assets/news/seguridad.png';
import { API_URL } from '@/shared/api/apiClient';

interface BackendAlertImage {
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

type AlertImageInput = BackendAlertImage | string;

interface BackendAlert {
  id: string | number;
  title?: string;
  titulo?: string;
  description?: string;
  summary?: string;
  resumen?: string;
  body?: string;
  cuerpo?: string;
  image?: string;
  imagen_url?: string;
  createdAt?: string;
  date?: string;
  fecha?: string;
  autorNombre?: string;
  autorCorreo?: string;
  writtenBy?: string;
  escrito_por?: string;
  images?: AlertImageInput[];
  imagenes?: AlertImageInput[];
}

export interface NewsImage {
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

export interface NewsItem {
  id: string | number;
  title: string;
  description: string;
  image: string;
  createdAt: string;
  rawDate: string;
  autorNombre: string;
  writtenBy: string;
  images: NewsImage[];
}

const buildFileUrl = (url?: string) => {
  if (!url) return seguridad;

  if (
    url.startsWith('http') ||
    url.startsWith('blob:') ||
    url.startsWith('data:')
  ) {
    return url;
  }

  if (url.startsWith('/')) {
    return `${API_URL}${url}`;
  }

  return `${API_URL}/${url}`;
};

const formatDateTime = (date?: string) => {
  if (!date) return 'Sin fecha';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate
    .toLocaleString('es-CL', {
      timeZone: 'America/Santiago',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
    .replace(',', ' ·');
};

const normalizeImages = (images?: AlertImageInput[]) => {
  return (images || []).map((image, index): NewsImage => {
    if (typeof image === 'string') {
      const imageUrl = buildFileUrl(image);

      return {
        id: `${index + 1}-${image}`,
        name: `imagen-${index + 1}`,
        originalName: `imagen-${index + 1}`,
        previewUrl: imageUrl,
        url: imageUrl,
        path: image,
        type: '',
        size: null,
        order: index + 1
      };
    }

    const rawUrl = image.previewUrl || image.url || image.path || '';
    const finalUrl = buildFileUrl(rawUrl);
    const imageName = image.name || image.originalName || `imagen-${index + 1}`;

    return {
      id: image.id || `${index + 1}-${rawUrl || imageName}`,
      name: imageName,
      originalName: image.originalName || imageName,
      previewUrl: finalUrl,
      url: buildFileUrl(image.url || rawUrl),
      path: image.path || image.url || image.previewUrl || '',
      type: image.type || '',
      size: typeof image.size === 'number' ? image.size : null,
      order: index + 1
    };
  });
};

const normalizeAlert = (alert: BackendAlert): NewsItem => {
  const rawDate = alert.createdAt || alert.date || alert.fecha || '';

  return {
    id: alert.id,
    title: alert.title || alert.titulo || 'Alerta municipal',
    description:
      alert.description ||
      alert.body ||
      alert.cuerpo ||
      alert.summary ||
      alert.resumen ||
      '',
    image: buildFileUrl(alert.image || alert.imagen_url || ''),
    createdAt: formatDateTime(rawDate),
    rawDate,
    autorNombre: alert.autorNombre || 'Municipalidad de Santo Domingo',
    writtenBy: alert.writtenBy || alert.escrito_por || 'No especificado',
    images: normalizeImages(alert.images || alert.imagenes || [])
  };
};

export const usePublicAlerts = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<NewsItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadAlerts = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_URL}/api/alerts`);
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        console.error('Error backend /api/alerts:', data);

        throw new Error(
          data?.message || data?.error || 'No se pudieron cargar las alertas'
        );
      }

      const backendAlerts: NewsItem[] = Array.isArray(data)
        ? data.map((alert) => normalizeAlert(alert))
        : [];

      setNewsItems(backendAlerts);
    } catch (error) {
      console.error('Error al cargar alertas desde backend:', error);
      setNewsItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();

    const handler = () => loadAlerts();
    window.addEventListener('alerts-updated', handler);

    return () => {
      window.removeEventListener('alerts-updated', handler);
    };
  }, []);

  const filteredNewsItems = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return newsItems;

    return newsItems.filter((item) => {
      return (
        item.title.toLowerCase().includes(search) ||
        item.description.toLowerCase().includes(search) ||
        item.autorNombre.toLowerCase().includes(search) ||
        item.writtenBy.toLowerCase().includes(search)
      );
    });
  }, [newsItems, searchTerm]);

  const latestAlert = newsItems[0] || null;

  return {
    newsItems,
    selectedAlert,
    setSelectedAlert,
    searchTerm,
    setSearchTerm,
    isLoading,
    filteredNewsItems,
    latestAlert
  };
};
