import React from 'react';
import {
  IonHeader,
  IonToolbar,
  IonButton,
  IonRouterLink,
} from '@ionic/react';

import logo from '../assets/4-isologo-municipal-fondocalipso-rgb.png';
import './Navbar.css';

export const Navbar: React.FC = () => {
  return (
    <IonHeader className="navbar-header">
      <IonToolbar className="navbar-toolbar">
        <div className="navbar-container">
          <IonRouterLink routerLink="/index" className="navbar-logo-link">
            <img src={logo} alt="Santo Domingo" className="navbar-logo" />
          </IonRouterLink>

          <nav className="navbar-links">
            <IonRouterLink routerLink="/index" className="navbar-link">
              Inicio
            </IonRouterLink>

            <IonRouterLink routerLink="/tab3" className="navbar-link">
              Educación
            </IonRouterLink>

            <IonRouterLink routerLink="/denuncias" className="navbar-link">
              Denuncias
            </IonRouterLink>

            <IonRouterLink routerLink="/cuestionarios" className="navbar-link">
              Cuestionarios
            </IonRouterLink>

            <IonRouterLink routerLink="/cuestionarios" className="navbar-link">
              Protocolos
            </IonRouterLink>

            <IonRouterLink routerLink="/cuestionarios" className="navbar-link">
              Alertas
            </IonRouterLink>
          </nav>

          <div className="navbar-actions">
            <IonRouterLink routerLink="/LoginPage" className="navbar-login">
              Iniciar Sesión
            </IonRouterLink>

            <IonRouterLink routerLink="/RegisterPage">
              <IonButton className="navbar-register-button">
                Crear cuenta
              </IonButton>
            </IonRouterLink>
          </div>
        </div>
      </IonToolbar>
    </IonHeader>
  );
};