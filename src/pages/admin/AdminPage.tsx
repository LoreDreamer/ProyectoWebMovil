import React from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { 
  documentTextOutline, 
  warningOutline, 
  mailOutline, 
  checkmarkCircleOutline 
} from 'ionicons/icons';
import { StatCardAdmin, Navbar, UserRow, AdminFormBox, Footer } from '../../components';
import './AdminPage.css';

export const AdminPage: React.FC = () => {

  // Ejemplos de usuarios para la tabla (Controlados desde aquí)
  const usuariosEjemplo = [
    { id: 1, iniciales: 'MG', nombre: 'María Gonzales', email: 'maria.gonzalez@santodomingo.cl', estado: 'ACTIVO', riesgo: 'ALTO', colorRiesgo: '#ff6b6b' },
    { id: 2, iniciales: 'PS', nombre: 'Pedro Soto', email: 'pedro.soto@santodomingo.cl', estado: 'INACTIVO', riesgo: 'BAJO', colorRiesgo: '#51cf66' },
    { id: 3, iniciales: 'AR', nombre: 'Ana Reyes', email: 'ana.reyes@santodomingo.cl', estado: 'ACTIVO', riesgo: 'MEDIO', colorRiesgo: '#fcc419' },
    { id: 4, iniciales: 'LP', nombre: 'Luis Pérez', email: 'luis.perez@santodomingo.cl', estado: 'ACTIVO', riesgo: 'ALTO', colorRiesgo: '#ff6b6b' },
  ];

  return (
    <IonPage>
      <Navbar />
      <IonContent className="admin-container">
        <div className="admin-content-wrapper">
          
          <header className="admin-header">
            <h1>PANEL DE ADMINISTRACIÓN</h1>
            <p>Gestiona usuarios, riesgo municipal, denuncias y publicaciones.</p>
          </header>

          {/* 1. Sección de Estadísticas */}
          <div className="stats-grid">
            <StatCardAdmin icon={documentTextOutline} title="Usuarios Evaluados" value="3" label="+8 Semanales" />
            <StatCardAdmin icon={warningOutline} title="Riesgo Promedio" value="Medio" label="Mejorando" />
            <StatCardAdmin icon={mailOutline} title="Denuncias Recibidas" value="27" label="+3 Sin Atender" />
            <StatCardAdmin icon={checkmarkCircleOutline} title="Protocolos Publicados" value="27" label="2 Nuevos" />
          </div>

          {/* 2. Sección de Tabla de Usuarios */}
          <UserRow usuarios={usuariosEjemplo} />

          {/* 3. Sección de Formularios (Lado a lado) */}
          <div className="forms-container-grid">
            <AdminFormBox 
              type="actividad"
              title="Publicar Actividad"
              subtitle="Comunica un evento, capacitación o noticia."
            />
            <AdminFormBox 
              type="protocolo"
              title="Publicar Protocolo"
              subtitle="Publica nuevos documentos."
            />
          </div>
            
          </div>
          
          <Footer className="admin-footer-spacer" />
          
        </IonContent>
    </IonPage>
  );
};

export default AdminPage;