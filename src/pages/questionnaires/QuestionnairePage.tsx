import React, { useEffect, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import {
  Navbar,
  QuestionnaireCard,
  Footer,
  QuestionnairesPanel
} from '../../components';
import { useAuth } from '../../context/AuthContext';
import './QuestionnairePage.css';

import phishing from '../../assets/questions/phishing.png';
import datos from '../../assets/questions/datos.png';
import contrasena from '../../assets/questions/contrasena.webp';
import dispositivos from '../../assets/questions/dispositivos.png';
import wifi from '../../assets/questions/wifi.png';
import inge from '../../assets/questions/inge.png';

interface QuestionnaireModule {
  id: string;
  titulo: string;
  description: string;
  riesgo: string;
  score?: number;
  img: string;
}

interface BackendQuestionnaire {
  id: string;

  title?: string;
  titulo?: string;

  description?: string;
  resumen?: string;

  risk?: string;
  riesgo?: string;
  difficulty?: string;

  coverUrl?: string;
  cover_img?: string;

  category?: string;

  questionsCount?: number;
  questions_count?: number;
  puntajeMaximo?: number;
  puntaje_maximo?: number;
}

const API_URL = 'http://localhost:3000';

export const QuestionnairePage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [disponiblesData, setDisponiblesData] = useState<
    QuestionnaireModule[]
  >([]);

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

  const normalizeRisk = (risk?: string) => {
    const normalized = String(risk || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    if (normalized === 'alto') return 'Alto';
    if (normalized === 'bajo') return 'Bajo';

    return 'Medio';
  };

  const getFallbackImage = (item: BackendQuestionnaire) => {
    const text = `${item.title || item.titulo || ''} ${
      item.category || ''
    }`.toLowerCase();

    if (text.includes('phishing')) return phishing;
    if (text.includes('dato')) return datos;
    if (text.includes('contraseña') || text.includes('password')) {
      return contrasena;
    }
    if (text.includes('wifi') || text.includes('wi-fi')) return wifi;
    if (text.includes('dispositivo')) return dispositivos;
    if (text.includes('ingeniería')) return inge;

    return phishing;
  };

  const loadQuestionnaires = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_URL}/api/questionnaires`);

      if (!response.ok) {
        throw new Error('No se pudieron cargar los cuestionarios');
      }

      const data: BackendQuestionnaire[] = await response.json();

      const backendQuestionnaires: QuestionnaireModule[] = Array.isArray(data)
        ? data.map((item) => {
            const title = item.title || item.titulo || 'Cuestionario';
            const description =
              item.description ||
              item.resumen ||
              'Aprende a proteger tu entorno digital.';

            const coverUrl = item.coverUrl || item.cover_img || '';

            return {
              id: String(item.id),
              titulo: title,
              description,
              riesgo: normalizeRisk(item.risk || item.riesgo || item.difficulty),
              img: coverUrl ? buildFileUrl(coverUrl) : getFallbackImage(item)
            };
          })
        : [];

      setDisponiblesData(backendQuestionnaires);
    } catch (error) {
      console.error('Error al cargar cuestionarios:', error);
      setDisponiblesData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuestionnaires();

    const handler = () => loadQuestionnaires();
    window.addEventListener('questionnaires-updated', handler);

    return () => {
      window.removeEventListener('questionnaires-updated', handler);
    };
  }, []);

  return (
    <IonPage>
      <Navbar />

      <IonContent fullscreen className="cuestionarios-content">
        <div className="cuestionarios-shell">
          {isAdmin && (
            <section style={{ marginBottom: 24 }}>
              <QuestionnairesPanel />
            </section>
          )}

          <header>
            <h1 className="resumen-title">Resumen de cuestionarios</h1>

            <p className="resumen-subtitle">
              Evalúa tus conocimientos en distintos ámbitos de la
              ciberseguridad municipal.
            </p>
          </header>

          <h2 className="section-title">Cuestionarios disponibles</h2>

          <p className="resumen-subtitle">
            Fortalece tu seguridad digital completando los desafíos disponibles.
            Selecciona un tema para comenzar la evaluación y obtén
            recomendaciones personalizadas para proteger tu información.
          </p>

          {isLoading ? (
            <p>Cargando cuestionarios...</p>
          ) : disponiblesData.length === 0 ? (
            <p>No hay cuestionarios disponibles por el momento.</p>
          ) : (
            <div className="cuestionarios-grid">
              {disponiblesData.map((item) => (
                <QuestionnaireCard
                  key={item.id}
                  title={item.titulo}
                  description={item.description}
                  risk={item.riesgo}
                  status="Pendiente"
                  bgImage={item.img}
                />
              ))}
            </div>
          )}
        </div>

        <Footer />
      </IonContent>
    </IonPage>
  );
};

export default QuestionnairePage;