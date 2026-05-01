import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { LoginPage, RegisterPage, EducationPage, HomePage, PlaceholderPage, ProtocolsPage, QuestionnairePage, NewsPage } from './pages';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './global.css';
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <Route exact path="/index" component={HomePage} />
        <Route exact path="/login" component={LoginPage} />
        <Route exact path="/register" component={RegisterPage} />
        <Route exact path="/educacion" component={EducationPage} />
        <Route exact path="/denuncias" render={() => <PlaceholderPage title="Denuncias" />} />
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

export default App;
