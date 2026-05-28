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

const API_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

/*
  Modo de prueba:
  true  = marca temporalmente el primer módulo como completado.
  false = comportamiento normal.
*/
const DEV_PREVIEW_COMPLETED_EDUCATION = false;

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

export const EducationPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [modules, setModules] = useState<EducationModule[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

      const response = await fetch(`${API_URL}/api/education`);
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        console.error('Error backend /api/education:', data);

        throw new Error(
          data?.message ||
            data?.error ||
            'No se pudieron cargar los módulos educativos'
        );
      }

      const backendModules: EducationModule[] = Array.isArray(data)
        ? data.map((module, index) => {
            const normalized = normalizeBackendModule(module);

            if (DEV_PREVIEW_COMPLETED_EDUCATION && index === 0) {
              return {
                ...normalized,
                status: 'Completado'
              };
            }

            return {
              ...normalized,
              status: normalized.status || 'Pendiente'
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
  }, []);

  const completedModules = modules.filter(
    (module) => module.status === 'Completado'
    );

    const availableModules = modules.filter(
      (module) => module.status !== 'Completado'
    );

    const markModuleAsCompleted = (moduleId: string) => {
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
                    Aquí puedes revisar los módulos educativos que ya fueron
                    completados por el usuario.
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
                <span>Total</span>
                <strong>{availableModules.length}</strong>
              </div>
            </div>

            {isLoading ? (
              <div className="education-empty-state">
                Cargando módulos educativos...
              </div>
            ) : availableModules.length === 0 ? (
              <div className="education-empty-state">
                No hay módulos educativos disponibles por el momento.
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