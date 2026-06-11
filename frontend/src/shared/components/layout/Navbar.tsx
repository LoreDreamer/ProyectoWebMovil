import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IonHeader, IonToolbar, IonIcon, IonButtons, IonMenuButton } from '@ionic/react';
import { personCircle, logOutOutline } from 'ionicons/icons';

import logo from '@/assets/logos/4-isologo-municipal-fondocalipso-rgb.png';
import './Navbar.css';
import { useAuth } from '@/context/AuthContext';
import { NotificationBell, notify } from '@/shared/notifications';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    const confirmed = await notify.confirm({
      header: 'Cerrar sesión',
      message: '¿Deseas cerrar tu sesión?',
      confirmText: 'Cerrar sesión',
      cancelText: 'Cancelar'
    });

    if (!confirmed) return;

    logout();
    notify.info('Sesión cerrada correctamente.');
    window.location.href = '/index';
  };

  const profileLink = user?.role === 'admin' ? '/admin' : '/inicio';

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
              <img loading="eager" decoding="async" src={logo} alt="Santo Domingo" className="navbar-logo" />
            </Link>
          </div>

          <nav className="navbar-links-desktop">
            {user ? (
              <>
                {renderLink('/index', 'Inicio')}
                {renderLink('/cuestionarios', 'Cuestionarios')}
                {renderLink('/educacion', 'Educación')}
                {renderLink('/denuncias', 'Denuncias')}
                {renderLink('/herramientas', 'Herramientas')}
                {renderLink('/protocolos', 'Protocolos')}
                {renderLink('/alertas', 'Alertas')}
              </>
            ) : (
              <>
                {renderLink('/index', 'Inicio')}
                {renderLink('/educacion', 'Educación')}
                {renderLink('/denuncias', 'Denuncias')}
                {renderLink('/herramientas', 'Herramientas')}
                {renderLink('/alertas', 'Alertas')}
              </>
            )}
          </nav>

          <div className="navbar-right">
            {!user ? (
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
                <NotificationBell />
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