import React, { Suspense, lazy, useEffect } from 'react';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect } from 'react-router-dom';

import { useAuth } from '@/context/AuthContext';
import { AppMenu } from './AppMenu';
import { ProtectedRoute } from './ProtectedRoute';
import { NotificationProvider } from '@/shared/notifications';
import './AppRoutes.css';

const RouteWhiteScreen = () => (
  <div className="route-white-screen" aria-hidden="true" />
);

type LazyPageLoader = () => Promise<{ default: React.ComponentType<any> }>;

const homePageLoader: LazyPageLoader = () =>
  import('@/features/home/pages/HomePage').then((module) => ({ default: module.HomePage }));

const loginPageLoader: LazyPageLoader = () =>
  import('@/features/auth/pages/LoginPage').then((module) => ({ default: module.LoginPage }));

const registerPageLoader: LazyPageLoader = () =>
  import('@/features/auth/pages/RegisterPage').then((module) => ({ default: module.RegisterPage }));

const educationPageLoader: LazyPageLoader = () =>
  import('@/features/education/pages/EducacionPage').then((module) => ({ default: module.EducationPage }));

const educationModulePageLoader: LazyPageLoader = () =>
  import('@/features/education/pages/EducationModulePage').then((module) => ({ default: module.EducationModulePage }));

const complaintsPageLoader: LazyPageLoader = () =>
  import('@/features/complaints/pages/ComplaintsPage').then((module) => ({ default: module.ComplaintsPage }));

const newsPageLoader: LazyPageLoader = () =>
  import('@/features/alerts/pages/NewsPage').then((module) => ({ default: module.NewsPage }));

const inicioPageLoader: LazyPageLoader = () =>
  import('@/features/dashboard/pages/InicioPage').then((module) => ({ default: module.InicioPage }));

const protocolsPageLoader: LazyPageLoader = () =>
  import('@/features/protocols/pages/ProtocolsPage').then((module) => ({ default: module.ProtocolsPage }));

const questionnairePageLoader: LazyPageLoader = () =>
  import('@/features/questionnaires/pages/QuestionnairePage').then((module) => ({ default: module.QuestionnairePage }));

const questionnaireTakePageLoader: LazyPageLoader = () =>
  import('@/features/questionnaires/pages/QuestionnaireTakePage').then((module) => ({ default: module.QuestionnaireTakePage }));

const adminPageLoader: LazyPageLoader = () =>
  import('@/features/admin/pages/AdminPage').then((module) => ({ default: module.AdminPage }));

const placeholderPageLoader: LazyPageLoader = () =>
  import('@/shared/pages/PlaceholderPage').then((module) => ({ default: module.PlaceholderPage }));

const HomePage = lazy(homePageLoader);
const LoginPage = lazy(loginPageLoader);
const RegisterPage = lazy(registerPageLoader);
const EducationPage = lazy(educationPageLoader);
const EducationModulePage = lazy(educationModulePageLoader);
const ComplaintsPage = lazy(complaintsPageLoader);
const NewsPage = lazy(newsPageLoader);
const InicioPage = lazy(inicioPageLoader);
const ProtocolsPage = lazy(protocolsPageLoader);
const QuestionnairePage = lazy(questionnairePageLoader);
const QuestionnaireTakePage = lazy(questionnaireTakePageLoader);
const AdminPage = lazy(adminPageLoader);
const PlaceholderPage = lazy(placeholderPageLoader);

const routeLoaders: LazyPageLoader[] = [
  homePageLoader,
  loginPageLoader,
  registerPageLoader,
  educationPageLoader,
  complaintsPageLoader,
  newsPageLoader,
  inicioPageLoader,
  protocolsPageLoader,
  questionnairePageLoader,
  educationModulePageLoader,
  questionnaireTakePageLoader,
  adminPageLoader,
  placeholderPageLoader
];

export const AppRoutes: React.FC = () => {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return undefined;

    let cancelled = false;
    let timeoutId: number | undefined;

    const preloadNextRoute = (index = 0) => {
      if (cancelled || index >= routeLoaders.length) return;

      void routeLoaders[index]()
        .catch(() => undefined)
        .finally(() => {
          timeoutId = window.setTimeout(() => preloadNextRoute(index + 1), 90);
        });
    };

    timeoutId = window.setTimeout(() => preloadNextRoute(), 650);

    return () => {
      cancelled = true;
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [isLoading]);

  if (isLoading) {
    return <RouteWhiteScreen />;
  }

  return (
    <IonApp>
      <NotificationProvider>
        <IonReactRouter>
          <AppMenu />

          <Suspense fallback={<RouteWhiteScreen />}>
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
          </Suspense>
        </IonReactRouter>
      </NotificationProvider>
    </IonApp>
  );
};
