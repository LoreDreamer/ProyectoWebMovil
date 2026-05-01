import { IonContent, IonPage } from '@ionic/react';
import { Navbar } from '../../shared/ui';
import './PlaceholderPage.css';

interface PlaceholderPageProps {
  title: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
  return (
    <IonPage>
      <Navbar />
      <IonContent fullscreen className="placeholder-content">
        <div className="placeholder-shell">
          <div className="placeholder-card">
            <h1>{title}</h1>
            <p>
              Esta sección estará disponible pronto. Navega por el sitio para
              regresar al inicio o acceder a los formularios de ingreso y creación
              de cuenta.
            </p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};
