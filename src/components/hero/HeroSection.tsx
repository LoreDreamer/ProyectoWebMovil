import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HeroSection.css';

interface CountUpProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

const CountUp: React.FC<CountUpProps> = ({
  end,
  duration = 700,
  prefix = '',
  suffix = ''
}) => {
  const start = Math.floor(end / 2);
  const [count, setCount] = useState(start);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      if (startTime === null) {
        startTime = currentTime;
      }

      const progress = Math.min((currentTime - startTime) / duration, 1);
      const currentValue = Math.floor(start + (end - start) * progress);
      setCount(currentValue);
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };
    animationFrameId = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationFrameId);
  }, [end, duration, start]);

  return <span>{prefix}{count}{suffix}</span>;
};

export const HeroSection: React.FC = () => {
  return (
    <section className="hero-section">
      <div className="hero-visual"/>
      <div className="hero-overlay" />

      <div className="hero-content-wrapper">
        <div className="hero-content">
          <span className="hero-badge">Ciberseguridad municipal</span>
          <h1>Protege la ciudad con un diagnóstico digital seguro</h1>
          <div className="hero-actions">
            <Link to="/educacion" className="hero-button hero-button-primary">
              Comenzar diagnóstico
            </Link>
            <Link to="/denuncias" className="hero-button hero-button-secondary">
              Reportar incidente
            </Link>
          </div>
          <hr />
          <div className="stats-section">
            <div className="stats-card">
              <strong><CountUp end={1200} prefix="+" /></strong>
              <span>Vecinos protegidos</span>
            </div>
            <div className="stats-card">
              <strong><CountUp end={94} suffix="%" /></strong>
              <span>funcionarios capacitados</span>
            </div>
            <div className="stats-card">
              <strong><CountUp end={32} prefix="+" /></strong>
              <span>Módulos disponibles</span>
            </div>
        </div>
      </div>
      </div>
    </section>
  );
};
