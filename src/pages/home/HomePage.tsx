import { IonPage, IonContent } from '@ionic/react';
import { Navbar } from '../../components/navbar/Navbar';
import { HeroSection } from '../../components/hero/HeroSection';
import { InfoSection } from '../../components/info/InfoSection';
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
}