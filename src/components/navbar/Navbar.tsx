import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IonHeader, IonToolbar, IonIcon, IonButtons, IonMenuButton } from '@ionic/react';
import { personCircle, logOutOutline } from 'ionicons/icons';

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
    localStorage.removeItem('userRut');
    localStorage.removeItem('userRegion');
    localStorage.removeItem('userComuna');
    window.location.href = '/index';
  };

  const isAdmin = localStorage.getItem('isAdmin') === 'true';

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
          
          {/* LADO IZQUIERDO: Hamburguesa y Logo */}
          <div className="navbar-left">
            <IonButtons slot="start" className="mobile-menu-button">
              <IonMenuButton autoHide={false} />
            </IonButtons>
            
            <Link to="/index" className="navbar-logo-link">
              <img src={logo} alt="Santo Domingo" className="navbar-logo" />
            </Link>
          </div>

          {/* CENTRO: Links de navegación (Ocultos en móvil) */}
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
                {renderLink('/cuestionarios', 'Cuestionarios')}
              </>
            )}
          </nav>

          {/* LADO DERECHO: Acciones o Perfil Animado */}
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
                  aria-label="Cerrar sesión"
                  role="button"
                  tabIndex={0}
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