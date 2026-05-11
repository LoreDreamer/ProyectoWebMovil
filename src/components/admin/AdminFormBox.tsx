import React from 'react';
import { IonItem, IonLabel, IonInput, IonTextarea, IonButton, IonIcon } from '@ionic/react';
import { addOutline } from 'ionicons/icons';
import './AdminFormBox.css';

interface AdminFormBoxProps {
  type: 'actividad' | 'protocolo';
  title: string;
  subtitle: string;
}

export const AdminFormBox: React.FC<AdminFormBoxProps> = ({ type, title, subtitle }) => {
  return (
    <div className="admin-form-card">
      <div className="form-header-inline">
        <div className="icon-square">
          <IonIcon icon={addOutline} />
        </div>
        <div className="header-text-container">
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>

      <form className="admin-form-body">
        <div className="form-group">
          <label>Título</label>
          <input type="text" placeholder="Capacitación: gestión segura de correos" className="custom-input" />
        </div>

        <div className="form-group">
          <label>Descripción</label>
          {type === 'actividad' ? (
            <textarea placeholder="Detalla la actividad para los usuarios" className="custom-textarea" rows={5} />
          ) : (
            <input type="text" placeholder="Detalla el protocolo" className="custom-input" />
          )}
        </div>

        {/* Campo condicional: Fecha para actividad o Archivo para protocolo */}
        {type === 'actividad' ? (
          <div className="form-group">
            <label>Fecha</label>
            <input type="text" placeholder="dd-mm-aa" className="custom-input small-input" />
          </div>
        ) : (
          <div className="form-group">
            <label>Adjuntar Archivo</label>
            <div className="file-drop-zone">
              {/* Aquí iría la lógica de input file */}
            </div>
          </div>
        )}

        <div className="form-footer">
          <button type="submit" className="btn-submit">
            {type === 'actividad' ? 'PUBLICAR ACTIVIDAD' : 'PUBLICAR PROTOCOLO'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminFormBox;