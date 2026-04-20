import { IonContent, IonPage } from '@ionic/react';
import Navbar from '../components/Navbar';  
import { LoginForm } from '../components/Forms';
import './loginAdm.css';

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

export default LoginPage;
