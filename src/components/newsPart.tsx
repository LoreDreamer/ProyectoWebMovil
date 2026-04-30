import React from 'react';
import { SubscribeBanner } from './subscribeBanner';
import './NewsPart.css';

import newsImageOne from '../assets/652677708_18021012203642875_5614181220272571728_n.png';

const newsItems = [
  {
    title: 'Noticia',
    description: 'Descripción de noticia blah blah blah.',
    image: newsImageOne,
  },
  {
    title: 'Noticia',
    description: 'Descripción de noticia blah blah blah.',
    image: newsImageOne,
  },
  {
    title: 'Noticia',
    description: 'Descripción de noticia blah blah blah.',
    image: newsImageOne,
  },
  {
    title: 'Noticia',
    description: 'Descripción de noticia blah blah blah.',
    image: newsImageOne,
  },
  {
    title: 'Noticia',
    description: 'Descripción de noticia blah blah blah.',
    image: newsImageOne,
  },
  {
    title: 'Noticia',
    description: 'Descripción de noticia blah blah blah.',
    image: newsImageOne,
  },
  {
    title: 'Noticia',
    description: 'Descripción de noticia blah blah blah.',
    image: newsImageOne,
  },
  {
    title: 'Noticia',
    description: 'Descripción de noticia blah blah blah.',
    image: newsImageOne,
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