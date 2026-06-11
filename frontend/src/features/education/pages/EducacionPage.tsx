import React, { useEffect, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import {
  Navbar,
  EducationCard,
  Advice,
  Footer,
  EducationPanel
} from '@/components';
import { useAuth } from '@/context/AuthContext';
import pishing from '@/assets/education/pishing.webp';

import './EducationPage.css';
import { API_URL } from '@/shared/api/apiClient';
import { notify } from '@/shared/notifications';
import { ContentState } from '@/shared/components/states/ContentState';

type EducationStatus = 'Completado' | 'Pendiente';

export interface EducationModule {
  id: string;
  title?: string;
  titulo?: string;
  description?: string;
  resumen?: string;
  body?: string;
  cuerpo?: string;
  category?: string;
  tipo_educacion?: string;
  duration?: string;
  level?: string;
  nivel?: string;
  image?: string;
  cover_img?: string;
  createdAt?: string | null;
  status?: EducationStatus;
  estatus?: string;
  
  // Soporte para archivos adjuntos y arreglos de imágenes multimedia
  fileUrl?: string;
  archivo_url?: string;
  fileName?: string;
  archivo_nombre?: string;
  fileType?: string;
  archivo_tipo?: string;
  imagenes?: any[];
  images?: any[];
}

interface EducationProgressItem {
  educacion_id?: string;
  educacionId?: string;
  educationId?: string;
}

interface EducationProgressResponse {
  ok?: boolean;
  progreso?: EducationProgressItem[];
  progress?: EducationProgressItem[];
  completados?: string[];
  completedIds?: string[];
}


const normalizeDifficultyLabel = (value?: string) => {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (normalized === 'facil' || normalized === 'basico' || normalized === 'basica') {
    return 'Básico';
  }
  if (normalized === 'dificil' || normalized === 'avanzado' || normalized === 'avanzada') {
    return 'Avanzado';
  }
  return 'Intermedio';
};

const normalizeStatus = (value?: string): EducationStatus => {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (normalized === 'completado' || normalized === 'completo' || normalized === 'finalizado') {
    return 'Completado';
  }
  return 'Pendiente';
};

const getEducationCompletedIds = (progressData: EducationProgressResponse | null) => {
  if (!progressData) return [];

  if (Array.isArray(progressData.completedIds)) {
    return progressData.completedIds.map(String);
  }
  if (Array.isArray(progressData.completados)) {
    return progressData.completados.map(String);
  }

  const progressItems = Array.isArray(progressData.progreso)
    ? progressData.progreso
    : Array.isArray(progressData.progress)
      ? progressData.progress
      : [];

  return progressItems
    .map((item) => item.educacion_id || item.educacionId || item.educationId)
    .filter(Boolean)
    .map(String);
};

export const EducationPage: React.FC = () => {
  const { user, token } = useAuth();
  const history = useHistory();
  const isAdmin = user?.role === 'admin';

  const [modules, setModules] = useState<EducationModule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  const obtenerCabeceras = (): Record<string, string> => {
    const cabeceras: Record<string, string> = {};
    if (token) {
      cabeceras.Authorization = `Bearer ${token}`;
    }
    return cabeceras;
  };

  const buildFileUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) {
      return url;
    }
    if (url.startsWith('/')) return `${API_URL}${url}`;
    return `${API_URL}/${url}`;
  };

  const normalizeBackendModule = (module: EducationModule): EducationModule => {
    const rawImage = module.image || module.cover_img || '';

    return {
      id: String(module.id),
      title: module.title || module.titulo || 'Módulo educativo',
      description: module.description || module.resumen || '',
      body: module.body || module.cuerpo || module.description || module.resumen || '',
      category: module.category || module.tipo_educacion || 'Seguridad',
      duration: module.duration || '10 min',
      level: module.level || normalizeDifficultyLabel(module.nivel),
      image: rawImage ? buildFileUrl(rawImage) : pishing,
      createdAt: module.createdAt || null,
      status: normalizeStatus(module.status || module.estatus),
      
      // Mapeo nativo de los archivos adjuntos multimedia
      fileUrl: module.fileUrl || module.archivo_url ? buildFileUrl(module.fileUrl || module.archivo_url) : undefined,
      fileName: module.fileName || module.archivo_nombre,
      fileType: module.fileType || module.archivo_tipo,
      images: module.images || module.imagenes || []
    };
  };

  const loadEducationModules = async () => {
    try {
      setIsLoading(true);
      setLoadError('');

      const modulesRequest = fetch(`${API_URL}/api/education`);
      const progressRequest = token
        ? fetch(`${API_URL}/api/education/progress/me`, { headers: obtenerCabeceras() })
        : Promise.resolve(null);

      const [modulesResponse, progressResponse] = await Promise.all([
        modulesRequest,
        progressRequest
      ]);

      const modulesData = await modulesResponse.json().catch(() => null);

      if (!modulesResponse.ok) {
        throw new Error(
          modulesData?.message ||
            modulesData?.error ||
            'No se pudieron cargar los módulos educativos'
        );
      }
      let completedIds: string[] = [];

      if (progressResponse && progressResponse.ok) {
        const progressData: EducationProgressResponse = await progressResponse.json().catch(() => null);
        completedIds = getEducationCompletedIds(progressData);
      }

      const backendModules: EducationModule[] = Array.isArray(modulesData)
        ? modulesData.map((module) => {
            const normalized = normalizeBackendModule(module);
            return {
              ...normalized,
              status: completedIds.includes(String(normalized.id)) ? 'Completado' : 'Pendiente'
            };
          })
        : [];

      setModules(backendModules);
    } catch (error: any) {
      console.error('Error al cargar módulos educativos:', error);
      setLoadError(error?.message || 'No se pudieron cargar los módulos educativos.');
      setModules([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEducationModules();

    const handler = () => loadEducationModules();
    window.addEventListener('education-updated', handler);

    return () => {
      window.removeEventListener('education-updated', handler);
    };
  }, [token]);

  const completedModules = modules.filter((module) => module.status === 'Completado');
  const availableModules = modules.filter((module) => module.status !== 'Completado');

  const handleCardClick = (module: EducationModule) => {
    if (!user) {
      notify.warning('Debes iniciar sesión para acceder a los módulos');
    } else {
      history.push(`/educacion/modulo/${module.id}`, { module });
    }
  };

  return (
    <IonPage>
      <Navbar />
      <IonContent className="education-content-page">
        <div className="education-shell">
          <header className="education-hero-section">
            <span className="education-kicker">Formación en ciberseguridad</span>
            <h1>Aprende sobre seguridad digital</h1>
            <p>
              Revisa módulos breves y prácticos para fortalecer tus hábitos
              digitales, proteger tus datos y prevenir riesgos en línea.
            </p>
          </header>

          {isAdmin && (
            <section className="education-admin-section">
              <EducationPanel />
            </section>
          )}

          <section className="education-section advice-section">
            <div className="education-section-header">
              <div>
                <span className="section-eyebrow">Consejos rápidos</span>
                <h2>Recomendaciones para navegar seguro</h2>
                <p>
                  Antes de comenzar un módulo, revisa estos consejos básicos
                  para mejorar tu seguridad digital diaria.
                </p>
              </div>
            </div>
            <Advice />
          </section>

          {/* SECCIÓN MÓDULOS COMPLETADOS */}
          {completedModules.length > 0 && (
            <section className="education-section completed-education-section">
              <div className="education-section-header">
                <div>
                  <span className="section-eyebrow">Completados</span>
                  <h2>Módulos educativos completados</h2>
                  <p>Aquí puedes revisar los módulos educativos que ya visitaste.</p>
                </div>
                <div className="education-count-card">
                  <span>Completados</span>
                  <strong>{completedModules.length}</strong>
                </div>
              </div>

              <div className="cards-grid">
                {completedModules.map((module) => (
                  <div key={module.id} onClick={() => handleCardClick(module)} style={{ cursor: 'pointer' }}>
                    <EducationCard
                      title={module.title || 'Módulo educativo'}
                      description={module.description || ''}
                      tag={module.category || 'Seguridad'}
                      time={module.duration || '10 min'}
                      level={module.level || 'Intermedio'}
                      image={module.image || pishing}
                      status="Completado"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* SECCIÓN MÓDULOS DISPONIBLES */}
          <section className="education-section" id="modulos-educativos">
            <div className="education-section-header">
              <div>
                <span className="section-eyebrow">Disponibles</span>
                <h2>Módulos educativos disponibles</h2>
                <p>
                  Selecciona un módulo para aprender sobre phishing, privacidad,
                  redes seguras, VPNs y buenas prácticas digitales.
                </p>
              </div>
              <div className="education-count-card">
                <span>Pendientes</span>
                <strong>{availableModules.length}</strong>
              </div>
            </div>

            {isLoading ? (
              <ContentState
                variant="loading"
                title="Cargando módulos educativos"
                message="Estamos obteniendo los contenidos disponibles."
              />
            ) : loadError ? (
              <ContentState
                variant="error"
                title="No se pudieron cargar los módulos"
                message={loadError}
                actionLabel="Intentar nuevamente"
                onAction={loadEducationModules}
              />
            ) : availableModules.length === 0 ? (
              <ContentState
                variant="empty"
                title="No hay módulos pendientes"
                message="Ya completaste los módulos disponibles o aún no hay nuevos contenidos publicados."
              />
            ) : (
              <div className="cards-grid">
                {availableModules.map((module) => (
                  <div key={module.id} onClick={() => handleCardClick(module)} style={{ cursor: 'pointer' }}>
                    <EducationCard
                      title={module.title || 'Módulo educativo'}
                      description={module.description || ''}
                      tag={module.category || 'Seguridad'}
                      time={module.duration || '10 min'}
                      level={module.level || 'Intermedio'}
                      image={module.image || pishing}
                      status="Pendiente"
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
        <Footer />
        
      </IonContent>
    </IonPage>
  );
};

export default EducationPage;
