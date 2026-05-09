import { IonPage, IonContent } from '@ionic/react';
import { Navbar, NewsPart, Footer } from '../../components';
import './newsPage.css';

export const NewsPage: React.FC = () => {
  return (
    <IonPage>
      <Navbar />

      <IonContent className="news-page-content">
        <main className="news-page-main">
          <NewsPart />
        </main>

        <Footer />
      </IonContent>
    </IonPage>
  );
};