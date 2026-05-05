import { IonPage, IonContent } from '@ionic/react';
import { Navbar, NewsPart } from '../../components';
import './newsPage.css';

export const NewsPage: React.FC = () => {
  return (
    <IonPage>
      <Navbar />
      <IonContent fullscreen className="news-page-content">
        <main className="news-page-main">
          <NewsPart />
        </main>
      </IonContent>
    </IonPage>
  );
};