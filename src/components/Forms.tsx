import React, { useState } from 'react';
import { IonButton, IonInput, IonLabel, IonItem, IonRouterLink } from '@ionic/react';
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
    <div className='dividor' style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
    }}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        backgroundColor: '#ffffff',
        borderRadius: '15px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        maxWidth: '900px',
        width: '90%',
        overflow: 'hidden'
      }}>
        <div style={{
          flex: '1 1 300px',
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          minHeight: '350px'
        }} />

        <div className="form-container" style={{
          flex: '1 1 300px',
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="auth-form-header">
              <span>Ingreso seguro</span>
              <h2>Iniciar sesión</h2>
              <p style={{ marginBottom: '20px', color: '#666' }}>
                Accede al panel municipal para gestionar incidentes y fortalecer la
                seguridad digital de tu comunidad.
              </p>
            </div>
            
            <IonItem>
              <IonLabel position="stacked">Correo electrónico</IonLabel>
              <IonInput
                type="email"
                value={email}
                onIonChange={(e) => setEmail(e.detail.value || '')}
                placeholder="correo@dominio.com"
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Contraseña</IonLabel>
              <IonInput
                type="password"
                value={password}
                onIonChange={(e) => setPassword(e.detail.value || '')}
                placeholder="Ingresa tu contraseña"
              />
            </IonItem>

            <IonButton expand="block" type="submit" color="dark" className="submit-button" style={{ marginTop: '20px' }}>
              Iniciar sesión
            </IonButton>
            
            <IonRouterLink routerLink="/register">
              <IonButton className='register-button' fill='clear' expand="block">
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
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Nombre:', name);
    console.log('Correo:', email);
    console.log('Contraseña:', password);
    console.log('Confirmar contraseña:', confirmPassword);
  };

  return (
    <div className='dividor' style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
    }}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        backgroundColor: '#ffffff',
        borderRadius: '15px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        maxWidth: '900px',
        width: '90%',
        overflow: 'hidden'
      }}>
        <div style={{
          flex: '1 1 300px',
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          minHeight: '350px'
        }} />

        <div className="form-container" style={{
          flex: '1 1 300px',
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="auth-form-header">
              <span>Registro seguro</span>
              <h2>Crear cuenta</h2>
              <p style={{ marginBottom: '20px', color: '#666' }}>
                Completa los datos del formulario para acceder a los recursos y reportes
                del sistema.
              </p>
            </div>

            <IonItem>
              <IonLabel position="stacked">Nombre completo</IonLabel>
              <IonInput
                type="text"
                value={name}
                onIonChange={(e) => setName(e.detail.value || '')}
                placeholder="Nombre completo"
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Correo electrónico</IonLabel>
              <IonInput
                type="email"
                value={email}
                onIonChange={(e) => setEmail(e.detail.value || '')}
                placeholder="correo@dominio.com"
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Contraseña</IonLabel>
              <IonInput
                type="password"
                value={password}
                onIonChange={(e) => setPassword(e.detail.value || '')}
                placeholder="Crea una contraseña segura"
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Confirmar contraseña</IonLabel>
              <IonInput
                type="password"
                value={confirmPassword}
                onIonChange={(e) => setConfirmPassword(e.detail.value || '')}
                placeholder="Repite tu contraseña"
              />
            </IonItem>

            <IonButton expand="block" type="submit" color="dark" className="submit-button" style={{ marginTop: '20px' }}>
              Crear cuenta
            </IonButton>
            
            <IonRouterLink routerLink="/login">
              <IonButton className='register-button' fill='clear' expand="block">
                ¿Ya tienes cuenta? Inicia sesión
              </IonButton>
            </IonRouterLink>
          </form>
        </div>
      </div>
    </div>
  );
};