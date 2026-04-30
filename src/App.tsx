import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Index } from './pages/index';
import { LoginPage } from './pages/loginAdm';
import { RegisterPage } from './pages/registerPage';
import Tab3 from './pages/Tab3';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { Complaints } from './pages/complaints';

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
        <Route exact path="/index" component={Index} />
        <Route exact path="/login" component={LoginPage} />
        <Route exact path="/register" component={RegisterPage} />
        <Route exact path="/educacion" component={Tab3} />

        {/* Ruta temporal para probar la pantalla de Complaints sin afectar la navegación principal */}
        <Route exact path="/complaints-test" component={Complaints} />

        <Route exact path="/denuncias" render={() => <PlaceholderPage title="Denuncias" />} />
        <Route exact path="/cuestionarios" render={() => <PlaceholderPage title="Cuestionarios" />} />

        <Route exact path="/">
          <Redirect to="/index" />
        </Route>
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
