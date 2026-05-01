import { IonContent, IonPage } from '@ionic/react';
import { Navbar, HeroSection, InfoSection } from '../../shared/ui';
import './HomePage.css';

export const HomePage: React.FC = () => {
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
