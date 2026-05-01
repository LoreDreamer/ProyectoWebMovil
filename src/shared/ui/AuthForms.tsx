import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { IonButton, IonInput, IonLabel, IonItem, IonRouterLink } from '@ionic/react';
import bgImage from '../../assets/1_private-tour-of-the-city-of-neiva.png';
import './AuthForms.css';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const history = useHistory();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (email && password) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', email);
      history.push('/index');
      window.location.reload();
    } else {
      alert('Por favor completa todos los campos');
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-split auth-left" />
      <div className="auth-split auth-right">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-header">
            <span>Ingreso seguro</span>
            <h2>Iniciar sesión</h2>
            <p>
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

          <IonButton expand="block" type="submit" color="dark" className="submit-button">
            Iniciar sesión
          </IonButton>

          <IonRouterLink routerLink="/register">
            <IonButton className="register-button" fill="clear" expand="block">
              ¿No tienes cuenta? Regístrate
            </IonButton>
          </IonRouterLink>
        </form>
      </div>
    </div>
  );
};

export const RegisterForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const history = useHistory();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      alert('Por favor completa todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', name);
    localStorage.setItem('userEmail', email);
    history.push('/index');
    window.location.reload();
  };

  return (
    <div className="auth-shell">
      <div className="auth-split auth-left" />
      <div className="auth-split auth-right">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-header">
            <span>Registro seguro</span>
            <h2>Crear cuenta</h2>
            <p>
              Completa los datos del formulario para acceder a los recursos y
              reportes del sistema.
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

          <IonButton expand="block" type="submit" color="dark" className="submit-button">
            Crear cuenta
          </IonButton>

          <IonRouterLink routerLink="/login">
            <IonButton className="register-button" fill="clear" expand="block">
              ¿Ya tienes cuenta? Inicia sesión
            </IonButton>
          </IonRouterLink>
        </form>
      </div>
    </div>
  );
};
