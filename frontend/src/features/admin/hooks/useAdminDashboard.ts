import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/shared/api/apiClient';

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
  creado_en?: string;
  cuestionariosRespondidos?: number;
  cuestionarios_respondidos?: number;
  totalCuestionarios?: number;
  total_cuestionarios?: number;
  riesgo?: string;
  colorRiesgo?: string;
  color_riesgo?: string;
}

interface UsersApiResponse {
  ok?: boolean;
  users?: UsuarioBackend[];
  totalCuestionarios?: number;
  message?: string;
  error?: string;
}

interface MutateUserApiResponse {
  ok?: boolean;
  user?: UsuarioBackend;
  deletedId?: string;
  message?: string;
  error?: string;
}

export interface UsuarioRow {
  id: string;
  iniciales: string;
  nombre: string;
  email: string;
  region: string;
  comuna: string;
  estado: 'ACTIVO' | 'INACTIVO';
  estatus: 'activo' | 'inactivo';
  tipoUsuario: 'ADMIN' | 'USER';
  tipo_usuario: 'admin' | 'user';
  riesgo: 'ALTO' | 'MEDIO' | 'BAJO';
  colorRiesgo: string;
  cuestionariosRespondidos: number;
  totalCuestionarios: number;
}

export interface UsuarioUpdatePayload {
  nombre: string;
  email: string;
  region: string;
  comuna: string;
  estatus: 'activo' | 'inactivo';
  tipo_usuario: 'admin' | 'user';
}

interface DashboardCounts {
  complaints: number;
  protocols: number;
}

const RISK_COLORS: Record<UsuarioRow['riesgo'], string> = {
  ALTO: '#ef4444',
  MEDIO: '#f59e0b',
  BAJO: '#16a34a'
};

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

const normalizeStatus = (value?: string): UsuarioRow['estado'] => {
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

const normalizeRole = (value?: string): UsuarioRow['tipoUsuario'] => {
  const normalized = String(value || '').trim().toLowerCase();

  return normalized === 'admin' ? 'ADMIN' : 'USER';
};

const normalizeRisk = (value?: string): UsuarioRow['riesgo'] => {
  const normalized = String(value || '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (normalized === 'BAJO') return 'BAJO';
  if (normalized === 'MEDIO') return 'MEDIO';

  return 'ALTO';
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

const mapUserToRow = (usuario: UsuarioBackend, index = 0): UsuarioRow => {
  const nombre =
    usuario.nombre_completo ||
    usuario.name ||
    usuario.email ||
    usuario.correo ||
    'Usuario sin nombre';

  const estado = normalizeStatus(usuario.estado || usuario.estatus);
  const tipoUsuario = normalizeRole(usuario.role || usuario.tipo_usuario);
  const riesgo = normalizeRisk(usuario.riesgo);
  const cuestionariosRespondidos = Number(
    usuario.cuestionariosRespondidos ?? usuario.cuestionarios_respondidos ?? 0
  );
  const totalCuestionarios = Number(
    usuario.totalCuestionarios ?? usuario.total_cuestionarios ?? 0
  );

  return {
    id: String(usuario.id || index + 1),
    iniciales: getInitials(nombre),
    nombre,
    email: usuario.email || usuario.correo || 'Sin correo',
    region: usuario.region || '',
    comuna: usuario.comuna || '',
    estado,
    estatus: estado === 'ACTIVO' ? 'activo' : 'inactivo',
    tipoUsuario,
    tipo_usuario: tipoUsuario === 'ADMIN' ? 'admin' : 'user',
    riesgo,
    colorRiesgo: usuario.colorRiesgo || usuario.color_riesgo || RISK_COLORS[riesgo],
    cuestionariosRespondidos,
    totalCuestionarios
  };
};

export const useAdminDashboard = () => {
  const { user, token } = useAuth();

  const [usuarios, setUsuarios] = useState<UsuarioRow[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [usersSuccess, setUsersSuccess] = useState('');

  const [dashboardCounts, setDashboardCounts] = useState<DashboardCounts>({
    complaints: 0,
    protocols: 0
  });

  const [isLoadingDashboardCounts, setIsLoadingDashboardCounts] =
    useState(false);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    const headers: Record<string, string> = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }, [token]);

  const loadDashboardCounts = useCallback(async () => {
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
  }, [getAuthHeaders, token]);

  const loadUsers = useCallback(async () => {
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

      setUsuarios(usersFromApi.map(mapUserToRow));
    } catch (error: any) {
      console.error('Error al cargar usuarios:', error);
      setUsuarios([]);
      setUsersError(error.message || 'Error al cargar usuarios.');
    } finally {
      setIsLoadingUsers(false);
    }
  }, [getAuthHeaders, token]);

  const updateUsuario = useCallback(
    async (id: string, payload: UsuarioUpdatePayload) => {
      if (!token) {
        throw new Error('Sesión no válida. Inicia sesión nuevamente.');
      }

      try {
        setIsSavingUser(true);
        setUsersError('');
        setUsersSuccess('');

        const response = await fetch(`${API_URL}/api/auth/users/${id}`, {
          method: 'PUT',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            nombre_completo: payload.nombre,
            correo: payload.email,
            region: payload.region,
            comuna: payload.comuna,
            estatus: payload.estatus,
            tipo_usuario: payload.tipo_usuario
          })
        });

        const data: MutateUserApiResponse = await response
          .json()
          .catch(() => ({}));

        if (!response.ok || !data.user) {
          throw new Error(
            data.message || data.error || 'No se pudo actualizar el usuario.'
          );
        }

        const updatedUser = mapUserToRow(data.user);

        setUsuarios((currentUsers) =>
          currentUsers.map((usuario) =>
            usuario.id === id ? updatedUser : usuario
          )
        );

        setUsersSuccess('Usuario actualizado correctamente.');
        return updatedUser;
      } catch (error: any) {
        console.error('Error al actualizar usuario:', error);
        setUsersError(error.message || 'Error al actualizar usuario.');
        throw error;
      } finally {
        setIsSavingUser(false);
      }
    },
    [getAuthHeaders, token]
  );

  const deleteUsuario = useCallback(
    async (id: string) => {
      if (!token) {
        throw new Error('Sesión no válida. Inicia sesión nuevamente.');
      }

      try {
        setIsSavingUser(true);
        setUsersError('');
        setUsersSuccess('');

        const response = await fetch(`${API_URL}/api/auth/users/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });

        const data: MutateUserApiResponse = await response
          .json()
          .catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.message || data.error || 'No se pudo eliminar el usuario.'
          );
        }

        setUsuarios((currentUsers) =>
          currentUsers.filter((usuario) => usuario.id !== id)
        );

        setUsersSuccess('Usuario eliminado correctamente.');
      } catch (error: any) {
        console.error('Error al eliminar usuario:', error);
        setUsersError(error.message || 'Error al eliminar usuario.');
        throw error;
      } finally {
        setIsSavingUser(false);
      }
    },
    [getAuthHeaders, token]
  );

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
  }, [loadDashboardCounts, loadUsers]);

  const cantidadUsuariosActivos = usuarios.filter(
    (usuario) => usuario.estado === 'ACTIVO'
  ).length;

  const cantidadAdmins = usuarios.filter(
    (usuario) => usuario.tipoUsuario === 'ADMIN'
  ).length;

  return {
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
    loadUsers,
    updateUsuario,
    deleteUsuario
  };
};
