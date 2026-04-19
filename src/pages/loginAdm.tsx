import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import Navbar from '../components/Navbar';  
import Form from '../components/Form';
import './loginAdm.css';

const loginAdm: React.FC = () => {
  return (
    <IonPage>
      <Navbar />
      <IonContent className="transparent-content">
        <Form />
      </IonContent>
    </IonPage>
  );
};

export default loginAdm;
