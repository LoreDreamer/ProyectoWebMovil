import React, { useEffect, useState } from 'react';
import { SubscribeBanner } from '../subscribe/subscribeBanner';

import deep from '../../assets/news/deep.png';
import hogarInteligente from '../../assets/news/hogarInteligente.png';
import oficina from '../../assets/news/oficina.png';
import refuerza from '../../assets/news/refuerza.png';
import seguridad from '../../assets/news/seguridad.png';
import sms from '../../assets/news/sms.png';
import datos from '../../assets/news/datos.png';
import leyes from '../../assets/news/leyes.png';

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

const staticNewsItems: NewsItem[] = [
  {
    id: 'static-1',
    title: 'Parche de seguridad urgente',
    description:
      'Se detecta una vulnerabilidad crítica en navegadores populares. Actualiza tus dispositivos para evitar el robo de sesiones.',
    image: seguridad,
    createdAt: '29 abr 2026',
    autorNombre: 'Equipo de Comunicaciones',
    images: []
  },
  {
    id: 'static-2',
    title: 'Nueva ola de SMS fraudulentos',
    description:
      'Delincuentes suplantan a servicios de mensajería para robar datos bancarios. Aprende a identificar estos mensajes falsos.',
    image: sms,
    createdAt: '29 abr 2026',
    autorNombre: 'Equipo de Comunicaciones',
    images: []
  },
  {
    id: 'static-3',
    title: 'Auge de los "Deepfakes" en estafas',
    description:
      'El uso de inteligencia artificial para suplantar voces y rostros aumenta. Descubre cómo protegerte de estas identidades sintéticas.',
    image: deep,
    createdAt: '29 abr 2026',
    autorNombre: 'Dirección de Seguridad Pública',
    images: []
  },
  {
    id: 'static-4',
    title: 'Protege tu oficina en casa',
    description:
      'El aumento del teletrabajo eleva los riesgos de ataques domésticos. Configura tu router de forma segura con estos pasos.',
    image: oficina,
    createdAt: '29 abr 2026',
    autorNombre: 'Equipo TIC Municipal',
    images: []
  },
  {
    id: 'static-5',
    title: 'Riesgos en el hogar inteligente',
    description:
      'Cámaras y asistentes de voz pueden ser puertas de entrada para hackers. Revisa cómo asegurar tus dispositivos conectados.',
    image: hogarInteligente,
    createdAt: '29 abr 2026',
    autorNombre: 'Equipo TIC Municipal',
    images: []
  },
  {
    id: 'static-6',
    title: 'Cambios en leyes de protección',
    description:
      'Nuevas regulaciones exigen mayor transparencia a las empresas sobre tus datos. Conoce tus derechos como usuario digital.',
    image: leyes,
    createdAt: '29 abr 2026',
    autorNombre: 'Municipalidad de Santo Domingo',
    images: []
  },
  {
    id: 'static-7',
    title: 'Alerta por secuestro de datos',
    description:
      'Aumentan los ataques que cifran archivos a cambio de un rescate. La prevención y los respaldos son tu mejor defensa.',
    image: datos,
    createdAt: '29 abr 2026',
    autorNombre: 'Dirección de Seguridad Pública',
    images: []
  },
  {
    id: 'static-8',
    title: 'Refuerza tu seguridad hoy',
    description:
      'No confíes solo en tu contraseña. Activa la verificación en dos pasos para añadir una capa extra de protección a tus cuentas.',
    image: refuerza,
    createdAt: '29 abr 2026',
    autorNombre: 'Equipo de Comunicaciones',
    images: []
  }
];

export const NewsPart: React.FC = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>(staticNewsItems);

  const buildFileUrl = (url?: string) => {
    if (!url) return seguridad;

    if (
      url.startsWith('http') ||
      url.startsWith('blob:') ||
      url.startsWith('data:')
    ) {
      return url;
    }

    if (url.startsWith('/uploads/')) {
      return `${API_URL}${url}`;
    }

    return url;
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
      const response = await fetch(`${API_URL}/api/alerts`);

      if (!response.ok) {
        throw new Error('No se pudieron cargar las alertas');
      }

      const data: BackendAlert[] = await response.json();

      const backendNews: NewsItem[] = data.map((alert) => ({
        id: alert.id,
        title: alert.title || alert.titulo || 'Alerta municipal',
        description:
          alert.description ||
          alert.cuerpo ||
          alert.resumen ||
          '',
        image: buildFileUrl(alert.image || alert.imagen_url || ''),
        createdAt: alert.createdAt || '',
        autorNombre: alert.autorNombre || 'Municipalidad de Santo Domingo',
        images: normalizeImages(alert.images || alert.imagenes || [])
      }));

      setNewsItems([...backendNews, ...staticNewsItems]);
    } catch (error) {
      console.error('Error al cargar noticias desde backend:', error);
      setNewsItems(staticNewsItems);
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

      <SubscribeBanner />
    </section>
  );
};

export default NewsPart;