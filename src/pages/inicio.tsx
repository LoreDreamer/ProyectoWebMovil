import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import {Navbar} from '../components/Navbar';
import StatCard from '../components/inicio/StatCard';
import Progress from '../components/inicio/Progress';
import NewsPanel from '../components/inicio/NewsPanel';
import { listOutline, eyeOutline, sendOutline, checkmarkCircleOutline } from 'ionicons/icons';
import './inicio.css';

export const Inicio: React.FC = () => {
  return (
    <IonPage>
      <Navbar />
      <IonContent className="inicio-content-page">
        <div className="central-container">
          
          <div className="welcome-section">
            <h1>BIENVENID@, USUARIO!</h1>
            <p>Bienvenid@ de vuelta. Aquí tienes un resumen de tu actividad y alertas recientes.</p>
          </div>

          <div className="stats-grid">
            <StatCard icon={listOutline} label="CUESTIONARIOS COMPLETADOS" value="3" />
            <StatCard icon={eyeOutline} label="MÓDULOS VISTOS" value="5" />
            <StatCard icon={sendOutline} label="DENUNCIAS ENVIADAS" value="0" />
            <StatCard icon={checkmarkCircleOutline} label="CURSOS COMPLETADOS" value="1" />
          </div>

          <div className="main-grid">
            <Progress />
            <NewsPanel />
          </div>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default Inicio;    