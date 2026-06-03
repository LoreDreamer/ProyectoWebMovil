import React from 'react';
import { IonIcon } from '@ionic/react';
import { checkmarkCircleOutline, lockClosedOutline, warningOutline, callOutline, alertCircleOutline } from 'ionicons/icons';
import './ComplaintTips.css';

export const ComplaintTips: React.FC = () => {
  return (
    <aside className="sidebar-container">
      {/* Cabecera Azul */}
      <div className="sidebar-header">
        <div className="header-title-row">
          <h2>ANTES DE REPORTAR</h2>
          <IonIcon icon={alertCircleOutline} className="header-alert-icon" />
        </div>
        <p>Recomendaciones clave para proteger tu información.</p>
      </div>

      {/* Lista de Recomendaciones */}
      <div className="sidebar-content">
        <div className="recommendation-item">
          <IonIcon icon={checkmarkCircleOutline} className="item-icon icon-green" />
          <p>No borres la evidencia (correos, capturas, enlaces).</p>
        </div>

        <div className="recommendation-item">
          <IonIcon icon={lockClosedOutline} className="item-icon icon-green" />
          <p>Cambia tus contraseñas si sospechas de un acceso indebido.</p>
        </div>

        <div className="recommendation-item">
          <IonIcon icon={warningOutline} className="item-icon icon-yellow" />
          <p>No respondas mensajes ni hagas clic en enlaces sospechosos.</p>
        </div>

        <div className="recommendation-item">
          <IonIcon icon={callOutline} className="item-icon icon-green" />
          <p>Contacta a la municipalidad si necesitas ayuda inmediata.</p>
        </div>
      </div>
    </aside>
  );
};