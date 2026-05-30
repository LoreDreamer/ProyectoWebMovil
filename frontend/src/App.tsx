import React from 'react';
import { Route, Redirect } from 'react-router-dom';
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
import {
  homeOutline,
  bookOutline,
  alertCircleOutline,
  documentTextOutline,
  shieldCheckmarkOutline,
  notificationsOutline
} from 'ionicons/icons';

import {
  LoginPage,
  RegisterPage,
  ComplaintsPage,
  EducationPage,
  HomePage,
  PlaceholderPage,
  ProtocolsPage,
  QuestionnairePage,
  NewsPage,
  InicioPage,
  AdminPage,
  EducationModulePage 
} from './pages';

import { QuestionnaireTakePage } from './pages/questionnaires/QuestionnaireTakePage';
import { AuthProvider, useAuth } from './context/AuthContext';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

import './global.css';
import './components/adminPanel/adminPanels.css';
import './theme/variables.css';
import './responsive.css';

setupIonicReact();

const closeMenu = () => {
  const menu = document.querySelector('ion-menu');
  if (menu) menu.close();
};

const AppRoutes: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null; 
  }

  return (
    <IonApp>
      <IonReactRouter>
        <IonMenu contentId="main-content" type="overlay">
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>Menú Municipal</IonTitle>
            </IonToolbar>
          </IonHeader>

          <IonContent>
            <IonList>
              <IonItem button routerLink="/index" onClick={closeMenu}>
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

              {user && (
                <>
                  <IonItem button routerLink="/cuestionarios" onClick={closeMenu}>
                    <IonIcon slot="start" icon={documentTextOutline} />
                    <IonLabel>Cuestionarios</IonLabel>
                  </IonItem>

                  <IonItem button routerLink="/protocolos" onClick={closeMenu}>
                    <IonIcon slot="start" icon={shieldCheckmarkOutline} />
                    <IonLabel>Protocolos</IonLabel>
                  </IonItem>
                </>
              )}

              <IonItem button routerLink="/alertas" onClick={closeMenu}>
                <IonIcon slot="start" icon={notificationsOutline} />
                <IonLabel>Alertas</IonLabel>
              </IonItem>
            </IonList>
          </IonContent>
        </IonMenu>

        <IonRouterOutlet id="main-content">
          <Route exact path="/" component={HomePage} />
          <Route exact path="/index" component={HomePage} />
          <Route exact path="/login" component={LoginPage} />
          <Route exact path="/register" component={RegisterPage} />
          <Route exact path="/educacion" component={EducationPage} />
          <Route exact path="/denuncias" component={ComplaintsPage} />
          <Route exact path="/alertas" component={NewsPage} />

          <Route 
            exact 
            path="/educacion/modulo/:id" 
            render={() => {
              if (!user) return <Redirect to="/login" />;
              return <EducationModulePage />;
            }} 
          />
          
          <Route 
            exact 
            path="/cuestionarios" 
            render={() => {
              if (!user) return <Redirect to="/login" />;
              return <QuestionnairePage />;
            }} 
          />

          <Route
            exact
            path="/cuestionarios/:id/resolver"
            render={() => {
              if (!user) return <Redirect to="/login" />;
              return <QuestionnaireTakePage />;
            }}
          />

          <Route 
            path="/inicio" 
            exact 
            render={() => {
              if (!user) {
                return <Redirect to="/login" />;
              }
              return <InicioPage />; // Pon aquí el nombre exacto de tu componente de inicio
            }} 
          />

          <Route 
            exact 
            path="/protocolos" 
            render={() => {
              if (!user) return <Redirect to="/login" />;
              return <ProtocolsPage />;
            }} 
          />

          <Route
            exact
            path="/admin"
            render={() => {
              if (!user) return <Redirect to="/login" />;
              if (user.role !== 'admin') return <Redirect to="/inicio" />;
              return <AdminPage />;
            }}
          />

          <Route 
            exact 
            path="/perfil" 
            render={() => user ? <PlaceholderPage title="Mi Perfil" /> : <Redirect to="/login" />} 
          />
          <Route 
            exact 
            path="/configuracion" 
            render={() => user ? <PlaceholderPage title="Configuración" /> : <Redirect to="/login" />} 
          />

        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}