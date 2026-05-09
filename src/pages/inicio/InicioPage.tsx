import { IonContent, IonPage, IonButton } from '@ionic/react';
import { Navbar, StatCard, Progress, NewsPanel } from '../../components';
import { listOutline, eyeOutline, sendOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import './InicioPage.css';

export const InicioPage: React.FC = () => {
  const history = useHistory();

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRut');
    localStorage.removeItem('userRegion');
    localStorage.removeItem('userComuna');
    localStorage.removeItem('isAdmin');
    history.push('/index');
    window.location.reload();
  };

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

          <IonButton 
            expand="block" 
            onClick={handleLogout}
            className="logout-button"
          >
            Cerrar sesión
          </IonButton>

        </div>
      </IonContent>
    </IonPage>
  );
};    