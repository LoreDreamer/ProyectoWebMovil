import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IonHeader, IonToolbar, IonIcon } from '@ionic/react';
import { personCircle } from 'ionicons/icons';

import logo from '../../assets/4-isologo-municipal-fondocalipso-rgb.png';
import './Navbar.css';

interface NavbarProps {
  isLoggedIn?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ isLoggedIn: propIsLoggedIn }) => {
  const location = useLocation();

  const isLoggedIn = propIsLoggedIn !== undefined
    ? propIsLoggedIn
    : localStorage.getItem('isLoggedIn') === 'true';

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    window.location.href = '/index';
  };

  const renderLink = (to: string, label: string) => (
    <Link to={to} className={`navbar-link-authenticated ${location.pathname === to ? 'active' : ''}`}>
      {label}
    </Link>
  );

  if (!isLoggedIn) {
    return (
      <IonHeader className="navbar-header">
        <IonToolbar className="navbar-toolbar">
          <div className="navbar-container">
            <Link to="/index" className="navbar-logo-link">
              <img src={logo} alt="Santo Domingo" className="navbar-logo" />
            </Link>

            <nav className="navbar-links-authenticated">
              {renderLink('/index', 'Inicio')}
              {renderLink('/educacion', 'Educación')}
              {renderLink('/denuncias', 'Denuncias')}
              {renderLink('/cuestionarios', 'Cuestionarios')}
            </nav>

            <div className="navbar-actions">
              <Link to="/login" className="navbar-link-authenticated">
                Iniciar sesión
              </Link>
              <Link to="/register" className="navbar-register-button">
                Crear cuenta
              </Link>
            </div>
          </div>
        </IonToolbar>
      </IonHeader>
    );
  }

  return (
    <IonHeader className="navbar-header navbar-authenticated">
      <IonToolbar className="navbar-toolbar">
        <div className="navbar-container navbar-container-authenticated">
          <Link to="/inicio" className="navbar-logo-link">
            <img src={logo} alt="Santo Domingo" className="navbar-logo" />
          </Link>

          <nav className="navbar-links-authenticated">
            {renderLink('/inicio', 'Inicio')}
            {renderLink('/cuestionarios', 'Cuestionarios')}
            {renderLink('/educacion', 'Educación')}
            {renderLink('/denuncias', 'Denuncias')}
            {renderLink('/protocolos', 'Protocolos')}
            {renderLink('/alertas', 'Alertas')}
          </nav>

          <div className="navbar-profile-container">
            <button
              className="navbar-profile-button"
              onClick={handleLogout}
              aria-label="Cerrar sesión"
            >
              <span className="navbar-profile-ring">
                <IonIcon icon={personCircle} className="navbar-profile-icon" />

                <svg className="navbar-profile-circle" viewBox="0 0 80 80">
                  <circle
                    className="navbar-profile-circle-path"
                    cx="40"
                    cy="40"
                    r="36"
                    pathLength="1"
                  />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </IonToolbar>
    </IonHeader>
  );
};
