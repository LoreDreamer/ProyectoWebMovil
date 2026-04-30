import { IonPage, IonContent } from '@ionic/react';
import { Navbar } from '../components/Navbar';
import { NewsPart } from '../components/newsPart';
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