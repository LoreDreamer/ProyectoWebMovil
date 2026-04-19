import React from 'react';
import { IonHeader, IonToolbar, IonButton, IonRouterLink } from '@ionic/react';
import logo from '../assets/4-isologo-municipal-fondocalipso-rgb.png';

const Navbar: React.FC = () => {
  return (
    <IonHeader>
      <IonToolbar style={{
        '--background': '#ffffff',
        '--color': '#000000',
        height: '100px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center'}}  >
            <img src={logo} alt="Logo" style={{ 
                height: '80px', 
                marginRight: '30px', 
                marginLeft: '10px', 
                marginTop: '30px', 
                marginBottom: '30px'}} 
                />
            <IonRouterLink routerLink="/index">
              <IonButton fill="clear" color="dark">INICIO</IonButton>
            </IonRouterLink>
            <IonRouterLink routerLink="/loginAdm">
              <IonButton fill="clear" color="dark">INICIAR SESIÓN</IonButton>
            </IonRouterLink>
            <IonRouterLink routerLink="/tab3">
              <IonButton fill="clear" color="dark">INFORMACIÓN</IonButton>
            </IonRouterLink>
            <IonButton fill="clear" color="dark">SALIR</IonButton>
            <IonButton fill="clear" color="dark">CONTACTO</IonButton>
        </div>
      </IonToolbar>
    </IonHeader>
  );
};

export default Navbar;