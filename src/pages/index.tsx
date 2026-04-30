import { IonPage, IonContent } from '@ionic/react';
import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { InfoSection } from '../components/InfoSection';
import './HomePage.css';

export const Index: React.FC = () => {
  return (
    <IonPage>
      <Navbar />
      <IonContent fullscreen className="home-content">
        <main className="home-main">
          <HeroSection />
          <InfoSection />
        </main>
      </IonContent>
    </IonPage>
  );
};