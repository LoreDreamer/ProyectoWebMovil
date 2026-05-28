import React, { useEffect, useState } from 'react';
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

interface DashboardCounts {
  complaints: number;
  protocols: number;
}

const API_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export const AdminPage: React.FC = () => {
  const { user, token } = useAuth();

  const [usuarios, setUsuarios] = useState<UsuarioRow[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState('');

  const [dashboardCounts, setDashboardCounts] = useState<DashboardCounts>({
    complaints: 0,
    protocols: 0
  });

  const [isLoadingDashboardCounts, setIsLoadingDashboardCounts] =
    useState(false);

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
    const normalized = String(value || '').trim().toLowerCase();

    return normalized === 'admin' ? 'ADMIN' : 'USER';
  };

  const getArrayCount = (data: any, possibleKeys: string[] = []) => {
    if (Array.isArray(data)) return data.length;

    for (const key of possibleKeys) {
      if (Array.isArray(data?.[key])) {
        return data[key].length;
      }
    }

    if (typeof data?.count === 'number') return data.count;
    if (typeof data?.total === 'number') return data.total;

    return 0;
  };

  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  };

  const loadDashboardCounts = async () => {
    if (!token) {
      setDashboardCounts({
        complaints: 0,
        protocols: 0
      });

      return;
    }

    try {
      setIsLoadingDashboardCounts(true);

      const headers = getAuthHeaders();

      const [complaintsResponse, protocolsResponse] = await Promise.all([
        fetch(`${API_URL}/api/denuncias`, {
          method: 'GET',
          headers
        }),
        fetch(`${API_URL}/api/protocolos`, {
          method: 'GET',
          headers
        })
      ]);

      const [complaintsData, protocolsData] = await Promise.all([
        complaintsResponse.json().catch(() => null),
        protocolsResponse.json().catch(() => null)
      ]);

      if (!complaintsResponse.ok) {
        console.error('No se pudieron cargar denuncias:', complaintsData);
      }

      if (!protocolsResponse.ok) {
        console.error('No se pudieron cargar protocolos:', protocolsData);
      }

      setDashboardCounts({
        complaints: complaintsResponse.ok
          ? getArrayCount(complaintsData, ['complaints', 'denuncias', 'data'])
          : 0,
        protocols: protocolsResponse.ok
          ? getArrayCount(protocolsData, ['protocols', 'protocolos', 'data'])
          : 0
      });
    } catch (error) {
      console.error('Error al cargar contadores del panel admin:', error);

      setDashboardCounts({
        complaints: 0,
        protocols: 0
      });
    } finally {
      setIsLoadingDashboardCounts(false);
    }
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
        headers: getAuthHeaders()
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
    loadDashboardCounts();

    const refreshDashboardCounts = () => loadDashboardCounts();

    window.addEventListener('complaints-updated', refreshDashboardCounts);
    window.addEventListener('protocolos-updated', refreshDashboardCounts);

    return () => {
      window.removeEventListener('complaints-updated', refreshDashboardCounts);
      window.removeEventListener('protocolos-updated', refreshDashboardCounts);
    };
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