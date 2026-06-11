import React, { useEffect, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import {
  Navbar,
  QuestionnaireCard,
  Footer,
  QuestionnairesPanel
} from '@/components';
import { useAuth } from '@/context/AuthContext';
import './QuestionnairePage.css';

import phishing from '@/assets/questions/phishing.png';
import datos from '@/assets/questions/datos.png';
import contrasena from '@/assets/questions/contrasena.webp';
import dispositivos from '@/assets/questions/dispositivos.png';
import wifi from '@/assets/questions/wifi.png';
import inge from '@/assets/questions/inge.png';
import { API_URL } from '@/shared/api/apiClient';
import { notify } from '@/shared/notifications';

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

interface QuestionnaireProgressItem {
  id?: string;
  usuario_id?: string;
  usuarioId?: string;
  cuestionario_id?: string;
  cuestionarioId?: string;
  questionnaireId?: string;
  fecha_respuesta?: string;
  fechaRespuesta?: string;
  puntaje_obtenido?: number;
  puntajeObtenido?: number;
  score?: number;
  estatus?: string;
  status?: string;
}

interface QuestionnaireProgressResponse {
  ok?: boolean;
  progreso?: QuestionnaireProgressItem[];
  progress?: QuestionnaireProgressItem[];
  completados?: string[];
  completedIds?: string[];
  totalCompletados?: number;
  total_completed?: number;
}


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

const getProgressItems = (
  progressData: QuestionnaireProgressResponse | null
): QuestionnaireProgressItem[] => {
  if (!progressData) return [];

  if (Array.isArray(progressData.progreso)) return progressData.progreso;
  if (Array.isArray(progressData.progress)) return progressData.progress;

  return [];
};

const getProgressQuestionnaireId = (item: QuestionnaireProgressItem) => {
  return String(
    item.cuestionario_id ||
      item.cuestionarioId ||
      item.questionnaireId ||
      ''
  );
};

const getProgressScore = (item?: QuestionnaireProgressItem) => {
  if (!item) return undefined;

  const score =
    item.score ?? item.puntaje_obtenido ?? item.puntajeObtenido ?? undefined;

  return typeof score === 'number' ? score : Number(score || 0);
};

export const QuestionnairePage: React.FC = () => {
  const history = useHistory();
  const { user, token } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [questionnaires, setQuestionnaires] = useState<QuestionnaireModule[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);

  const getAuthHeaders = (
    includeJsonContentType = false
  ): Record<string, string> => {
    const headers: Record<string, string> = {};

    if (includeJsonContentType) {
      headers['Content-Type'] = 'application/json';
    }

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
      status: normalizeStatus(item.status || item.estatus),
      img: coverUrl ? buildFileUrl(coverUrl) : getFallbackImage(item)
    };
  };

  const loadQuestionnaires = async () => {
    try {
      setIsLoading(true);

      const questionnairesRequest = fetch(`${API_URL}/api/questionnaires`);

      const progressRequest = token
        ? fetch(`${API_URL}/api/questionnaires/progress/me`, {
            headers: getAuthHeaders()
          })
        : Promise.resolve(null);

      const [questionnairesResponse, progressResponse] = await Promise.all([
        questionnairesRequest,
        progressRequest
      ]);

      const questionnairesData = await questionnairesResponse
        .json()
        .catch(() => null);

      if (!questionnairesResponse.ok) {
        console.error('Error backend /api/questionnaires:', questionnairesData);

        throw new Error(
          questionnairesData?.message ||
            questionnairesData?.error ||
            'No se pudieron cargar los cuestionarios'
        );
      }

      const progressItems =
        progressResponse && progressResponse.ok
          ? getProgressItems(await progressResponse.json().catch(() => null))
          : [];

      if (progressResponse && !progressResponse.ok) {
        const progressError = await progressResponse.json().catch(() => null);
        console.error(
          'Error backend /api/questionnaires/progress/me:',
          progressError
        );
      }

      const progressMap = new Map<string, QuestionnaireProgressItem>();

      progressItems.forEach((item) => {
        const id = getProgressQuestionnaireId(item);

        if (id) {
          progressMap.set(id, item);
        }
      });

      const normalizedQuestionnaires: QuestionnaireModule[] = Array.isArray(
        questionnairesData
      )
        ? questionnairesData.map(
            (item: BackendQuestionnaire): QuestionnaireModule => {
              const normalized = normalizeQuestionnaire(item);
              const progress = progressMap.get(String(normalized.id));

              const isCompleted =
                Boolean(progress) &&
                normalizeStatus(progress?.estatus || progress?.status) ===
                  'Completado';

              const nextStatus: QuestionnaireStatus = isCompleted
                ? 'Completado'
                : 'Pendiente';

              const progressScore = getProgressScore(progress) ?? 0;

              return {
                ...normalized,
                status: nextStatus,
                score: isCompleted ? progressScore : normalized.score,
                puntaje_obtenido: isCompleted
                  ? progressScore
                  : normalized.puntaje_obtenido
              };
            }
          )
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
  }, [token]);

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

  const openQuestionnaire = (questionnaireId: string) => {
    if (!token) {
      notify.warning('Debes iniciar sesión para responder cuestionarios.');
      history.push('/login');
      return;
    }

    history.push(`/cuestionarios/${questionnaireId}/resolver`);
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
                  <strong>{averageScore}</strong>
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
                    maxScore={Number(
                      item.puntajeMaximo || item.puntaje_maximo || 100
                    )}
                    bgImage={item.img}
                    onViewResults={() => openQuestionnaire(item.id)}
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
            ) : questionnaires.length === 0 ? (
              <div className="questionnaire-empty-state">
                Aún no hay un cuestionario disponible por el momento.
              </div>
            ) : availableQuestionnaires.length === 0 ? (
              <div className="questionnaire-empty-state">
                No hay cuestionarios pendientes por el momento.
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
                    onComplete={() => openQuestionnaire(item.id)}
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
