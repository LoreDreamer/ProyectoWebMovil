import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonButton,
  IonInput,
  IonRouterLink,
  IonSelect,
  IonSelectOption
} from '@ionic/react';

import bgImage from '@/assets/auth/1_private-tour-of-the-city-of-neiva.png';
import './Forms.css';
import { chileRegions } from '@/assets/data/chileRegions';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/shared/api/apiClient';
import { notify } from '@/shared/notifications';

const CHILE_REGIONS = chileRegions;

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const history = useHistory();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      notify.warning('Por favor completa todos los campos');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        notify.error(data.message || 'Error al iniciar sesión');
        return;
      }

      await login(data.token, data.user);

      const userRole = data.user?.role || data.role;

      if (userRole === 'admin' || email === 'admin@inicio') {
        history.push('/admin');
      } else {
        history.push('/inicio');
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      notify.error('No se pudo conectar con el servidor Express en el puerto 3000.');
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

            <div className="auth-field">
              <label className="auth-label">Correo electrónico</label>

              <IonInput
                className="auth-input"
                type="email"
                value={email}
                onIonChange={(e) => setEmail(e.detail.value || '')}
                placeholder="correo@dominio.com"
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Contraseña</label>

              <IonInput
                className="auth-input"
                type="password"
                value={password}
                onIonChange={(e) => setPassword(e.detail.value || '')}
                placeholder="Ingresa tu contraseña"
              />
            </div>

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
      notify.warning('Por favor completa todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      notify.warning('Las contraseñas no coinciden');
      return;
    }

    if (!acceptedTerms) {
      notify.warning('Debes aceptar los términos y condiciones');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre_completo: usuario.trim(),
          name: usuario.trim(),
          rut: rut.trim(),
          region: selectedRegion?.name || region,
          comuna: comuna,
          email: email.trim(),
          correo: email.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Error register backend:', data);
        notify.error(data.message || data.error || 'Error al registrar usuario.');
        return;
      }

      localStorage.setItem('userName', usuario);
      localStorage.setItem('userRut', rut);
      localStorage.setItem('userRegion', selectedRegion?.name || region);
      localStorage.setItem('userComuna', comuna);

      notify.success('¡Usuario registrado con éxito! Ahora inicia sesión.');

      history.push('/login');
    } catch (error) {
      console.error('Error de conexión:', error);
      notify.error('No se pudo conectar con el servidor Express en el puerto 3000.');
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

            <div className="auth-form-grid">
              <div className="auth-field">
                <label className="auth-label">Nombre completo</label>

                <IonInput
                  className="auth-input"
                  type="text"
                  value={usuario}
                  onIonChange={(e) => setUsuario(e.detail.value || '')}
                  placeholder="Ej: Camila Rojas Fernández"
                />
              </div>

              <div className="auth-field">
                <label className="auth-label">RUT</label>

                <IonInput
                  className="auth-input"
                  type="text"
                  value={rut}
                  onIonChange={(e) => setRut(e.detail.value || '')}
                  placeholder="12.345.678-9"
                />
              </div>

              <div className="auth-field">
                <label className="auth-label">Región</label>

                <IonSelect
                  className="auth-select"
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
              </div>

              <div className="auth-field">
                <label className="auth-label">Comuna</label>

                <IonSelect
                  className="auth-select"
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
              </div>

              <div className="auth-field auth-field-full">
                <label className="auth-label">Correo electrónico</label>

                <IonInput
                  className="auth-input"
                  type="email"
                  value={email}
                  onIonChange={(e) => setEmail(e.detail.value || '')}
                  placeholder="correo@dominio.com"
                />
              </div>

              <div className="auth-field">
                <label className="auth-label">Contraseña</label>

                <IonInput
                  className="auth-input"
                  type="password"
                  value={password}
                  onIonChange={(e) => setPassword(e.detail.value || '')}
                  placeholder="Crea una contraseña"
                />
              </div>

              <div className="auth-field">
                <label className="auth-label">Confirmar contraseña</label>

                <IonInput
                  className="auth-input"
                  type="password"
                  value={confirmPassword}
                  onIonChange={(e) => setConfirmPassword(e.detail.value || '')}
                  placeholder="Repite tu contraseña"
                />
              </div>
            </div>

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
