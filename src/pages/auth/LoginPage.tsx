import { IonContent, IonPage } from '@ionic/react';
import { Navbar, LoginForm } from '../../components';
import './AuthPage.css';

export const LoginPage: React.FC = () => {
  return (
    <IonPage>
      <Navbar />
      <IonContent className="transparent-content">
        <LoginForm />
      </IonContent>
    </IonPage>
  );
};
