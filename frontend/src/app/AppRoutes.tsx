import React from 'react';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect } from 'react-router-dom';

import { LoginPage, RegisterPage } from '@/features/auth';
import { ComplaintsPage } from '@/features/complaints';
import { EducationPage, EducationModulePage } from '@/features/education';
import { HomePage } from '@/features/home';
import { PlaceholderPage } from '@/shared/pages/PlaceholderPage';
import { ProtocolsPage } from '@/features/protocols';
import { QuestionnairePage, QuestionnaireTakePage } from '@/features/questionnaires';
import { NewsPage } from '@/features/alerts';
import { InicioPage } from '@/features/dashboard';
import { AdminPage } from '@/features/admin';
import { useAuth } from '@/context/AuthContext';
import { AppMenu } from './AppMenu';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <IonApp>
      <IonReactRouter>
        <AppMenu />

        <IonRouterOutlet id="main-content">
          <Route exact path="/" component={HomePage} />
          <Route exact path="/index" component={HomePage} />
          <Route exact path="/login" component={LoginPage} />
          <Route exact path="/register" component={RegisterPage} />
          <Route exact path="/educacion" component={EducationPage} />
          <Route exact path="/denuncias" component={ComplaintsPage} />
          <Route exact path="/alertas" component={NewsPage} />

          <ProtectedRoute exact path="/educacion/modulo/:id" component={EducationModulePage} />
          <ProtectedRoute exact path="/cuestionarios" component={QuestionnairePage} />
          <ProtectedRoute exact path="/cuestionarios/:id/resolver" component={QuestionnaireTakePage} />
          <ProtectedRoute exact path="/inicio" component={InicioPage} />
          <ProtectedRoute exact path="/protocolos" component={ProtocolsPage} />
          <ProtectedRoute exact path="/admin" component={AdminPage} adminOnly />

          <Route
            exact
            path="/perfil"
            render={() =>
              user ? <PlaceholderPage title="Mi Perfil" /> : <Redirect to="/login" />
            }
          />

          <Route
            exact
            path="/configuracion"
            render={() =>
              user ? <PlaceholderPage title="Configuración" /> : <Redirect to="/login" />
            }
          />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};
