import { IonContent, IonPage } from '@ionic/react';
import { Navbar } from '../../shared/ui';
import './EducacionPage.css';

export const EducacionPage: React.FC = () => {
  return (
    <IonPage>
      <Navbar />
      <IonContent fullscreen className="placeholder-content">
        <div className="tab-shell">
          <div className="tab-card">
            <span>Educación</span>
            <h1>Contenidos pedagógicos municipales</h1>
            <p>
              Explora cursos, guías y herramientas diseñadas para mejorar la
              cultura digital de empleados, vecinos y servidores públicos.
            </p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};
