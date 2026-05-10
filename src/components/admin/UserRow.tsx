import React from 'react';
import { IonIcon, IonSearchbar, IonButton } from '@ionic/react';
import { eyeOutline, createOutline, trashOutline } from 'ionicons/icons';
import './UserRow.css';

interface UserRowProps {
  usuarios: Array<{
    id: number;
    iniciales: string;
    nombre: string;
    email: string;
    estado: string;
    riesgo: string;
    colorRiesgo: string;
  }>;
}

export const UserRow: React.FC<UserRowProps> = ({ usuarios }) => {
  return (
    <div className="admin-table-container">
      <div className="table-header">
        <div className="table-title">
          <h2>USUARIOS REGISTRADOS</h2>
          <p>Lista de funcionarios y vecinos con su nivel de riesgo.</p>
        </div>
        <div className="table-search">
          {/* El wrapper es la clave para que el botón no se baje */}
          <div className="search-wrapper">
            <IonSearchbar 
              placeholder="Buscar usuario..." 
              className="admin-searchbar"
              mode="ios"
            ></IonSearchbar>
            <IonButton className="btn-buscar-tabla">Buscar</IonButton>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>NOMBRE</th>
              <th>ESTADO</th>
              <th>RIESGO</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar">{user.iniciales}</div>
                    <div className="user-data">
                      <span className="user-name">{user.nombre}</span>
                      <span className="user-email">{user.email}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`badge-estado ${user.estado.toLowerCase()}`}>
                    {user.estado}
                  </span>
                </td>
                <td>
                  <span className="badge-riesgo" style={{ backgroundColor: user.colorRiesgo }}>
                    {user.riesgo}
                  </span>
                </td>
                <td className="actions-cell">
                  <IonIcon icon={eyeOutline} className="icon-view" />
                  <IonIcon icon={createOutline} className="icon-edit" />
                  <IonIcon icon={trashOutline} className="icon-delete" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserRow;