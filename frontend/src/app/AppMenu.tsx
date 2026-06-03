import React from 'react';
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import {
  alertCircleOutline,
  bookOutline,
  documentTextOutline,
  homeOutline,
  notificationsOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';
import { useAuth } from '@/context/AuthContext';

const closeMenu = () => {
  const menu = document.querySelector('ion-menu') as HTMLIonMenuElement | null;
  if (menu) menu.close();
};

export const AppMenu: React.FC = () => {
  const { user } = useAuth();

  return (
    <IonMenu contentId="main-content" type="overlay" swipeGesture={false}>
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
  );
};
