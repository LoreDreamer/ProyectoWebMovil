import { IonContent, IonPage } from '@ionic/react';
import Navbar from '../components/Navbar';  
import { RegisterForm } from '../components/Forms';
import './loginAdm.css';

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

export default RegisterPage;