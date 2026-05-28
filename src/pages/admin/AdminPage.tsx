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
  tipo_usuario?: 'admin' | 'user' | string;
  nombre_completo?: string;
  name?: string;
  rut?: string;
  region?: string;
  comuna?: string;
  estado?: string;
  estatus?: string;
  creado_en?: string | null;
}

interface UsersApiResponse {
  ok?: boolean;
  users?: UsuarioBackend[];
  message?: string;
  error?: string;
}

interface UsuarioRow {
  id: number;
  iniciales: string;
  nombre: string;
  email: string;
  estado: string;
  riesgo: string;
  colorRiesgo: string;
  tipoUsuario: string;
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

  const normalizeStatus = (status?: string) => {
    const normalized = String(status || 'activo')
      .trim()
      .toLowerCase();

    if (normalized === 'inactivo' || normalized === 'inactive') {
      return 'INACTIVO';
    }

    return 'ACTIVO';
  };

  const normalizeRole = (role?: string) => {
    const normalized = String(role || 'user')
      .trim()
      .toLowerCase();

    return normalized === 'admin' ? 'ADMIN' : 'USER';
  };

  const getRiskByIndex = (index: number) => {
    const riesgos = [
      { riesgo: 'ALTO', colorRiesgo: '#ff6b6b' },
      { riesgo: 'MEDIO', colorRiesgo: '#fcc419' },
      { riesgo: 'BAJO', colorRiesgo: '#51cf66' }
    ];

    return riesgos[index % riesgos.length];
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
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data: UsersApiResponse | UsuarioBackend[] = await response
        .json()
        .catch(() => []);

      if (!response.ok) {
        const errorData = data as UsersApiResponse;

        throw new Error(
          errorData?.message ||
            errorData?.error ||
            'No se pudieron cargar los usuarios'
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
          'Usuario sin nombre';

        const email =
          usuario.email ||
          usuario.correo ||
          'Sin correo';

        const estado = normalizeStatus(usuario.estado || usuario.estatus);
        const tipoUsuario = normalizeRole(usuario.role || usuario.tipo_usuario);

        return {
          id: index + 1,
          iniciales: getInitials(nombre),
          nombre,
          email,
          estado,
          riesgo: riskInfo.riesgo,
          colorRiesgo: riskInfo.colorRiesgo,
          tipoUsuario
        };
      });

      setUsuarios(mappedUsers);
    } catch (error: any) {
      console.error('Error al cargar usuarios:', error);
      setUsersError(error.message || 'Error al cargar usuarios');
      setUsuarios([]);
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

  return (
    <IonPage>
      <Navbar />

      <IonContent className="admin-container">
        <div className="admin-content-wrapper">
          <header className="admin-header">
            <h1>PANEL DE ADMINISTRACIÓN</h1>
            <p>Gestiona usuarios, riesgo municipal, denuncias y publicaciones.</p>

            {user && (
              <div className="admin-profile-summary">
                <div>
                  <strong>Administrador</strong>
                  <span>{user.nombre_completo || user.name || 'Administrador'}</span>
                </div>

                <div>
                  <strong>RUT</strong>
                  <span>{user.rut || 'Sin RUT'}</span>
                </div>

                <div>
                  <strong>Ubicación</strong>
                  <span>
                    {user.comuna || 'Sin comuna'}, {user.region || 'Sin región'}
                  </span>
                </div>

                <div>
                  <strong>Correo</strong>
                  <span>{user.email || user.correo}</span>
                </div>
              </div>
            )}
          </header>

          <div className="stats-grid">
            <StatCardAdmin
              icon={documentTextOutline}
              title="Usuarios Registrados"
              value={String(usuarios.length)}
              label={`${cantidadUsuariosActivos} activos`}
            />

            <StatCardAdmin
              icon={warningOutline}
              title="Riesgo Promedio"
              value="Medio"
              label="Datos de prueba"
            />

            <StatCardAdmin
              icon={mailOutline}
              title="Denuncias Recibidas"
              value="27"
              label="+3 sin atender"
            />

            <StatCardAdmin
              icon={checkmarkCircleOutline}
              title="Protocolos Publicados"
              value="27"
              label="2 nuevos"
            />
          </div>

          {isLoadingUsers && <p>Cargando usuarios registrados...</p>}

          {usersError && (
            <p style={{ color: '#c92a2a', fontWeight: 600 }}>
              {usersError}
            </p>
          )}

          <UserRow usuarios={usuarios} />

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