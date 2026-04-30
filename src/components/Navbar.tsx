import React from 'react';
import { Link } from 'react-router-dom';
import { IonHeader, IonToolbar } from '@ionic/react';

import logo from '../assets/4-isologo-municipal-fondocalipso-rgb.png';
import './Navbar.css';

export const Navbar: React.FC = () => {
  return (
    <IonHeader className="navbar-header">
      <IonToolbar className="navbar-toolbar">
        <div className="navbar-container">
          <Link to="/index" className="navbar-logo-link">
            <img src={logo} alt="Santo Domingo" className="navbar-logo" />
          </Link>

          <nav className="navbar-links">
            <Link to="/index" className="navbar-link">
              Inicio
            </Link>

            <Link to="/educacion" className="navbar-link">
              Educación
            </Link>

            <Link to="/denuncias" className="navbar-link">
              Denuncias
            </Link>

            <Link to="/cuestionarios" className="navbar-link">
              Cuestionarios
            </Link>
          </nav>

          <div className="navbar-actions">
            <Link to="/login" className="navbar-login">
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
};