import React, { useMemo, useState } from 'react';
import { IonIcon, IonSearchbar } from '@ionic/react';
import {
  eyeOutline,
  createOutline,
  trashOutline,
  peopleOutline
} from 'ionicons/icons';
import './UserRow.css';

interface Usuario {
  id: string;
  iniciales: string;
  nombre: string;
  email: string;
  estado: string;
  tipoUsuario: string;
  riesgo: string;
  colorRiesgo: string;
}

interface UserRowProps {
  usuarios: Usuario[];
  isLoading?: boolean;
  error?: string;
}

export const UserRow: React.FC<UserRowProps> = ({
  usuarios,
  isLoading = false,
  error = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return usuarios;

    return usuarios.filter((user) => {
      return (
        user.nombre.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.estado.toLowerCase().includes(search) ||
        user.tipoUsuario.toLowerCase().includes(search) ||
        user.riesgo.toLowerCase().includes(search)
      );
    });
  }, [usuarios, searchTerm]);

  return (
    <section className="admin-table-container">
      <div className="admin-users-header">
        <div className="admin-users-title">
          <span className="admin-users-kicker">
            <IonIcon icon={peopleOutline} />
            Gestión de usuarios
          </span>

          <h2>Usuarios registrados</h2>

          <p>
            Lista de funcionarios y vecinos registrados en la plataforma.
          </p>
        </div>

        <div className="admin-users-search">
          <IonSearchbar
            value={searchTerm}
            placeholder="Buscar usuario..."
            className="admin-searchbar"
            mode="ios"
            onIonInput={(event) => setSearchTerm(event.detail.value || '')}
          />
        </div>
      </div>

      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Riesgo</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5}>
                  <div className="admin-table-state">
                    Cargando usuarios...
                  </div>
                </td>
              </tr>
            )}

            {!isLoading && error && (
              <tr>
                <td colSpan={5}>
                  <div className="admin-table-state admin-table-state-error">
                    {error}
                  </div>
                </td>
              </tr>
            )}

            {!isLoading && !error && filteredUsers.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <div className="admin-table-state">
                    No hay usuarios para mostrar.
                  </div>
                </td>
              </tr>
            )}

            {!isLoading &&
              !error &&
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
                    <span
                      className={`badge-tipo ${user.tipoUsuario.toLowerCase()}`}
                    >
                      {user.tipoUsuario}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`badge-estado ${user.estado.toLowerCase()}`}
                    >
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
                    <button type="button" aria-label="Ver usuario">
                      <IonIcon icon={eyeOutline} className="icon-view" />
                    </button>

                    <button type="button" aria-label="Editar usuario">
                      <IonIcon icon={createOutline} className="icon-edit" />
                    </button>

                    <button type="button" aria-label="Eliminar usuario">
                      <IonIcon icon={trashOutline} className="icon-delete" />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default UserRow;