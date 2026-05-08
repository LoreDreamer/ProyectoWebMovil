import { IonContent, IonPage } from '@ionic/react';
import { Navbar } from '../../components/navbar/Navbar';
import { ComplaintsForm } from '../../components/complaints/ComplaintsForm';
import { ComplaintTips } from '../../components/complaints/ComplaintTips'; // Asegúrate de que la ruta sea correcta
import './ComplaintsPage.css';

export const ComplaintsPage: React.FC = () => {
  return (
    <IonPage>
      <Navbar />
      <IonContent fullscreen className="complaints-content">
        <div className="complaints-shell">
          
          {/* Este contenedor es el que permite poner uno al lado del otro */}
          <div className="complaints-layout-container">
            <div className="complaints-form-wrapper">
              <ComplaintsForm />
            </div>

            <div className="complaints-sidebar-wrapper">
              <ComplaintTips />
            </div>
          </div>

        </div>
      </IonContent>
    </IonPage>
  );
};