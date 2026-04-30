import React, { useState } from 'react';
import { IonButton, IonInput, IonLabel, IonItem, IonRouterLink } from '@ionic/react';
import bgImage from '../assets/1_private-tour-of-the-city-of-neiva.png';
import './Forms.css';


export const LoginForm: React.FC = () => {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Usuario:', usuario);
    console.log('Contraseña:', contrasena);
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
            <h2>Login</h2>
            
            <IonItem>
            <IonLabel position="stacked">Usuario</IonLabel>
            <IonInput
                type="text"
                value={usuario}
                onIonChange={(e) => setUsuario(e.detail.value || '')}
                placeholder="Ingresa tu usuario"
            />
            </IonItem>

            <IonItem>
            <IonLabel position="stacked">Contraseña</IonLabel>
            <IonInput
                type="password"
                value={contrasena}
                onIonChange={(e) => setContrasena(e.detail.value || '')}
                placeholder="Ingresa tu contraseña"
            />
            </IonItem>
            <IonButton expand="block" type="submit" color="dark" className="submit-button"> Iniciar Sesión </IonButton>
            <IonRouterLink routerLink="/register">
              <IonButton className='register-button' fill='clear'> ¿No tienes cuenta? </IonButton>
            </IonRouterLink>     
          </form>
        </div>
      </div>
    </div>
  );
};

export const RegisterForm: React.FC = () => {

  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [correo, setCorreo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Usuario:', usuario);
    console.log("Correo electrónico: ", correo);
    console.log('Contraseña:', contrasena);
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
            <h2>Registrarse</h2>

            <IonItem>
            <IonLabel position="stacked">Correo Electrónico</IonLabel>
            <IonInput
                type="text"
                value={correo}
                onIonChange={(e) => setCorreo(e.detail.value || '')}
                placeholder="Ingresa tu correo electrónico"
            />
            </IonItem>

            
            <IonItem>
            <IonLabel position="stacked">Usuario</IonLabel>
            <IonInput
                type="text"
                value={usuario}
                onIonChange={(e) => setUsuario(e.detail.value || '')}
                placeholder="Ingresa tu usuario"
            />
            </IonItem>

            <IonItem>
            <IonLabel position="stacked">Contraseña</IonLabel>
            <IonInput
                type="password"
                value={contrasena}
                onIonChange={(e) => setContrasena(e.detail.value || '')}
                placeholder="Ingresa tu contraseña"
            />
            </IonItem>
            <IonButton expand="block" type="submit" color="dark" className="submit-button"> Registrarse </IonButton>
            <IonRouterLink routerLink="/login">
              <IonButton className='register-button' fill='clear'> ¿Ya tienes cuenta? Inicia sesión </IonButton>
            </IonRouterLink>
          </form>
        </div>
      </div>
    </div>
  );
}
