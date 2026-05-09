import { IonContent, IonPage, IonButton } from '@ionic/react';
import { Navbar } from '../../components';
import { useHistory } from 'react-router-dom';
import './AdminPage.css';

export const AdminPage: React.FC = () => {
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
      <IonContent className="admin-content-page">
        <div className="central-container">
          <h1>Página de Administrador</h1>
          <p>Aquí puedes gestionar el sistema.</p>
          
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
