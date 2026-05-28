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

type QuestionnaireStatus = 'Completado' | 'Pendiente';

interface QuestionnaireModule {
  id: string;

  title: string;
  titulo?: string;

  description: string;
  resumen?: string;

  risk: string;
  riesgo?: string;
  difficulty?: string;

  category?: string;

  coverUrl?: string;
  cover_img?: string;

  score?: number;
  puntaje_obtenido?: number;

  questionsCount?: number;
  questions_count?: number;
  puntajeMaximo?: number;
  puntaje_maximo?: number;

  status?: QuestionnaireStatus;
  estatus?: string;

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

  category?: string;

  coverUrl?: string;
  cover_img?: string;

  questionsCount?: number;
  questions_count?: number;
  puntajeMaximo?: number;
  puntaje_maximo?: number;

  score?: number;
  puntaje_obtenido?: number;

  status?: string;
  estatus?: string;
}

const API_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
const DEV_PREVIEW_COMPLETED_QUESTIONNAIRES = false;

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

const normalizeStatus = (status?: string): QuestionnaireStatus => {
  const normalized = String(status || '')
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

export const QuestionnairePage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [questionnaires, setQuestionnaires] = useState<QuestionnaireModule[]>(
    []
  );
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
    if (text.includes('ingeniería') || text.includes('ingenieria')) {
      return inge;
    }

    return phishing;
  };

  const normalizeQuestionnaire = (
    item: BackendQuestionnaire
  ): QuestionnaireModule => {
    const title = item.title || item.titulo || 'Cuestionario';
    const description =
      item.description ||
      item.resumen ||
      'Evalúa tus conocimientos de ciberseguridad.';

    const coverUrl = item.coverUrl || item.cover_img || '';
    const status = normalizeStatus(item.status || item.estatus);

    const maxScore =
      item.puntajeMaximo ||
      item.puntaje_maximo ||
      item.questionsCount ||
      item.questions_count ||
      100;

    const rawScore = item.score || item.puntaje_obtenido;

    return {
      id: String(item.id),
      title,
      description,
      risk: normalizeRisk(item.risk || item.riesgo || item.difficulty),
      category: item.category || 'General',
      coverUrl,
      cover_img: item.cover_img,
      questionsCount: maxScore,
      questions_count: maxScore,
      puntajeMaximo: maxScore,
      puntaje_maximo: maxScore,
      score: rawScore,
      puntaje_obtenido: rawScore,
      status,
      img: coverUrl ? buildFileUrl(coverUrl) : getFallbackImage(item)
    };
  };

  const loadQuestionnaires = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_URL}/api/questionnaires`);
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        console.error('Error backend /api/questionnaires:', data);

        throw new Error(
          data?.message ||
            data?.error ||
            'No se pudieron cargar los cuestionarios'
        );
      }

      const normalizedQuestionnaires = Array.isArray(data)
        ? data.map((item, index) => {
            const normalized = normalizeQuestionnaire(item);

            if (DEV_PREVIEW_COMPLETED_QUESTIONNAIRES && index === 0) {
              return {
                ...normalized,
                status: 'Completado' as QuestionnaireStatus,
                score: 86,
                puntaje_obtenido: 86
              };
            }

            return normalized;
          })
        : [];

      setQuestionnaires(normalizedQuestionnaires);
    } catch (error) {
      console.error('Error al cargar cuestionarios:', error);
      setQuestionnaires([]);
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

  const completedQuestionnaires = questionnaires.filter(
    (item) => item.status === 'Completado'
  );

  const availableQuestionnaires = questionnaires.filter(
    (item) => item.status !== 'Completado'
  );

  const hasCompletedQuestionnaires = completedQuestionnaires.length > 0;

  const averageScore =
    completedQuestionnaires.length > 0
      ? Math.round(
          completedQuestionnaires.reduce(
            (total, item) => total + Number(item.score || 0),
            0
          ) / completedQuestionnaires.length
        )
      : 0;

  const markQuestionnaireAsCompleted = (questionnaireId: string) => {
    setQuestionnaires((prevQuestionnaires) =>
      prevQuestionnaires.map((questionnaire) =>
        questionnaire.id === questionnaireId
          ? {
              ...questionnaire,
              status: 'Completado' as QuestionnaireStatus,
              score: questionnaire.score || 86,
              puntaje_obtenido: questionnaire.puntaje_obtenido || 86
            }
          : questionnaire
      )
    );
  };

  return (
    <IonPage>
      <Navbar />

      <IonContent fullscreen className="cuestionarios-content">
        <div className="cuestionarios-shell">
          <header className="questionnaire-hero-section">
            <span className="questionnaire-kicker">
              Evaluación de ciberseguridad
            </span>

            <h1>Cuestionarios de seguridad digital</h1>

            <p>
              Responde evaluaciones breves para identificar riesgos, reforzar
              tus conocimientos y mejorar tus hábitos digitales.
            </p>
          </header>

          {isAdmin && (
            <section className="questionnaire-admin-section">
              <QuestionnairesPanel />
            </section>
          )}

          {hasCompletedQuestionnaires && (
            <section className="questionnaire-section completed-summary-section">
              <div className="questionnaire-section-header">
                <div>
                  <span className="section-eyebrow">Tu avance</span>
                  <h2>Resumen de cuestionarios completados</h2>
                  <p>
                    Aquí puedes revisar tus evaluaciones finalizadas y el
                    resultado obtenido.
                  </p>
                </div>

                <div className="summary-score-card">
                  <span>Promedio</span>
                  <strong>{averageScore}/100</strong>
                </div>
              </div>

              <div className="questionnaire-summary-grid">
                <div className="summary-mini-card">
                  <span>Completados</span>
                  <strong>{completedQuestionnaires.length}</strong>
                </div>

                <div className="summary-mini-card">
                  <span>Pendientes</span>
                  <strong>{availableQuestionnaires.length}</strong>
                </div>

                <div className="summary-mini-card">
                  <span>Total</span>
                  <strong>{questionnaires.length}</strong>
                </div>
              </div>

              <div className="cuestionarios-grid">
                {completedQuestionnaires.map((item) => (
                  <QuestionnaireCard
                    key={item.id}
                    title={item.title}
                    description={item.description}
                    risk={item.risk}
                    status="Completado"
                    score={Number(item.score || 0)}
                    bgImage={item.img}
                    onViewResults={() => {
                      console.log('Ver resultados:', item.title);
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          <section className="questionnaire-section">
            <div className="questionnaire-section-header">
              <div>
                <span className="section-eyebrow">Disponibles</span>
                <h2>Cuestionarios disponibles</h2>
                <p>
                  Selecciona un cuestionario para comenzar la evaluación y
                  recibir recomendaciones según tu nivel de riesgo.
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="questionnaire-empty-state">
                Cargando cuestionarios...
              </div>
            ) : availableQuestionnaires.length === 0 ? (
              <div className="questionnaire-empty-state">
                No hay cuestionarios disponibles por el momento.
              </div>
            ) : (
              <div className="cuestionarios-grid">
                {availableQuestionnaires.map((item) => (
                  <QuestionnaireCard
                    key={item.id}
                    title={item.title}
                    description={item.description}
                    risk={item.risk}
                    status="Pendiente"
                    bgImage={item.img}
                    onComplete={() => markQuestionnaireAsCompleted(item.id)}
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

export default QuestionnairePage;