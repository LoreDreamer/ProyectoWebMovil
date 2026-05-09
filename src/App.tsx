import { Redirect, Route } from 'react-router-dom';
import { 
  IonApp, 
  IonRouterOutlet, 
  setupIonicReact, 
  IonMenu, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonList, 
  IonItem, 
  IonLabel,
  IonIcon
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { homeOutline, bookOutline, alertCircleOutline, documentTextOutline, shieldCheckmarkOutline, notificationsOutline } from 'ionicons/icons';
import { LoginPage, RegisterPage, ComplaintsPage, EducationPage, HomePage, PlaceholderPage, ProtocolsPage, QuestionnairePage, NewsPage, InicioPage } from './pages';

/* CSS de Ionic (mantén tus importaciones actuales) */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import './global.css';
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => {
  // Función para cerrar el menú al hacer clic en un link (opcional pero recomendado)
  const closeMenu = () => {
    const menu = document.querySelector('ion-menu');
    if (menu) menu.close();
  };

  return (
    <IonApp>
      <IonReactRouter>
        
        {/* --- 1. COMPONENTE MENÚ LATERAL --- */}
        {/* El contentId DEBE coincidir con el id del IonRouterOutlet */}
        <IonMenu contentId="main-content" type="overlay">
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>Menú Municipal</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonList>
              <IonItem button routerLink="/inicio" onClick={closeMenu}>
                <IonIcon slot="start" icon={homeOutline} />
                <IonLabel>Inicio</IonLabel>
              </IonItem>
              <IonItem button routerLink="/educacion" onClick={closeMenu}>
                <IonIcon slot="start" icon={bookOutline} />
                <IonLabel>Educación</IonLabel>
              </IonItem>
              <IonItem button routerLink="/denuncias" onClick={closeMenu}>
                <IonIcon slot="start" icon={alertCircleOutline} />
                <IonLabel>Denuncias</IonLabel>
              </IonItem>
              <IonItem button routerLink="/cuestionarios" onClick={closeMenu}>
                <IonIcon slot="start" icon={documentTextOutline} />
                <IonLabel>Cuestionarios</IonLabel>
              </IonItem>
              <IonItem button routerLink="/protocolos" onClick={closeMenu}>
                <IonIcon slot="start" icon={shieldCheckmarkOutline} />
                <IonLabel>Protocolos</IonLabel>
              </IonItem>
              <IonItem button routerLink="/alertas" onClick={closeMenu}>
                <IonIcon slot="start" icon={notificationsOutline} />
                <IonLabel>Alertas</IonLabel>
              </IonItem>
            </IonList>
          </IonContent>
        </IonMenu>

        {/* --- 2. CONTENEDOR PRINCIPAL --- */}
        {/* Agregamos id="main-content" para vincularlo con el menú */}
        <IonRouterOutlet id="main-content">
          <Route exact path="/index" component={HomePage} />
          <Route exact path="/inicio" component={InicioPage} />
          <Route exact path="/login" component={LoginPage} />
          <Route exact path="/register" component={RegisterPage} />
          <Route exact path="/educacion" component={EducationPage} />
          <Route exact path="/denuncias" component ={ComplaintsPage} />
          <Route exact path="/cuestionarios" component={QuestionnairePage} />
          <Route exact path="/protocolos" component={ProtocolsPage} />
          <Route exact path="/alertas" component= {NewsPage} />
          <Route exact path="/perfil" render={() => <PlaceholderPage title="Mi Perfil" />} />
          <Route exact path="/configuracion" render={() => <PlaceholderPage title="Configuración" />} />
          <Route exact path="/">
            <Redirect to="/index" />
          </Route>
        </IonRouterOutlet>

      </IonReactRouter>
    </IonApp>
  );
};

export default App;