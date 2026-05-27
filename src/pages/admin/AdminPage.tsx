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
  email: string;
  role: 'admin' | 'user';
  nombre_completo: string;
  rut: string;
  region: string;
  comuna: string;
  estado: 'ACTIVO' | 'INACTIVO';
  created_at: string;
}

interface UsuarioRow {
  id: number;
  iniciales: string;
  nombre: string;
  email: string;
  estado: string;
  riesgo: string;
  colorRiesgo: string;
}

export const AdminPage: React.FC = () => {
  const { user, token } = useAuth();

  const [usuarios, setUsuarios] = useState<UsuarioRow[]>([]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
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
    if (!token) return;

    try {
      const response = await fetch('http://localhost:3000/api/auth/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('No se pudieron cargar los usuarios');
      }

      const data: UsuarioBackend[] = await response.json();

      const mappedUsers: UsuarioRow[] = data.map((usuario, index) => {
        const riskInfo = getRiskByIndex(index);

        return {
          id: index + 1,
          iniciales: getInitials(usuario.nombre_completo),
          nombre: usuario.nombre_completo,
          email: usuario.email,
          estado: usuario.estado,
          riesgo: riskInfo.riesgo,
          colorRiesgo: riskInfo.colorRiesgo
        };
      });

      setUsuarios(mappedUsers);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setUsuarios([]);
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
                  <span>{user.nombre_completo}</span>
                </div>

                <div>
                  <strong>RUT</strong>
                  <span>{user.rut}</span>
                </div>

                <div>
                  <strong>Ubicación</strong>
                  <span>
                    {user.comuna}, {user.region}
                  </span>
                </div>

                <div>
                  <strong>Correo</strong>
                  <span>{user.email}</span>
                </div>
              </div>
            )}
          </header>

          <div className="stats-grid">
            <StatCardAdmin
              icon={documentTextOutline}
              title="Usuarios Evaluados"
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