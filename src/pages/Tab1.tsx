import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import hi from '../assets/hi.png';
import './Tab1.css';

const Tab1: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="custom-toolbar">
          <IonTitle> 
            <div className="item">
              <img src={hi} alt="Logo" className="item-image" />
              <span className="item-text">Inicio</span>
              <span className="item-text">Alertas</span>
              <span className="item-text">Consejos</span>
              <span className="item-text">Normativa</span>
              <span className="rounded-box">Acceder</span>
            </div> 
          </IonTitle> 
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 1</IonTitle>
          </IonToolbar>
        </IonHeader>
        <ExploreContainer name="Tab 1 page" />
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
