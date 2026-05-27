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

import img_01 from '../../assets/questions/img_01.jpg';
import vpn from '../../assets/education/vpn.jpg';
import pishing from '../../assets/education/pishing.png';
import huella from '../../assets/education/huella.png';

import './EducationPage.css';

interface EducationModule {
  id: string;

  title: string;
  titulo?: string;

  description: string;
  resumen?: string;

  category: string;
  tipo_educacion?: string;

  duration?: string;

  level: string;
  nivel?: string;

  image: string;
  cover_img?: string;
}

const API_URL = 'http://localhost:3000';

const staticModules: EducationModule[] = [
  {
    id: 'static-1',
    title: '¿Qué es el phishing?',
    description: 'Aprende a reconocer correos y mensajes fraudulentos.',
    category: 'Phishing',
    duration: '12 min',
    level: 'Básico',
    image: pishing
  },
  {
    id: 'static-2',
    title: 'Seguridad en Redes',
    description: 'Consejos para navegar de forma segura en redes Wi-Fi públicas.',
    category: 'Seguridad',
    duration: '15 min',
    level: 'Intermedio',
    image: img_01
  },
  {
    id: 'static-3',
    title: 'Uso de VPN',
    description: 'Protege tu identidad y datos cifrando tu conexión a internet.',
    category: 'VPNs',
    duration: '10 min',
    level: 'Básico',
    image: vpn
  },
  {
    id: 'static-4',
    title: 'Huella Digital y Privacidad',
    description:
      'Aprende a gestionar tu huella digital y a configurar la privacidad de tus redes para evitar que rastreen tus datos.',
    category: 'Privacidad',
    duration: '15 min',
    level: 'Intermedio',
    image: huella
  }
];

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

  const [modules, setModules] = useState<EducationModule[]>(staticModules);

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
    return {
      id: String(module.id),
      title: module.title || module.titulo || 'Módulo educativo',
      description: module.description || module.resumen || '',
      category: module.category || module.tipo_educacion || 'Seguridad',
      duration: module.duration || '10 min',
      level: module.level || normalizeDifficultyLabel(module.nivel),
      image: module.image || module.cover_img || ''
    };
  };

  const loadEducationModules = async () => {
    try {
      const response = await fetch(`${API_URL}/api/education`);

      if (!response.ok) {
        throw new Error('No se pudieron cargar los módulos educativos');
      }

      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        setModules(staticModules);
        return;
      }

      const backendModules: EducationModule[] = data.map((module) => {
        const normalizedModule = normalizeBackendModule(module);

        return {
          ...normalizedModule,
          image: normalizedModule.image
            ? buildFileUrl(normalizedModule.image)
            : pishing
        };
      });

      setModules(backendModules);
    } catch (error) {
      console.error('Error al cargar módulos educativos:', error);
      setModules(staticModules);
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

            <div className="cards-grid">
              {modules.map((module) => (
                <EducationCard
                  key={module.id}
                  title={module.title}
                  description={module.description}
                  tag={module.category}
                  time={module.duration || '10 min'}
                  level={module.level}
                  image={module.image}
                />
              ))}
            </div>
          </section>
        </div>

        <Footer />
      </IonContent>
    </IonPage>
  );
};

export default EducationPage;