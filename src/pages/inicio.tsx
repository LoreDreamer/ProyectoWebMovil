import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import {Navbar} from '../components/Navbar';

export const Inicio: React.FC = () => {
  return (
    <IonPage>
      <Navbar />
    </IonPage>
  );
};

export default Inicio;    