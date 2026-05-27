import { IonContent, IonPage } from '@ionic/react';
import { Navbar, StatCard, Progress, NewsPanel, Footer } from '../../components';
import {
  listOutline,
  eyeOutline,
  sendOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';
import { useAuth } from '../../context/AuthContext';
import './InicioPage.css';

export const InicioPage: React.FC = () => {
  const { user } = useAuth();

  const nombreCompleto = user?.nombre_completo || 'Usuario';
  const primerNombre = nombreCompleto.split(' ')[0] || 'Usuario';

  return (
    <IonPage>
      <Navbar />

      <IonContent className="inicio-content-page">
        <div className="central-container">

          <div className="welcome-section">
            <h1>BIENVENID@, {primerNombre.toUpperCase()}!</h1>

            <p>
              Bienvenid@ de vuelta. Aquí tienes un resumen de tu actividad y alertas recientes.
            </p>

            {user && (
              <div className="user-profile-summary">
                <div>
                  <strong>Nombre completo</strong>
                  <span>{user.nombre_completo}</span>
                </div>

                <div>
                  <strong>RUT</strong>
                  <span>{user.rut}</span>
                </div>

                <div>
                  <strong>Ubicación</strong>
                  <span>{user.comuna}, {user.region}</span>
                </div>

                <div>
                  <strong>Correo</strong>
                  <span>{user.email}</span>
                </div>
              </div>
            )}
          </div>

          <div className="stats-grid">
            <StatCard
              icon={listOutline}
              label="CUESTIONARIOS COMPLETADOS"
              value="3"
            />

            <StatCard
              icon={eyeOutline}
              label="MÓDULOS VISTOS"
              value="5"
            />

            <StatCard
              icon={sendOutline}
              label="DENUNCIAS ENVIADAS"
              value="0"
            />

            <StatCard
              icon={checkmarkCircleOutline}
              label="CURSOS COMPLETADOS"
              value="1"
            />
          </div>

          <div className="main-grid">
            <Progress />
            <NewsPanel />
          </div>

        </div>

        <Footer />
      </IonContent>
    </IonPage>
  );
};

export default InicioPage;