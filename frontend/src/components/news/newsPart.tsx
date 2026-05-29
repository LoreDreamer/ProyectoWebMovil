import React, { useEffect, useMemo, useState } from 'react';
import { IonIcon, IonSearchbar } from '@ionic/react';
import {
  alertCircleOutline,
  closeCircleOutline,
  imagesOutline,
  notificationsOutline,
  personOutline,
  timeOutline
} from 'ionicons/icons';
import { SubscribeBanner } from '../subscribe/subscribeBanner';

import seguridad from '../../assets/news/seguridad.png';

import './newsPart.css';

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

interface NewsImage {
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

interface NewsItem {
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

const API_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export const NewsPart: React.FC = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<NewsItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
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
      const imageName =
        image.name || image.originalName || `imagen-${index + 1}`;

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

  const loadAlerts = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_URL}/api/alerts`);
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        console.error('Error backend /api/alerts:', data);

        throw new Error(
          data?.message ||
            data?.error ||
            'No se pudieron cargar las alertas'
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

  return (
    <section className="news-section">
      <div className="alerts-page-heading">
        <div>
          <span className="alerts-kicker">
            Centro de alertas
          </span>

          <h1>Alertas y noticias de ciberseguridad</h1>

          <p>
            Revisa comunicados municipales, advertencias digitales y
            recomendaciones para proteger tu información.
          </p>
        </div>
      </div>

      <section className="alerts-summary-section">
        <article className="alerts-summary-card">
          <div className="alerts-summary-icon">
            <IonIcon icon={notificationsOutline} />
          </div>

          <div>
            <span>Total alertas</span>
            <strong>{newsItems.length}</strong>
          </div>
        </article>

        <article className="alerts-summary-card">
          <div className="alerts-summary-icon">
            <IonIcon icon={timeOutline} />
          </div>

          <div>
            <span>Última publicación</span>
            <strong>{latestAlert ? latestAlert.createdAt : 'Sin datos'}</strong>
          </div>
        </article>

        <article className="alerts-summary-card">
          <div className="alerts-summary-icon">
            <IonIcon icon={imagesOutline} />
          </div>

          <div>
            <span>Imágenes adjuntas</span>
            <strong>
              {newsItems.reduce(
                (total, item) => total + item.images.length,
                0
              )}
            </strong>
          </div>
        </article>
      </section>

      <section className="alerts-list-section">
        <div className="alerts-section-header">
          <div>
            <span className="section-eyebrow">Publicaciones</span>
            <h2>Alertas disponibles</h2>
            <p>
              Busca por título, contenido, autor o persona que redactó la alerta.
            </p>
          </div>

          <IonSearchbar
            value={searchTerm}
            placeholder="Buscar alerta..."
            onIonChange={(e) => setSearchTerm(e.detail.value || '')}
            mode="ios"
            className="alerts-searchbar"
          />
        </div>

        {isLoading ? (
          <div className="alerts-empty-state">
            Cargando alertas...
          </div>
        ) : filteredNewsItems.length === 0 ? (
          <div className="alerts-empty-state">
            No hay alertas disponibles para esta búsqueda.
          </div>
        ) : (
          <div className="news-grid">
            {filteredNewsItems.map((item) => (
              <article className="news-card" key={item.id}>
                <div className="news-card-image-wrap">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="news-card-image"
                  />

                  <span className="alert-card-badge">
                    <IonIcon icon={alertCircleOutline} />
                    Alerta
                  </span>
                </div>

                <div className="news-card-body">
                  <div className="news-card-meta">
                    <span>
                      <IonIcon icon={timeOutline} />
                      {item.createdAt}
                    </span>

                    <span>
                      <IonIcon icon={personOutline} />
                      Publicado por: {item.autorNombre}
                    </span>

                    <span>
                      <IonIcon icon={personOutline} />
                      Escrito por: {item.writtenBy}
                    </span>
                  </div>

                  <h2>{item.title}</h2>

                  <p>{item.description}</p>

                  <div className="news-card-footer">
                    <span>{item.images.length} imagen(es)</span>

                    <button
                      className="news-card-button"
                      type="button"
                      onClick={() => setSelectedAlert(item)}
                    >
                      Leer más
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedAlert && (
        <section className="alert-detail-section">
          <div className="alert-detail-header">
            <div>
              <span className="section-eyebrow">Detalle</span>
              <h2>{selectedAlert.title}</h2>
            </div>

            <button
              type="button"
              className="alert-detail-close"
              onClick={() => setSelectedAlert(null)}
            >
              <IonIcon icon={closeCircleOutline} />
              Cerrar
            </button>
          </div>

          <div className="alert-detail-layout">
            <div className="alert-detail-image-wrap">
              <img src={selectedAlert.image} alt={selectedAlert.title} />
            </div>

            <div className="alert-detail-content">
              <div className="alert-detail-meta">
                <span>{selectedAlert.createdAt}</span>
                <span>Publicado por: {selectedAlert.autorNombre}</span>
                <span>Escrito por: {selectedAlert.writtenBy}</span>
              </div>

              <p>{selectedAlert.description}</p>

              {selectedAlert.images.length > 0 && (
                <div className="alert-detail-gallery">
                  {selectedAlert.images.map((image, index) => (
                    <div key={image.id} className="alert-detail-gallery-item">
                      <img
                        src={image.previewUrl}
                        alt={`Imagen ${index + 1}`}
                      />
                      <span>{index + 1}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <SubscribeBanner />
    </section>
  );
};

export default NewsPart;