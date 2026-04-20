import { IonPage } from '@ionic/react';
import Navbar from '../components/Navbar';
import './index.css';

export const index: React.FC = () => {
  return (
    <IonPage>
      <Navbar />
    </IonPage>
  );
};

export default index;
