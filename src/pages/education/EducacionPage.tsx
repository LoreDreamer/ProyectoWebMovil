import { useEffect, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import {
  Navbar,
  EducationCard,
  Advice,
  Footer,
  EducationPanel
} from '../../components';
import { useAuth } from '../../context/AuthContext';

import pishing from '../../assets/education/pishing.png';

import './EducationPage.css';

type EducationStatus = 'Completado' | 'Pendiente';

interface EducationModule {
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
}

interface EducationProgressItem {
  id?: string;
  usuario_id?: string;
  usuarioId?: string;
  educacion_id?: string;
  educacionId?: string;
  educationId?: string;
  fecha_lectura?: string;
  fechaLectura?: string;
}

interface EducationProgressResponse {
  ok?: boolean;
  progreso?: EducationProgressItem[];
  progress?: EducationProgressItem[];
  completados?: string[];
  completedIds?: string[];
  totalCompletados?: number;
  total_completed?: number;
}

const API_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

const normalizeDifficultyLabel = (value?: string) => {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (
    normalized === 'facil' ||
    normalized === 'basico' ||
    normalized === 'basica'
  ) {
    return 'Básico';
  }

  if (
    normalized === 'dificil' ||
    normalized === 'avanzado' ||
    normalized === 'avanzada'
  ) {
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

  if (
    normalized === 'completado' ||
    normalized === 'completo' ||
    normalized === 'finalizado'
  ) {
    return 'Completado';
  }

  return 'Pendiente';
};

const getEducationCompletedIds = (
  progressData: EducationProgressResponse | null
) => {
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
  const isAdmin = user?.role === 'admin';

  const [modules, setModules] = useState<EducationModule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleting, setIsCompleting] = useState<string | null>(null);

  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  };

  const buildFileUrl = (url?: string) => {
    if (!url) return '';

    if (
      url.startsWith('http') ||
      url.startsWith('blob:') ||
      url.startsWith('data:')
    ) {
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
      body:
        module.body ||
        module.cuerpo ||
        module.description ||
        module.resumen ||
        '',
      category: module.category || module.tipo_educacion || 'Seguridad',
      duration: module.duration || '10 min',
      level: module.level || normalizeDifficultyLabel(module.nivel),
      image: rawImage ? buildFileUrl(rawImage) : pishing,
      createdAt: module.createdAt || null,
      status: normalizeStatus(module.status || module.estatus)
    };
  };

  const loadEducationModules = async () => {
    try {
      setIsLoading(true);

      const modulesRequest = fetch(`${API_URL}/api/education`);

      const progressRequest = token
        ? fetch(`${API_URL}/api/education/progress/me`, {
            headers: getAuthHeaders()
          })
        : Promise.resolve(null);

      const [modulesResponse, progressResponse] = await Promise.all([
        modulesRequest,
        progressRequest
      ]);

      const modulesData = await modulesResponse.json().catch(() => null);

      if (!modulesResponse.ok) {
        console.error('Error backend /api/education:', modulesData);

        throw new Error(
          modulesData?.message ||
            modulesData?.error ||
            'No se pudieron cargar los módulos educativos'
        );
      }

      let completedIds: string[] = [];

      if (progressResponse && progressResponse.ok) {
        const progressData: EducationProgressResponse = await progressResponse
          .json()
          .catch(() => null);

        completedIds = getEducationCompletedIds(progressData);
      }

      if (progressResponse && !progressResponse.ok) {
        const progressError = await progressResponse.json().catch(() => null);
        console.error('Error backend /api/education/progress/me:', progressError);
      }

      const backendModules: EducationModule[] = Array.isArray(modulesData)
        ? modulesData.map((module) => {
            const normalized = normalizeBackendModule(module);

            return {
              ...normalized,
              status: completedIds.includes(String(normalized.id))
                ? 'Completado'
                : 'Pendiente'
            };
          })
        : [];

      setModules(backendModules);
    } catch (error) {
      console.error('Error al cargar módulos educativos:', error);
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

  const completedModules = modules.filter(
    (module) => module.status === 'Completado'
  );

  const availableModules = modules.filter(
    (module) => module.status !== 'Completado'
  );

  const markModuleAsCompleted = async (moduleId: string) => {
    if (!token) {
      alert('Debes iniciar sesión para guardar tu progreso.');
      return;
    }

    try {
      setIsCompleting(moduleId);

      const response = await fetch(`${API_URL}/api/education/${moduleId}/complete`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        console.error('Error backend completeEducationModule:', data);

        throw new Error(
          data?.message ||
            data?.error ||
            'No se pudo marcar el módulo como completado'
        );
      }

      setModules((prevModules) =>
        prevModules.map((module) =>
          module.id === moduleId
            ? {
                ...module,
                status: 'Completado'
              }
            : module
        )
      );
    } catch (error: any) {
      console.error('Error al completar módulo educativo:', error);
      alert(error.message || 'Error al completar módulo educativo.');
    } finally {
      setIsCompleting(null);
    }
  };

  return (
    <IonPage>
      <Navbar />

      <IonContent className="education-content-page">
        <div className="education-shell">
          <header className="education-hero-section">
            <span className="education-kicker">
              Formación en ciberseguridad
            </span>

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

          {completedModules.length > 0 && (
            <section className="education-section completed-education-section">
              <div className="education-section-header">
                <div>
                  <span className="section-eyebrow">Completados</span>
                  <h2>Módulos educativos completados</h2>
                  <p>
                    Aquí puedes revisar los módulos educativos que ya guardaste
                    como completados.
                  </p>
                </div>

                <div className="education-count-card">
                  <span>Completados</span>
                  <strong>{completedModules.length}</strong>
                </div>
              </div>

              <div className="cards-grid">
                {completedModules.map((module) => (
                  <EducationCard
                    key={module.id}
                    title={module.title || 'Módulo educativo'}
                    description={module.description || ''}
                    tag={module.category || 'Seguridad'}
                    time={module.duration || '10 min'}
                    level={module.level || 'Intermedio'}
                    image={module.image || pishing}
                    status="Completado"
                  />
                ))}
              </div>
            </section>
          )}

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
              <div className="education-empty-state">
                Cargando módulos educativos...
              </div>
            ) : availableModules.length === 0 ? (
              <div className="education-empty-state">
                No hay módulos educativos pendientes por el momento.
              </div>
            ) : (
              <div className="cards-grid">
                {availableModules.map((module) => (
                  <EducationCard
                    key={module.id}
                    title={module.title || 'Módulo educativo'}
                    description={module.description || ''}
                    tag={module.category || 'Seguridad'}
                    time={module.duration || '10 min'}
                    level={module.level || 'Intermedio'}
                    image={module.image || pishing}
                    status="Pendiente"
                    isLoading={isCompleting === module.id}
                    onComplete={() => markModuleAsCompleted(module.id)}
                  />
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
