import { IonPage, IonContent } from '@ionic/react';
import { Navbar, NewsPart, Footer, AlertsPanel } from '@/components';
import { useAuth } from '@/context/AuthContext';
import './NewsPage.css';

export const NewsPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <IonPage>
      <Navbar />

      <IonContent className="news-page-content">
        <main className="news-page-main">
          {isAdmin && (
            <section style={{ marginBottom: 24 }}>
              <AlertsPanel />
            </section>
          )}

          <NewsPart />
        </main>

        <Footer />
      </IonContent>
    </IonPage>
  );
};