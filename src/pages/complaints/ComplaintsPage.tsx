import { IonContent, IonPage } from '@ionic/react';
import { Navbar } from '../../components/navbar/Navbar';
import { ComplaintsForm } from '../../components/complaints/ComplaintsForm';
import './ComplaintsPage.css';

export const ComplaintsPage: React.FC = () => {
  return (
    <IonPage>
      <Navbar />
      <IonContent fullscreen className="complaints-content">
        <div className="complaints-shell">
          {/* Se eliminó el header anterior para evitar duplicidad */}
          <div className="complaints-form-wrapper">
            <ComplaintsForm />
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};