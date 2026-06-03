import React, { useEffect, useMemo, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import { Navbar, Footer } from '@/components';
import { useAuth } from '@/context/AuthContext';
import './QuestionnaireTakePage.css';
import { API_URL } from '@/shared/api/apiClient';

interface RouteParams {
  id: string;
}

interface Exercise {
  id: string;
  pregunta: string;
  alternativas: string[];
  puntaje: number;
  orden: number;
}

interface ImagenCuestionario {
  id?: string;
  name?: string;
  originalName?: string;
  previewUrl?: string;
  url?: string;
  path?: string;
  type?: string;
  size?: number | null;
  order?: number;
}

interface QuestionnaireInfo {
  id: string;

  title?: string;
  titulo?: string;

  description?: string;
  resumen?: string;

  puntajeMaximo?: number;
  puntaje_maximo?: number;

  risk?: string;
  riesgo?: string;

  coverUrl?: string;
  cover_img?: string;

  fileUrl?: string;
  fileName?: string;
  archivo_url?: string;
  archivo_nombre?: string;
  archivo_tipo?: string;

  images?: Array<string | ImagenCuestionario>;
  imagenes?: Array<string | ImagenCuestionario>;
}

interface AnswerDetail {
  ejercicio_id: string;
  pregunta: string;
  alternativas: string[];
  respuesta_usuario: string;
  respuesta_correcta: string;
  correcta: boolean;
  puntaje: number;
  puntaje_obtenido: number;
  orden: number;
}

interface ResultData {
  puntajeObtenido?: number;
  puntaje_obtenido?: number;
  score?: number;
  puntajeMaximo?: number;
  puntaje_maximo?: number;
  respuestas?: AnswerDetail[];
  fechaRespuesta?: string;
  fecha_respuesta?: string;
}

interface ResolverResponse {
  ok?: boolean;
  cuestionario?: QuestionnaireInfo;
  questionnaire?: QuestionnaireInfo;
  ejercicios?: Exercise[];
  resultado?: ResultData | null;
  result?: ResultData | null;
  message?: string;
  error?: string;
}

interface ResponderResponse {
  ok?: boolean;
  resultado?: ResultData;
  result?: ResultData;
  message?: string;
  error?: string;
}

interface ImagenMaterial {
  id: string;
  url: string;
  nombre: string;
  orden: number;
}


const construirUrlArchivo = (url?: string | null) => {
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

const obtenerImagenesMaterial = (
  cuestionario: QuestionnaireInfo | null
): ImagenMaterial[] => {
  if (!cuestionario) return [];

  const imagenesCrudas = cuestionario.images || cuestionario.imagenes || [];

  if (!Array.isArray(imagenesCrudas)) return [];

  return imagenesCrudas
    .map((imagen, index): ImagenMaterial | null => {
      if (typeof imagen === 'string') {
        const url = construirUrlArchivo(imagen);

        if (!url) return null;

        return {
          id: `${index + 1}-${url}`,
          url,
          nombre: `Imagen ${index + 1}`,
          orden: index + 1
        };
      }

      const url = construirUrlArchivo(imagen.url || imagen.previewUrl || '');

      if (!url) return null;

      return {
        id: imagen.id || `${index + 1}-${url}`,
        url,
        nombre:
          imagen.originalName ||
          imagen.name ||
          `Imagen complementaria ${index + 1}`,
        orden: imagen.order || index + 1
      };
    })
    .filter((imagen): imagen is ImagenMaterial => Boolean(imagen))
    .sort((a, b) => a.orden - b.orden);
};

export const QuestionnaireTakePage: React.FC = () => {
  const { id } = useParams<RouteParams>();
  const history = useHistory();
  const { token } = useAuth();

  const [questionnaire, setQuestionnaire] = useState<QuestionnaireInfo | null>(
    null
  );
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState<ResultData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

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

  const title =
    questionnaire?.title || questionnaire?.titulo || 'Cuestionario';

  const description =
    questionnaire?.description ||
    questionnaire?.resumen ||
    'Responde las preguntas y revisa tu resultado.';

  const coverUrl = construirUrlArchivo(
    questionnaire?.coverUrl || questionnaire?.cover_img || ''
  );

  const archivoUrl = construirUrlArchivo(
    questionnaire?.fileUrl || questionnaire?.archivo_url || ''
  );

  const archivoNombre =
    questionnaire?.fileName ||
    questionnaire?.archivo_nombre ||
    'Material complementario';

  const imagenesMaterial = useMemo(
    () => obtenerImagenesMaterial(questionnaire),
    [questionnaire]
  );

  const tieneMaterialComplementario =
    Boolean(coverUrl) || Boolean(archivoUrl) || imagenesMaterial.length > 0;

  const maxScore =
    result?.puntajeMaximo ||
    result?.puntaje_maximo ||
    questionnaire?.puntajeMaximo ||
    questionnaire?.puntaje_maximo ||
    exercises.reduce(
      (total, exercise) => total + Number(exercise.puntaje || 0),
      0
    );

  const score =
    result?.puntajeObtenido ||
    result?.puntaje_obtenido ||
    result?.score ||
    0;

  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  const currentExercise = exercises[currentIndex];

  const answeredCount = useMemo(() => {
    return exercises.filter((exercise) => Boolean(answers[exercise.id])).length;
  }, [answers, exercises]);

  const progressPercentage =
    exercises.length > 0
      ? Math.round((answeredCount / exercises.length) * 100)
      : 0;

  const loadQuestionnaire = async () => {
    if (!token) {
      alert('Debes iniciar sesión para responder cuestionarios.');
      history.push('/login');
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(
        `${API_URL}/api/questionnaires/${id}/resolver`,
        {
          headers: getAuthHeaders()
        }
      );

      const data: ResolverResponse = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || 'No se pudo cargar el cuestionario.'
        );
      }

      const loadedQuestionnaire =
        data?.cuestionario || data?.questionnaire || null;

      const loadedExercises = Array.isArray(data?.ejercicios)
        ? data.ejercicios
        : [];

      const loadedResult = data?.resultado || data?.result || null;

      setQuestionnaire(loadedQuestionnaire);

      setExercises(
        loadedExercises
          .map((exercise) => ({
            ...exercise,
            puntaje: Number(exercise.puntaje || 1),
            orden: Number(exercise.orden || 1),
            alternativas: Array.isArray(exercise.alternativas)
              ? exercise.alternativas
              : []
          }))
          .sort((a, b) => a.orden - b.orden)
      );

      setResult(loadedResult || null);

      if (loadedResult?.respuestas) {
        const loadedAnswers: Record<string, string> = {};

        loadedResult.respuestas.forEach((answer) => {
          loadedAnswers[answer.ejercicio_id] = answer.respuesta_usuario;
        });

        setAnswers(loadedAnswers);
      }
    } catch (error: any) {
      console.error('Error al cargar cuestionario:', error);
      alert(error.message || 'Error al cargar cuestionario.');
      history.push('/cuestionarios');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuestionnaire();
  }, [id, token]);

  const selectAnswer = (exerciseId: string, answer: string) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [exerciseId]: answer
    }));
  };

  const goNext = () => {
    setCurrentIndex((prevIndex) =>
      Math.min(prevIndex + 1, exercises.length - 1)
    );
  };

  const goBack = () => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const submitAnswers = async () => {
    if (!token) {
      alert('Debes iniciar sesión para guardar tu resultado.');
      return;
    }

    const missingAnswers = exercises.filter(
      (exercise) => !answers[exercise.id]
    );

    if (missingAnswers.length > 0) {
      alert('Debes responder todas las preguntas antes de finalizar.');
      return;
    }

    try {
      setIsSending(true);

      const response = await fetch(
        `${API_URL}/api/questionnaires/${id}/responder`,
        {
          method: 'POST',
          headers: getAuthHeaders(true),
          body: JSON.stringify({
            respuestas: exercises.map((exercise) => ({
              ejercicio_id: exercise.id,
              respuesta: answers[exercise.id]
            }))
          })
        }
      );

      const data: ResponderResponse = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || 'No se pudo enviar el cuestionario.'
        );
      }

      const nextResult = data?.resultado || data?.result || null;

      setResult(nextResult || null);
      window.dispatchEvent(new Event('questionnaires-updated'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      console.error('Error al enviar cuestionario:', error);
      alert(error.message || 'Error al enviar cuestionario.');
    } finally {
      setIsSending(false);
    }
  };

  const restartLocalAttempt = () => {
    setResult(null);
    setAnswers({});
    setCurrentIndex(0);
  };

  const renderMaterialComplementario = () => {
    if (!tieneMaterialComplementario) return null;

    return (
      <section className="take-material-panel">
        <div className="take-material-header">
          <div>
            <span className="take-kicker">Material complementario</span>
            <h2>Revisa este contenido antes de responder</h2>
            <p>
              Este material pertenece al cuestionario y puede ayudarte a
              responder mejor las preguntas.
            </p>
          </div>
        </div>

        {coverUrl && (
          <figure className="take-cover-preview">
            <img src={coverUrl} alt={`Portada de ${title}`} />
          </figure>
        )}

        {archivoUrl && (
          <div className="take-file-card">
            <div>
              <span>Archivo complementario</span>
              <strong>{archivoNombre}</strong>
            </div>

            <a href={archivoUrl} target="_blank" rel="noreferrer">
              Ver o descargar
            </a>
          </div>
        )}

        {imagenesMaterial.length > 0 && (
          <div className="take-gallery-block">
            <h3>Imágenes complementarias</h3>

            <div className="take-gallery-grid">
              {imagenesMaterial.map((imagen, index) => (
                <a
                  key={imagen.id}
                  className="take-gallery-item"
                  href={imagen.url}
                  target="_blank"
                  rel="noreferrer"
                  title={imagen.nombre}
                >
                  <img
                    src={imagen.url}
                    alt={imagen.nombre || `Imagen ${index + 1}`}
                  />

                  <span>{imagen.nombre}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </section>
    );
  };

  return (
    <IonPage>
      <Navbar />

      <IonContent fullscreen className="questionnaire-take-content">
        <main className="questionnaire-take-shell">
          <button
            type="button"
            className="take-back-link"
            onClick={() => history.push('/cuestionarios')}
          >
            ← Volver a cuestionarios
          </button>

          <section className="take-hero-card">
            <span className="take-kicker">Cuestionario</span>

            <h1>{title}</h1>

            <p>{description}</p>

            <div className="take-meta-row">
              <span>{exercises.length} preguntas</span>
              <span>{maxScore} puntos</span>
              {archivoUrl && <span>Archivo disponible</span>}
              {imagenesMaterial.length > 0 && (
                <span>{imagenesMaterial.length} imágenes</span>
              )}
              {result && <span>Resultado guardado</span>}
            </div>
          </section>

          {renderMaterialComplementario()}

          {isLoading ? (
            <section className="take-panel">
              <p>Cargando cuestionario...</p>
            </section>
          ) : exercises.length === 0 ? (
            <section className="take-panel">
              <h2>Este cuestionario aún no tiene preguntas</h2>
              <p>
                Un administrador debe importar las preguntas desde un archivo
                CSV antes de que pueda ser respondido.
              </p>
            </section>
          ) : result ? (
            <section className="take-panel">
              <div className="take-result-header">
                <div>
                  <span className="take-kicker">Resultado</span>
                  <h2>
                    Obtuviste {score}/{maxScore} puntos
                  </h2>
                  <p>
                    Revisa cada pregunta para ver tus respuestas correctas e
                    incorrectas.
                  </p>
                </div>

                <div className="take-score-circle">
                  <strong>{percentage}%</strong>
                  <span>logrado</span>
                </div>
              </div>

              <div className="take-review-list">
                {(result.respuestas || []).map((answer, index) => (
                  <article
                    key={answer.ejercicio_id || index}
                    className={`take-review-card ${
                      answer.correcta ? 'is-correct' : 'is-wrong'
                    }`}
                  >
                    <div className="take-review-top">
                      <strong>Pregunta {answer.orden || index + 1}</strong>

                      <span>
                        {answer.correcta
                          ? `Correcta +${answer.puntaje_obtenido}`
                          : 'Incorrecta +0'}
                      </span>
                    </div>

                    <h3>{answer.pregunta}</h3>

                    <div className="take-answer-grid">
                      <div>
                        <span>Tu respuesta</span>
                        <p>{answer.respuesta_usuario || 'Sin respuesta'}</p>
                      </div>

                      <div>
                        <span>Respuesta correcta</span>
                        <p>{answer.respuesta_correcta}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="take-actions">
                <button
                  type="button"
                  className="take-secondary-button"
                  onClick={() => history.push('/cuestionarios')}
                >
                  Volver al listado
                </button>

                <button
                  type="button"
                  className="take-primary-button"
                  onClick={restartLocalAttempt}
                >
                  Responder nuevamente
                </button>
              </div>
            </section>
          ) : (
            <section className="take-panel">
              <div className="take-progress-box">
                <div>
                  <span>
                    Pregunta {currentIndex + 1} de {exercises.length}
                  </span>

                  <strong>{progressPercentage}% respondido</strong>
                </div>

                <div className="take-progress-bar">
                  <div style={{ width: `${progressPercentage}%` }} />
                </div>
              </div>

              {currentExercise && (
                <article className="take-question-card">
                  <div className="take-question-head">
                    <span>{currentExercise.puntaje} puntos</span>
                    <strong>Pregunta {currentExercise.orden}</strong>
                  </div>

                  <h2>{currentExercise.pregunta}</h2>

                  <div className="take-options-list">
                    {currentExercise.alternativas.map((alternative, index) => {
                      const selected =
                        answers[currentExercise.id] === alternative;

                      return (
                        <button
                          key={`${currentExercise.id}-${alternative}-${index}`}
                          type="button"
                          className={`take-option-button ${
                            selected ? 'is-selected' : ''
                          }`}
                          onClick={() =>
                            selectAnswer(currentExercise.id, alternative)
                          }
                        >
                          <span>{String.fromCharCode(65 + index)}</span>
                          <strong>{alternative}</strong>
                        </button>
                      );
                    })}
                  </div>
                </article>
              )}

              <div className="take-actions">
                <button
                  type="button"
                  className="take-secondary-button"
                  disabled={currentIndex === 0}
                  onClick={goBack}
                >
                  Anterior
                </button>

                {currentIndex < exercises.length - 1 ? (
                  <button
                    type="button"
                    className="take-primary-button"
                    onClick={goNext}
                  >
                    Siguiente
                  </button>
                ) : (
                  <button
                    type="button"
                    className="take-primary-button"
                    disabled={isSending}
                    onClick={submitAnswers}
                  >
                    {isSending ? 'Guardando...' : 'Finalizar cuestionario'}
                  </button>
                )}
              </div>
            </section>
          )}
        </main>

        <Footer />
      </IonContent>
    </IonPage>
  );
};

export default QuestionnaireTakePage;
