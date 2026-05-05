import './Advice.css';
import { bulbOutline } from 'ionicons/icons';
import { IonIcon } from '@ionic/react';

const WeeklyTip: React.FC = () => {
  return (
    <div className="tip-banner">
      <div className="tip-content">
        <h3>CONSEJO DE LA SEMANA</h3>
        <p>Antes de hacer clic, verifica el remitente y pasa el cursor sobre el enlace para revisar su destino. Si tienes dudas, consulta con el equipo TIC municipal.</p>
      </div>
      <div className="tip-icon">
        <IonIcon icon={bulbOutline} />
      </div>
    </div>
  );
};

export default WeeklyTip;