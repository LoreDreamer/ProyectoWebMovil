import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonButton,
  IonInput,
  IonLabel,
  IonItem,
  IonRouterLink,
  IonSelect,
  IonSelectOption
} from '@ionic/react';

import bgImage from '../../assets/auth/1_private-tour-of-the-city-of-neiva.png';
import './Forms.css';
import chileRegions from '../../assets/data/chileRegions.json';
import { useAuth } from '../../context/AuthContext';

type ChileRegion = {
  id: string;
  name: string;
  comunas: string[];
};

const CHILE_REGIONS = chileRegions as ChileRegion[];

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const history = useHistory();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Error al iniciar sesión');
        return;
      }

      await login(data.token);

      if (data.role === 'admin' || email === 'admin@inicio') {
        history.push('/admin');
      } else {
        history.push('/inicio');
      }

    } catch (error) {
      console.error('Error de conexión:', error);
      alert('No se pudo conectar con el servidor Express en el puerto 3000.');
    }
  };

  return (
    <div className="dividor login-layout">
      <div className="auth-card login-card">
        <div
          className="auth-image login-image"
          style={{ backgroundImage: `url(${bgImage})` }}
        />

        <div className="auth-form-container login-form-container">
          <form className="auth-form login-form" onSubmit={handleSubmit}>
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

  const history = useHistory();

  const selectedRegion = CHILE_REGIONS.find((item) => item.id === region);
  const comunas = selectedRegion?.comunas ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !usuario ||
      !rut ||
      !region ||
      !comuna ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      alert('Por favor completa todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (!acceptedTerms) {
      alert('Debes aceptar los términos y condiciones');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Error al registrarse');
        return;
      }

      localStorage.setItem('userName', usuario);
      localStorage.setItem('userRut', rut);
      localStorage.setItem('userRegion', region);
      localStorage.setItem('userComuna', comuna);

      alert('¡Usuario registrado con éxito en el servidor! Ahora inicia sesión.');

      history.push('/login');

    } catch (error) {
      console.error('Error de conexión:', error);
      alert('No se pudo conectar con el servidor Express en el puerto 3000.');
    }
  };

  return (
    <div className="dividor register-layout">
      <div className="auth-card register-card">
        <div
          className="auth-image register-image"
          style={{ backgroundImage: `url(${bgImage})` }}
        />

        <div className="auth-form-container register-form-container">
          <form className="auth-form register-form" onSubmit={handleSubmit}>
            <div className="auth-form-header">
              <h2>Registrarse</h2>
              <p>Completa tus datos para crear una cuenta.</p>
            </div>

            <IonItem>
              <IonLabel position="stacked">Usuario</IonLabel>
              <IonInput
                className="custom-input"
                type="text"
                value={usuario}
                onIonChange={(e) => setUsuario(e.detail.value || '')}
                placeholder="Ingresa tu usuario"
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Rut</IonLabel>
              <IonInput
                className="custom-input"
                type="text"
                value={rut}
                onIonChange={(e) => setRut(e.detail.value || '')}
                placeholder="12.345.678-9"
              />
            </IonItem>

            <IonItem className="select-field">
              <IonLabel position="stacked">Región</IonLabel>
              <IonSelect
                className="custom-select"
                interface="popover"
                value={region}
                placeholder="Selecciona una región"
                onIonChange={(e) => {
                  setRegion(e.detail.value);
                  setComuna('');
                }}
              >
                {CHILE_REGIONS.map((item) => (
                  <IonSelectOption key={item.id} value={item.id}>
                    {item.name}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>

            <IonItem className="select-field">
              <IonLabel position="stacked">Comuna</IonLabel>
              <IonSelect
                className="custom-select"
                interface="popover"
                value={comuna}
                placeholder="Selecciona una comuna"
                disabled={!region}
                onIonChange={(e) => setComuna(e.detail.value)}
              >
                {comunas.map((item) => (
                  <IonSelectOption key={item} value={item}>
                    {item}
                  </IonSelectOption>
                ))}
              </IonSelect>
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
              expand="block"
              className={`terms-button ${
                acceptedTerms ? 'terms-button-active' : ''
              }`}
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