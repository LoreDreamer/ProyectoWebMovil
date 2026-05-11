import React from 'react';
import { SubscribeBanner } from '../subscribe/subscribeBanner';
import deep from '../../assets/news/deep.png';
import hogarInteligente from '../../assets/news/hogarInteligente.png';
import oficina from '../../assets/news/oficina.png';
import parche from '../../assets/news/parche.png';
import refuerza from '../../assets/news/refuerza.png';
import seguridad from '../../assets/news/seguridad.png';
import sms from '../../assets/news/sms.png';
import datos from '../../assets/news/datos.png';
import leyes from '../../assets/news/leyes.png';

import './newsPart.css';

import newsImageOne from '../../assets/global/652677708_18021012203642875_5614181220272571728_n.png';

const newsItems = [
  {
    title: 'Parche de seguridad urgente',
    description: 'Se detecta una vulnerabilidad crítica en navegadores populares. Actualiza tus dispositivos para evitar el robo de sesiones.',
    image: seguridad,
  },
  {
    title: 'Nueva ola de SMS fraudulentos',
    description: 'Delincuentes suplantan a servicios de mensajería para robar datos bancarios. Aprende a identificar estos mensajes falsos.',
    image: sms,
  },
  {
    title: 'Auge de los "Deepfakes" en estafas',
    description: 'El uso de inteligencia artificial para suplantar voces y rostros aumenta. Descubre cómo protegerte de estas identidades sintéticas.',
    image: deep,
  },
  {
    title: 'Protege tu oficina en casa',
    description: 'El aumento del teletrabajo eleva los riesgos de ataques domésticos. Configura tu router de forma segura con estos pasos.',
    image: oficina,
  },
  {
    title: 'Riesgos en el hogar inteligente',
    description: 'Cámaras y asistentes de voz pueden ser puertas de entrada para hackers. Revisa cómo asegurar tus dispositivos conectados.',
    image: hogarInteligente,
  },
  {
    title: 'Cambios en leyes de protección',
    description: 'Nuevas regulaciones exigen mayor transparencia a las empresas sobre tus datos. Conoce tus derechos como usuario digital.',
    image: leyes,
  },
  {
    title: 'Alerta por secuestro de datos',
    description: 'Aumentan los ataques que cifran archivos a cambio de un rescate. La prevención y los respaldos son tu mejor defensa.',
    image: datos,
  },
  {
    title: 'Refuerza tu seguridad hoy',
    description: 'No confíes solo en tu contraseña. Activa la verificación en dos pasos para añadir una capa extra de protección a tus cuentas.',
    image: refuerza,
  },
];

export const NewsPart: React.FC = () => {
  return (
    <section className="news-section">
      <div className="news-header">
        <h1>Últimas noticias de ciberseguridad</h1>
        <p>Actualizadas por última vez el 29/04/2026.</p>
      </div>

      <div className="news-grid">
        {newsItems.map((item, index) => (
          <article className="news-card" key={index}>
            <img src={item.image} alt={item.title} className="news-card-image" />

            <div className="news-card-body">
              <h2>{item.title}</h2>
              <p>{item.description}</p>

              <button className="news-card-button" type="button">
                Leer más..
              </button>
            </div>
          </article>
        ))}
      </div>

      <SubscribeBanner />
    </section>
  );
};