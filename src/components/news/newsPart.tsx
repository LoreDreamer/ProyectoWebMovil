import React, { useEffect, useState } from 'react';
import { SubscribeBanner } from '../subscribe/subscribeBanner';

import seguridad from '../../assets/news/seguridad.png';

import './newsPart.css';

interface BackendAlertImage {
  id: string;
  name: string;
  previewUrl: string;
  url?: string;
  path?: string;
  order: number;
}

interface BackendAlert {
  id: string | number;
  title: string;
  titulo?: string;
  description: string;
  resumen?: string;
  cuerpo?: string;
  image: string;
  imagen_url?: string;
  createdAt: string;
  fecha?: string;
  autorNombre?: string;
  images?: BackendAlertImage[];
  imagenes?: BackendAlertImage[];
}

interface NewsItem {
  id: string | number;
  title: string;
  description: string;
  image: string;
  createdAt: string;
  autorNombre: string;
  images?: BackendAlertImage[];
}

const API_URL = 'http://localhost:3000';

export const NewsPart: React.FC = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  const normalizeImages = (images?: BackendAlertImage[]) => {
    return (images || []).map((image, index) => ({
      ...image,
      id: image.id || `${index + 1}-${image.previewUrl || image.url}`,
      previewUrl: buildFileUrl(
        image.previewUrl || image.url || image.path || ''
      ),
      url: buildFileUrl(image.url || image.previewUrl || image.path || ''),
      path: image.path || image.url || image.previewUrl || '',
      order: index + 1
    }));
  };

  const loadAlerts = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_URL}/api/alerts`);

      if (!response.ok) {
        throw new Error('No se pudieron cargar las alertas');
      }

      const data: BackendAlert[] = await response.json();

      const backendNews: NewsItem[] = Array.isArray(data)
        ? data.map((alert) => ({
            id: alert.id,
            title: alert.title || alert.titulo || 'Alerta municipal',
            description:
              alert.description ||
              alert.cuerpo ||
              alert.resumen ||
              '',
            image: buildFileUrl(alert.image || alert.imagen_url || ''),
            createdAt: alert.createdAt || alert.fecha || '',
            autorNombre:
              alert.autorNombre || 'Municipalidad de Santo Domingo',
            images: normalizeImages(alert.images || alert.imagenes || [])
          }))
        : [];

      setNewsItems(backendNews);
    } catch (error) {
      console.error('Error al cargar noticias desde backend:', error);
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

  return (
    <section className="news-section">
      <div className="news-header">
        <h1>Últimas noticias de ciberseguridad</h1>
        <p>Noticias y alertas publicadas por la municipalidad.</p>
      </div>

      {isLoading ? (
        <p>Cargando noticias...</p>
      ) : newsItems.length === 0 ? (
        <p>No hay noticias o alertas publicadas por el momento.</p>
      ) : (
        <div className="news-grid">
          {newsItems.map((item) => (
            <article className="news-card" key={item.id}>
              <img
                src={item.image}
                alt={item.title}
                className="news-card-image"
              />

              <div className="news-card-body">
                <h2>{item.title}</h2>

                <div className="news-card-meta">
                  <span>{item.createdAt}</span>
                  <span>Publicado por: {item.autorNombre}</span>

                  {item.images && item.images.length > 0 && (
                    <span>{item.images.length} imagen(es) adicionales</span>
                  )}
                </div>

                <p>{item.description}</p>

                <button className="news-card-button" type="button">
                  Leer más.
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <SubscribeBanner />
    </section>
  );
};

export default NewsPart;