import { IonPage, IonContent } from '@ionic/react';
import {Navbar} from '../components/Navbar';
import './index.css';

export const Index: React.FC = () => {
  return (
    <IonPage className="home-page">
      <Navbar />

      <IonContent fullscreen className="home-content">
        <div className="home-scroll-area">
          <div style={{ height: '1200px' }}>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};