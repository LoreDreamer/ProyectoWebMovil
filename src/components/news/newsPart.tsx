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

interface BackendAlert {
  id: number;
  title: string;
  description: string;
  image: string;
  createdAt: string;
  autorNombre?: string;
}

interface NewsItem {
  id: string | number;
  title: string;
  description: string;
  image: string;
  createdAt: string;
  autorNombre: string;
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
    autorNombre: 'Equipo de Comunicaciones'
  },
  {
    id: 'static-2',
    title: 'Nueva ola de SMS fraudulentos',
    description:
      'Delincuentes suplantan a servicios de mensajería para robar datos bancarios. Aprende a identificar estos mensajes falsos.',
    image: sms,
    createdAt: '29 abr 2026',
    autorNombre: 'Equipo de Comunicaciones'
  },
  {
    id: 'static-3',
    title: 'Auge de los "Deepfakes" en estafas',
    description:
      'El uso de inteligencia artificial para suplantar voces y rostros aumenta. Descubre cómo protegerte de estas identidades sintéticas.',
    image: deep,
    createdAt: '29 abr 2026',
    autorNombre: 'Dirección de Seguridad Pública'
  },
  {
    id: 'static-4',
    title: 'Protege tu oficina en casa',
    description:
      'El aumento del teletrabajo eleva los riesgos de ataques domésticos. Configura tu router de forma segura con estos pasos.',
    image: oficina,
    createdAt: '29 abr 2026',
    autorNombre: 'Equipo TIC Municipal'
  },
  {
    id: 'static-5',
    title: 'Riesgos en el hogar inteligente',
    description:
      'Cámaras y asistentes de voz pueden ser puertas de entrada para hackers. Revisa cómo asegurar tus dispositivos conectados.',
    image: hogarInteligente,
    createdAt: '29 abr 2026',
    autorNombre: 'Equipo TIC Municipal'
  },
  {
    id: 'static-6',
    title: 'Cambios en leyes de protección',
    description:
      'Nuevas regulaciones exigen mayor transparencia a las empresas sobre tus datos. Conoce tus derechos como usuario digital.',
    image: leyes,
    createdAt: '29 abr 2026',
    autorNombre: 'Municipalidad de Santo Domingo'
  },
  {
    id: 'static-7',
    title: 'Alerta por secuestro de datos',
    description:
      'Aumentan los ataques que cifran archivos a cambio de un rescate. La prevención y los respaldos son tu mejor defensa.',
    image: datos,
    createdAt: '29 abr 2026',
    autorNombre: 'Dirección de Seguridad Pública'
  },
  {
    id: 'static-8',
    title: 'Refuerza tu seguridad hoy',
    description:
      'No confíes solo en tu contraseña. Activa la verificación en dos pasos para añadir una capa extra de protección a tus cuentas.',
    image: refuerza,
    createdAt: '29 abr 2026',
    autorNombre: 'Equipo de Comunicaciones'
  }
];

export const NewsPart: React.FC = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>(staticNewsItems);

  const loadAlerts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/alerts`);

      if (!response.ok) {
        throw new Error('No se pudieron cargar las alertas');
      }

      const data: BackendAlert[] = await response.json();

      const backendNews: NewsItem[] = data.map((alert) => ({
        id: alert.id,
        title: alert.title,
        description: alert.description,
        image: alert.image || seguridad,
        createdAt: alert.createdAt,
        autorNombre: alert.autorNombre || 'Municipalidad de Santo Domingo'
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