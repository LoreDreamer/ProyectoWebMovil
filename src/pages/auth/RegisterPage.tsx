import { IonContent, IonPage } from '@ionic/react';
import { Navbar, RegisterForm } from '../../components';
import './AuthPage.css';

export const RegisterPage: React.FC = () => {
  return (
    <IonPage>
      <Navbar />
      <IonContent className="transparent-content">
        <RegisterForm />
      </IonContent>
    </IonPage>
  );
};
