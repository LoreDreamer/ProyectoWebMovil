import React, { useState } from 'react';
import {
  IonButton,
  IonInput,
  IonLabel,
  IonItem,
  IonRouterLink,
} from '@ionic/react';

import bgImage from '../assets/1_private-tour-of-the-city-of-neiva.png';
import './Forms.css';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Correo:', email);
    console.log('Contraseña:', password);
  };

  return (
    <div className="dividor">
      <div className="auth-card">
        <div
          className="auth-image"
          style={{ backgroundImage: `url(${bgImage})` }}
        />

        <div className="form-container">
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-form-header">
              <h2>Iniciar sesión</h2>
              <p>Accede al sistema con tu correo y contraseña.</p>
            </div>

            <IonItem>
              <IonLabel position="stacked">Correo electrónico</IonLabel>
              <IonInput
                className="custom-input"
                type="email"
                value={email}
                onIonChange={(e) => setEmail(e.detail.value || '')}
                placeholder="correo@dominio.com"
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Contraseña</IonLabel>
              <IonInput
                className="custom-input"
                type="password"
                value={password}
                onIonChange={(e) => setPassword(e.detail.value || '')}
                placeholder="Ingresa tu contraseña"
              />
            </IonItem>

            <IonButton expand="block" type="submit" className="submit-button">
              Iniciar sesión
            </IonButton>

            <IonRouterLink routerLink="/register">
              <IonButton fill="clear" expand="block" className="secondary-button">
                ¿No tienes cuenta? Regístrate
              </IonButton>
            </IonRouterLink>
          </form>
        </div>
      </div>
    </div>
  );
};

export const RegisterForm: React.FC = () => {
  const [usuario, setUsuario] = useState('');
  const [rut, setRut] = useState('');
  const [region, setRegion] = useState('');
  const [comuna, setComuna] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Usuario:', usuario);
    console.log('Rut:', rut);
    console.log('Región:', region);
    console.log('Comuna:', comuna);
    console.log('Correo:', email);
    console.log('Contraseña:', password);
    console.log('Confirmar contraseña:', confirmPassword);
    console.log('Acepta términos:', acceptedTerms);
  };

  return (
    <div className="dividor">
      <div className="auth-card">
        <div
          className="auth-image"
          style={{ backgroundImage: `url(${bgImage})` }}
        />

        <div className="form-container">
          <form className="auth-form register-form" onSubmit={handleSubmit}>
            <div className="auth-form-header">
              <h2>Registrarse</h2>
              <p>Completa tus datos para crear una cuenta.</p>
            </div>

            <IonItem>
              <IonLabel position="stacked">Usuario</IonLabel>
              <IonInput
                className="custom-input"
                value={usuario}
                onIonChange={(e) => setUsuario(e.detail.value || '')}
                placeholder="Ingresa tu usuario"
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Rut</IonLabel>
              <IonInput
                className="custom-input"
                value={rut}
                onIonChange={(e) => setRut(e.detail.value || '')}
                placeholder="12.345.678-9"
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Región habitada</IonLabel>
              <IonInput
                className="custom-input"
                value={region}
                onIonChange={(e) => setRegion(e.detail.value || '')}
                placeholder="Ingresa tu región"
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Comuna habilitada</IonLabel>
              <IonInput
                className="custom-input"
                value={comuna}
                onIonChange={(e) => setComuna(e.detail.value || '')}
                placeholder="Ingresa tu comuna"
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Correo electrónico</IonLabel>
              <IonInput
                className="custom-input"
                type="email"
                value={email}
                onIonChange={(e) => setEmail(e.detail.value || '')}
                placeholder="correo@dominio.com"
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Contraseña</IonLabel>
              <IonInput
                className="custom-input"
                type="password"
                value={password}
                onIonChange={(e) => setPassword(e.detail.value || '')}
                placeholder="Crea una contraseña"
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Confirmar contraseña</IonLabel>
              <IonInput
                className="custom-input"
                type="password"
                value={confirmPassword}
                onIonChange={(e) => setConfirmPassword(e.detail.value || '')}
                placeholder="Repite tu contraseña"
              />
            </IonItem>

            <IonButton
              type="button"
              fill="clear"
              className="terms-button"
              onClick={() => setAcceptedTerms(!acceptedTerms)}
            >
              {acceptedTerms ? '✓' : '□'} Acepto los términos y condiciones
            </IonButton>

            <IonButton
              expand="block"
              type="submit"
              className="submit-button"
              disabled={!acceptedTerms}
            >
              Registrarse
            </IonButton>

            <IonRouterLink routerLink="/login">
              <IonButton fill="clear" expand="block" className="secondary-button">
                ¿Ya tienes cuenta? Inicia sesión
              </IonButton>
            </IonRouterLink>
          </form>
        </div>
      </div>
    </div>
  );
};