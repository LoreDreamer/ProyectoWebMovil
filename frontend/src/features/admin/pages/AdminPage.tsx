import React from 'react';
import { IonContent, IonPage } from '@ionic/react';
import {
  documentTextOutline,
  warningOutline,
  peopleOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';
import {
  StatCardAdmin,
  Navbar,
  UserRow,
  Footer,
  ActivityPanel
} from '@/components';
import { AdminComplaintsPanel } from '@/features/admin/components/AdminComplaintsPanel';
import { useAdminDashboard } from '@/features/admin/hooks/useAdminDashboard';
import './AdminPage.css';

export const AdminPage: React.FC = () => {
  const {
    user,
    usuarios,
    usersError,
    usersSuccess,
    isLoadingUsers,
    isSavingUser,
    dashboardCounts,
    isLoadingDashboardCounts,
    cantidadUsuariosActivos,
    cantidadAdmins,
    updateUsuario,
    deleteUsuario
  } = useAdminDashboard();

  return (
    <IonPage>
      <Navbar />

      <IonContent className="admin-container">
        <div className="admin-content-wrapper">
          <header className="admin-header">
            <span className="admin-kicker">Panel municipal</span>

            <h1>Panel de administración</h1>

            <p>
              Gestiona usuarios, revisa estadísticas generales y administra el
              contenido publicado en la plataforma.
            </p>

            {user && (
              <div className="admin-profile-summary">
                <div>
                  <strong>Administrador</strong>
                  <span>
                    {user.nombre_completo || user.name || 'Administrador'}
                  </span>
                </div>

                <div>
                  <strong>RUT</strong>
                  <span>{user.rut || 'No registrado'}</span>
                </div>

                <div>
                  <strong>Ubicación</strong>
                  <span>
                    {user.comuna || 'Comuna'}, {user.region || 'Región'}
                  </span>
                </div>

                <div>
                  <strong>Correo</strong>
                  <span>{user.email || user.correo || 'Sin correo'}</span>
                </div>
              </div>
            )}
          </header>

          <div className="admin-stats-grid">
            <StatCardAdmin
              icon={peopleOutline}
              title="Usuarios registrados"
              value={isLoadingUsers ? '...' : usuarios.length}
              label={`${cantidadUsuariosActivos} activos`}
            />

            <StatCardAdmin
              icon={warningOutline}
              title="Denuncias recibidas"
              value={
                isLoadingDashboardCounts
                  ? '...'
                  : dashboardCounts.complaints
              }
              label="Total recibidas"
              variant="warning"
            />

            <StatCardAdmin
              icon={documentTextOutline}
              title="Protocolos publicados"
              value={
                isLoadingDashboardCounts
                  ? '...'
                  : dashboardCounts.protocols
              }
              label="Documentos activos"
            />

            <StatCardAdmin
              icon={checkmarkCircleOutline}
              title="Administradores"
              value={isLoadingUsers ? '...' : cantidadAdmins}
              label="Cuentas admin"
              variant="success"
            />
          </div>

          <UserRow
            usuarios={usuarios}
            isLoading={isLoadingUsers}
            isSaving={isSavingUser}
            error={usersError}
            success={usersSuccess}
            onUpdateUser={updateUsuario}
            onDeleteUser={deleteUsuario}
          />

          <div className="forms-container-grid">
            <AdminComplaintsPanel />
            <ActivityPanel />
          </div>
        </div>

        <Footer />
      </IonContent>
    </IonPage>
  );
};

export default AdminPage;