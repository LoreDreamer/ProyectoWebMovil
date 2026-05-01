import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IonHeader, IonToolbar } from '@ionic/react';
import { personCircle } from 'ionicons/icons';
import { IonIcon } from '@ionic/react';

import logo from '../assets/4-isologo-municipal-fondocalipso-rgb.png';
import './Navbar.css';

interface NavbarProps {
  isLoggedIn?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ isLoggedIn: propIsLoggedIn }) => {
  
  const location = useLocation();
  
  // Usar el prop si se proporciona, sino leer de localStorage
  const isLoggedIn = propIsLoggedIn !== undefined 
    ? propIsLoggedIn 
    : localStorage.getItem('isLoggedIn') === 'true';

  // Manejar logout
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    window.location.href = '/index';
  };

  // Modo 1: No autenticado
  if (!isLoggedIn) {
    return (
      <IonHeader className="navbar-header">
        <IonToolbar className="navbar-toolbar">
          <div className="navbar-container navbar-container-authenticated">
            <Link to="/index" className="navbar-logo-link">
              <img src={logo} alt="Santo Domingo" className="navbar-logo" />
            </Link>

            <nav className="navbar-links-authenticated">
              <Link to="/index" className={`navbar-link-authenticated ${location.pathname === '/index' ? 'active' : ''}`}>
                Inicio
              </Link>

              <Link to="/educacion" className={`navbar-link-authenticated ${location.pathname === '/educacion' ? 'active' : ''}`}>
                Educación
              </Link>

              <Link to="/denuncias" className={`navbar-link-authenticated ${location.pathname === '/denuncias' ? 'active' : ''}`}>
                Denuncias
              </Link>

              <Link to="/cuestionarios" className={`navbar-link-authenticated ${location.pathname === '/cuestionarios' ? 'active' : ''}`}>
                Cuestionarios
              </Link>
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

  // Modo 2: Autenticado
  return (
    <IonHeader className="navbar-header navbar-authenticated">
      <IonToolbar className="navbar-toolbar">
        <div className="navbar-container navbar-container-authenticated">
          <Link to="/index" className="navbar-logo-link">
            <img src={logo} alt="Santo Domingo" className="navbar-logo" />
          </Link>

          <nav className="navbar-links-authenticated">
            <Link to="/index" className={`navbar-link-authenticated ${location.pathname === '/index' ? 'active' : ''}`}>
              Inicio
            </Link>

            <Link to="/cuestionarios" className={`navbar-link-authenticated ${location.pathname === '/cuestionarios' ? 'active' : ''}`}>
              Cuestionarios
            </Link>

            <Link to="/educacion" className={`navbar-link-authenticated ${location.pathname === '/educacion' ? 'active' : ''}`}>
              Educación
            </Link>

            <Link to="/denuncias" className={`navbar-link-authenticated ${location.pathname === '/denuncias' ? 'active' : ''}`}>
              Denuncias
            </Link>

            <Link to="/protocolos" className={`navbar-link-authenticated ${location.pathname === '/protocolos' ? 'active' : ''}`}>
              Protocolos
            </Link>

            <Link to="/alertas" className={`navbar-link-authenticated ${location.pathname === '/alertas' ? 'active' : ''}`}>
              Alertas
            </Link>
          </nav>

          <div className="navbar-profile-container">
            <button
              className="navbar-profile-button"
              onClick={handleLogout}
              aria-label="Cerrar sesión"
            >
              <IonIcon icon={personCircle} className="navbar-profile-icon" />
            </button>
          </div>
        </div>
      </IonToolbar>
    </IonHeader>
  );
};