import React from 'react';
import { Link } from 'react-router-dom';
import logo from '@/assets/logos/4-isologo-municipal-fondocalipso-rgb.png';
import './Footer.css';
import { useAuth } from '@/context/AuthContext';

export const Footer: React.FC = () => {
  const { user } = useAuth();

  const links = user
    ? [
        { to: '/index', label: 'Inicio' },
        { to: '/cuestionarios', label: 'Cuestionarios' },
        { to: '/educacion', label: 'Educación' },
        { to: '/denuncias', label: 'Denuncias' },
        { to: '/protocolos', label: 'Protocolos' },
        { to: '/alertas', label: 'Alertas' },
      ]
    : [
        { to: '/index', label: 'Inicio' },
        { to: '/educacion', label: 'Educación' },
        { to: '/denuncias', label: 'Denuncias' },
        { to: '/alertas', label: 'Alertas' },
      ];

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-column footer-info">
          <Link to="/index" className="footer-logo-link">
            <img src={logo} alt="Santo Domingo" className="footer-logo" />
          </Link>

          <div className="footer-details">
            <p className="footer-address">
              <strong>Dirección:</strong> Avenida Santa Teresa N°1.
            </p>

            <div className="footer-hours">
              <strong>Horario de atención:</strong>

              <ul className="footer-hours-list">
                <li>Lunes a Viernes: 08:45 am a 14:00 pm.</li>
                <li>Sábado: 09:30 am a 13:30 pm.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-column footer-links-column">
          <h3 className="footer-section-title">Links</h3>

          <nav className="footer-links-list" aria-label="Links del sitio">
            {links.map((link) => (
              <Link key={link.to} to={link.to} className="footer-link">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="footer-copyright">
          © {new Date().getFullYear()} Municipalidad de Santo Domingo. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;