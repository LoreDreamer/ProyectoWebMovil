import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import {Navbar} from '../components/Navbar';
import './Tab3.css';

const Tab3: React.FC = () => {
  return (
    <IonPage>
      <Navbar />
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 3</IonTitle>
          </IonToolbar>
        </IonHeader>
      </IonContent>
    </IonPage>
  );
};

export default Tab3;
