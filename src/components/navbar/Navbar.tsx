import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IonHeader, IonToolbar, IonIcon, IonButtons, IonMenuButton } from '@ionic/react';
import { personCircle, logOutOutline } from 'ionicons/icons';
import { jwtDecode } from 'jwt-decode';

import logo from '../../assets/logos/4-isologo-municipal-fondocalipso-rgb.png';
import './Navbar.css';

interface CustomJwtPayload {
  email: string;
  role: string;
}

export const Navbar: React.FC = () => {
  const location = useLocation();

  // 🌟 Conexión real con el Token
  const token = localStorage.getItem('auth_token');
  let isLoggedIn = false;
  let isAdmin = false;

  if (token) {
    try {
      const decoded = jwtDecode<CustomJwtPayload>(token);
      isLoggedIn = true;
      isAdmin = decoded.role === 'admin';
    } catch (e) {
      // Token inválido
    }
  }

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/index';
  };

  // 🌟 Volvemos a tu lógica original: El círculo del perfil decide a dónde mandarlo
  const profileLink = isAdmin ? '/admin' : '/inicio';

  const renderLink = (to: string, label: string) => (
    <Link to={to} className={`navbar-link-authenticated ${location.pathname === to ? 'active' : ''}`}>
      {label}
    </Link>
  );

  return (
    <IonHeader className="navbar-header">
      <IonToolbar className="navbar-toolbar">
        <div className="navbar-container">
          
          <div className="navbar-left">
            <IonButtons slot="start" className="mobile-menu-button">
              <IonMenuButton autoHide={false} />
            </IonButtons>
            
            <Link to="/index" className="navbar-logo-link">
              <img src={logo} alt="Santo Domingo" className="navbar-logo" />
            </Link>
          </div>

          {/* 🌟 Tu barra del centro original (Sin botones raros agregados por mí) */}
          <nav className="navbar-links-desktop">
            {isLoggedIn ? (
              <>
                {renderLink('/index', 'Inicio')}
                {renderLink('/cuestionarios', 'Cuestionarios')}
                {renderLink('/educacion', 'Educación')}
                {renderLink('/denuncias', 'Denuncias')}
                {renderLink('/protocolos', 'Protocolos')}
                {renderLink('/alertas', 'Alertas')}
              </>
            ) : (
              <>
                {renderLink('/index', 'Inicio')}
                {renderLink('/educacion', 'Educación')}
                {renderLink('/denuncias', 'Denuncias')}
                {renderLink('/alertas', 'Alertas')}
              </>
            )}
          </nav>

          <div className="navbar-right">
            {!isLoggedIn ? (
              <div className="navbar-actions">
                <Link to="/login" className="navbar-link-authenticated link-login">
                  Iniciar sesión
                </Link>
                <Link to="/register" className="navbar-register-button">
                  Crear cuenta
                </Link>
              </div>
            ) : (
              <div className="navbar-profile-container">
                {/* 🌟 Aquí está tu botón de usuario original que te lleva a /admin o /inicio */}
                <Link to={profileLink} className="navbar-profile-button" aria-label="Ir a inicio">
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
                </Link>
                <div 
                  className="navbar-logout-button"
                  onClick={handleLogout}
                >
                  <IonIcon icon={logOutOutline} />
                </div>
              </div>
            )}
          </div>
          
        </div>
      </IonToolbar>
    </IonHeader>
  );
};