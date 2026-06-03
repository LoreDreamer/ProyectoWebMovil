import { IonPage, IonContent } from '@ionic/react';
import { Navbar, HeroSection, InfoSection, Footer } from '@/components';
import './HomePage.css';

export const HomePage: React.FC = () => {
  return (
    <IonPage>
      <Navbar />

      <IonContent className="home-content">
        <main className="home-main">
          <HeroSection />
          <InfoSection />
          <Footer />
        </main>
      </IonContent>
    </IonPage>
  );
};