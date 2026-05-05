import React from 'react';
import './InfoSection.css';
import cursoImage from '../../assets/curso-online-ciberseguridad-empresas.png';
import reportImage from '../../assets/report.png';
import stadisticsImage from '../../assets/stat.png';

export const InfoSection: React.FC = () => {
  return (
    <section className="info-section" id="educacion">
      <div className="info-intro">
        <div>
          <span className="section-label">Módulos clave</span>
          <h2>Aprende, actúa y protege a tu comunidad</h2>
        </div>
        <p>
          Navega contenido práctico para agentes municipales, conoce estadísticas
          reales y mejora la seguridad digital del municipio con recursos claros
          y fáciles de consumir.
        </p>
      </div>

      <div className="info-grid">
        <article className="info-card">
          <img src={cursoImage} alt="Educación digital"/>
          <h3>Educación digital</h3>
          <p>
            Cursos breves para empleados y ciudadanos sobre phishing, contraseñas
            seguras y gestión de datos personales.
          </p>
        </article>

        <article className="info-card">
          <img src={reportImage} alt="Reporte de incidentes"/>
          <h3>Reporte de incidentes</h3>
          <p>
            Herramientas rápidas para notificar amenazas y documentar eventos de
            seguridad en tiempo real.
          </p>
        </article>

        <article className="info-card">
          <img src={stadisticsImage} alt="Estadísticas clave"/>
          <h3>Estadísticas clave</h3>
          <p>
            Paneles simples sobre el estado de la seguridad, aumentos de ataques
            y resultados de los diagnósticos municipales.
          </p>
        </article>
      </div>
    </section>
  );
};
