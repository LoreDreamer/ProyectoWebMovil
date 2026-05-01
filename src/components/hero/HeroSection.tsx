import React from 'react';
import { Link } from 'react-router-dom';
import './HeroSection.css';

export const HeroSection: React.FC = () => {
  return (
    <section className="hero-section">
      <div className="hero-visual" />
      <div className="hero-overlay" />

      <div className="hero-content-wrapper">
        <div className="hero-content">
          <span className="hero-badge">Ciberseguridad municipal</span>
          <h1>Protege la ciudad con un diagnóstico digital seguro</h1>
          <p>
            Descubre módulos de formación, reporta incidentes y fortalece la
            confianza digital de tu comunidad con una experiencia moderna y
            conectada.
          </p>
          <div className="hero-actions">
            <a href="#educacion" className="hero-button hero-button-primary">
              Comenzar diagnóstico
            </a>
            <Link to="/login" className="hero-button hero-button-secondary">
              Reportar incidente
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
