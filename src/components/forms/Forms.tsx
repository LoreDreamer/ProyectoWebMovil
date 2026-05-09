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
import bgImage from '../../assets/1_private-tour-of-the-city-of-neiva.png';
import './Forms.css';
import '../../assets/data/chileRegions';
import { chileRegions, getComunasByRegion } from '../../assets/data/chileRegions';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const history = useHistory();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      alert('Por favor completa todos los campos');
      return;
    }

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', email);

    console.log('Correo:', email);
    console.log('Contraseña:', password);

    history.push('/inicio');
    window.location.reload();
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

  const history = useHistory();
  const comunas = getComunasByRegion(region);
  
  const handleSubmit = (e: React.FormEvent) => {
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

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', usuario);
    localStorage.setItem('userRut', rut);
    localStorage.setItem('userRegion', region);
    localStorage.setItem('userComuna', comuna);
    localStorage.setItem('userEmail', email);

    console.log('Usuario:', usuario);
    console.log('Rut:', rut);
    console.log('Región:', region);
    console.log('Comuna:', comuna);
    console.log('Correo:', email);
    console.log('Contraseña:', password);
    console.log('Confirmar contraseña:', confirmPassword);
    console.log('Acepta términos:', acceptedTerms);

    history.push('/inicio');
    window.location.reload();
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
            <div className="select-field">
            <IonLabel position="stacked">Región</IonLabel>
            <IonSelect
              className="custom-select"
              labelPlacement="stacked"
              fill="solid"
              interface="popover"
              value={region}
              placeholder="Selecciona una región"
              onIonChange={(e) => {
                setRegion(e.detail.value);
                setComuna('');
              }}
            >
              {chileRegions.map((region) => (
                <IonSelectOption key={region.id} value={region.id}>
                  {region.name}
                </IonSelectOption>
              ))}
            </IonSelect>
          </div>

          <div className="select-field">
            <IonLabel position="stacked">Comuna</IonLabel>
            <IonSelect
              className="custom-select"
              labelPlacement="stacked"
              fill="solid"
              interface="popover"
              value={comuna}
              placeholder="Selecciona una comuna"
              disabled={!region}
              onIonChange={(e) => setComuna(e.detail.value)}
            >
              {comunas.map((comuna) => (
                <IonSelectOption key={comuna} value={comuna}>
                  {comuna}
                </IonSelectOption>
              ))}
            </IonSelect>
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