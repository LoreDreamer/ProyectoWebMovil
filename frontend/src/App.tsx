import React from 'react';
import { setupIonicReact } from '@ionic/react';
import { AuthProvider } from './context/AuthContext';
import { AppRoutes } from './app/AppRoutes';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

import './global.css';
import './features/admin/styles/adminPanels.css';
import './theme/variables.css';
import './responsive.css';
import './shared/notifications/notifications.css';

setupIonicReact();

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
