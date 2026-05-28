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

interface EducationModule {
  id: string;

  title?: string;
  titulo?: string;

  description?: string;
  resumen?: string;

  category?: string;
  tipo_educacion?: string;

  duration?: string;

  level?: string;
  nivel?: string;

  image?: string;
  cover_img?: string;
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
      category: module.category || module.tipo_educacion || 'Seguridad',
      duration: module.duration || '10 min',
      level: module.level || normalizeDifficultyLabel(module.nivel),
      image: rawImage ? buildFileUrl(rawImage) : pishing
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
        ? data.map((module) => normalizeBackendModule(module))
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

  return (
    <IonPage>
      <Navbar />

      <IonContent className="education-content-page">
        <div className="central-container">
          <header className="header-section">
            <h1>APRENDE SOBRE CIBERSEGURIDAD</h1>
            <p>
              Módulos breves y prácticos para fortalecer tu seguridad digital.
            </p>
          </header>

          <Advice />

          {isAdmin && (
            <section className="admin-section" style={{ marginBottom: 24 }}>
              <EducationPanel />
            </section>
          )}

          <section className="modules-section">
            <h2>MÓDULOS EDUCATIVOS DISPONIBLES</h2>

            {isLoading ? (
              <p>Cargando módulos educativos...</p>
            ) : modules.length === 0 ? (
              <p>No hay módulos educativos disponibles por el momento.</p>
            ) : (
              <div className="cards-grid">
                {modules.map((module) => (
                  <EducationCard
                    key={module.id}
                    title={module.title || 'Módulo educativo'}
                    description={module.description || ''}
                    tag={module.category || 'Seguridad'}
                    time={module.duration || '10 min'}
                    level={module.level || 'Intermedio'}
                    image={module.image || pishing}
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