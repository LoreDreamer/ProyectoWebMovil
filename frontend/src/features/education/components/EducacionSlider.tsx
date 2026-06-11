import React, { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import './EducacionSlider.css';

interface SlideItem {
  id: string | number;
  url: string;
}

interface SliderProps {
  slides: SlideItem[];
}

export const EducacionSlider: React.FC<SliderProps> = ({ slides }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!slides || slides.length === 0) return null;

  const hasMultipleSlides = slides.length > 1;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  return (
    <section className="edu-slider-wrapper">
      <div className="edu-slider">
        {hasMultipleSlides && (
          <div className="edu-slide-counter">{currentSlide + 1} / {slides.length}</div>
        )}
        
        <img decoding="async" loading="lazy" src={slides[currentSlide].url} alt="Contenido didáctico" className="edu-slide-img" />
        
        {hasMultipleSlides && (
          <>
            <button className="edu-slide-nav btn-prev" onClick={prevSlide} aria-label="Anterior">
              <IonIcon icon={chevronBackOutline} />
            </button>
            
            <button className="edu-slide-nav btn-next" onClick={nextSlide} aria-label="Siguiente">
              <IonIcon icon={chevronForwardOutline} />
            </button>
          </>
        )}
      </div>

      {hasMultipleSlides && (
        <div className="edu-thumbnails">
          {slides.map((slide, index) => (
            <button 
              key={slide.id} 
              className={`edu-thumb-btn ${currentSlide === index ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
              style={{ backgroundImage: `url(${slide.url})` }}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default EducacionSlider;