import React, { useEffect, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import {
  documentTextOutline,
  warningOutline,
  mailOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';
import {
  StatCardAdmin,
  Navbar,
  UserRow,
  Footer,
  ActivityPanel
} from '../../components';
import { useAuth } from '../../context/AuthContext';
import './AdminPage.css';

interface UsuarioBackend {
  id: string;
  email?: string;
  correo?: string;
  role?: 'admin' | 'user';
  tipo_usuario?: 'admin' | 'user';
  nombre_completo?: string;
  name?: string;
  rut?: string;
  region?: string;
  comuna?: string;
  estado?: string;
  estatus?: string;
  created_at?: string;
}

interface UsersApiResponse {
  ok?: boolean;
  users?: UsuarioBackend[];
  message?: string;
  error?: string;
}

interface UsuarioRow {
  id: string;
  iniciales: string;
  nombre: string;
  email: string;
  estado: string;
  tipoUsuario: string;
  riesgo: string;
  colorRiesgo: string;
}

const API_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export const AdminPage: React.FC = () => {
  const { user, token } = useAuth();

  const [usuarios, setUsuarios] = useState<UsuarioRow[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState('');

  const getInitials = (name: string) => {
    const initials = name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();

    return initials || 'US';
  };

  const getRiskByIndex = (index: number) => {
    const riesgos = [
      { riesgo: 'BAJO', colorRiesgo: '#16a34a' },
      { riesgo: 'MEDIO', colorRiesgo: '#f59e0b' },
      { riesgo: 'ALTO', colorRiesgo: '#ef4444' }
    ];

    return riesgos[index % riesgos.length];
  };

  const normalizeStatus = (value?: string) => {
    const normalized = String(value || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    if (normalized === 'inactivo' || normalized === 'inactive') {
      return 'INACTIVO';
    }

    return 'ACTIVO';
  };

  const normalizeRole = (value?: string) => {
    const normalized = String(value || '')
      .trim()
      .toLowerCase();

    return normalized === 'admin' ? 'ADMIN' : 'USER';
  };

  const loadUsers = async () => {
    if (!token) {
      setUsuarios([]);
      return;
    }

    try {
      setIsLoadingUsers(true);
      setUsersError('');

      const response = await fetch(`${API_URL}/api/auth/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data: UsersApiResponse | UsuarioBackend[] = await response
        .json()
        .catch(() => []);

      if (!response.ok) {
        throw new Error(
          !Array.isArray(data)
            ? data.message || data.error || 'No se pudieron cargar los usuarios'
            : 'No se pudieron cargar los usuarios'
        );
      }

      const usersFromApi = Array.isArray(data)
        ? data
        : Array.isArray(data.users)
          ? data.users
          : [];

      const mappedUsers: UsuarioRow[] = usersFromApi.map((usuario, index) => {
        const riskInfo = getRiskByIndex(index);

        const nombre =
          usuario.nombre_completo ||
          usuario.name ||
          usuario.email ||
          usuario.correo ||
          'Usuario sin nombre';

        return {
          id: String(usuario.id || index + 1),
          iniciales: getInitials(nombre),
          nombre,
          email: usuario.email || usuario.correo || 'Sin correo',
          estado: normalizeStatus(usuario.estado || usuario.estatus),
          tipoUsuario: normalizeRole(usuario.role || usuario.tipo_usuario),
          riesgo: riskInfo.riesgo,
          colorRiesgo: riskInfo.colorRiesgo
        };
      });

      setUsuarios(mappedUsers);
    } catch (error: any) {
      console.error('Error al cargar usuarios:', error);
      setUsuarios([]);
      setUsersError(error.message || 'Error al cargar usuarios.');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [token]);

  const cantidadUsuariosActivos = usuarios.filter(
    (usuario) => usuario.estado === 'ACTIVO'
  ).length;

  const cantidadAdmins = usuarios.filter(
    (usuario) => usuario.tipoUsuario === 'ADMIN'
  ).length;

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
              icon={documentTextOutline}
              title="Usuarios registrados"
              value={isLoadingUsers ? '...' : usuarios.length}
              label={`${cantidadUsuariosActivos} activos`}
            />

            <StatCardAdmin
              icon={warningOutline}
              title="Riesgo promedio"
              value="Medio"
              label="Datos de prueba"
              variant="warning"
            />

            <StatCardAdmin
              icon={mailOutline}
              title="Denuncias recibidas"
              value="27"
              label="+3 sin atender"
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
            error={usersError}
          />

          <div className="forms-container-grid">
            <ActivityPanel />
          </div>
        </div>

        <Footer />
      </IonContent>
    </IonPage>
  );
};

export default AdminPage;