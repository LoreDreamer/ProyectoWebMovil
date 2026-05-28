import React, { useState } from 'react';
import { IonIcon, IonSearchbar, IonButton } from '@ionic/react';
import { eyeOutline, createOutline, trashOutline } from 'ionicons/icons';
import './UserRow.css';

interface UserRowItem {
  id: number;
  iniciales: string;
  nombre: string;
  email: string;
  estado: string;
  riesgo: string;
  colorRiesgo: string;
  tipoUsuario?: string;
}

interface UserRowProps {
  usuarios: UserRowItem[];
}

export const UserRow: React.FC<UserRowProps> = ({ usuarios }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = usuarios.filter((user) => {
    const search = searchTerm.toLowerCase();

    return (
      user.nombre.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      user.estado.toLowerCase().includes(search) ||
      user.riesgo.toLowerCase().includes(search) ||
      (user.tipoUsuario || '').toLowerCase().includes(search)
    );
  });

  return (
    <div className="admin-table-container">
      <div className="table-header">
        <div className="table-title">
          <h2>USUARIOS REGISTRADOS</h2>
          <p>
            Lista de usuarios registrados en la plataforma, incluyendo vecinos y administradores.
          </p>
        </div>

        <div className="table-search">
          <div className="search-wrapper">
            <IonSearchbar
              value={searchTerm}
              placeholder="Buscar usuario..."
              className="admin-searchbar"
              mode="ios"
              onIonChange={(e) => setSearchTerm(e.detail.value || '')}
            />

            <IonButton className="btn-buscar-tabla">
              Buscar
            </IonButton>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>NOMBRE</th>
              <th>TIPO</th>
              <th>ESTADO</th>
              <th>RIESGO</th>
              <th>ACCIONES</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  No hay usuarios registrados para mostrar.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
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
                    <span className="badge-estado">
                      {user.tipoUsuario || 'USER'}
                    </span>
                  </td>

                  <td>
                    <span className={`badge-estado ${user.estado.toLowerCase()}`}>
                      {user.estado}
                    </span>
                  </td>

                  <td>
                    <span
                      className="badge-riesgo"
                      style={{ backgroundColor: user.colorRiesgo }}
                    >
                      {user.riesgo}
                    </span>
                  </td>

                  <td className="actions-cell">
                    <IonIcon icon={eyeOutline} className="icon-view" />
                    <IonIcon icon={createOutline} className="icon-edit" />
                    <IonIcon icon={trashOutline} className="icon-delete" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserRow;