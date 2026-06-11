import { useEffect, useMemo, useState } from 'react';
import { IonContent, IonIcon, IonPage } from '@ionic/react';
import {
  calendarOutline,
  checkmarkCircleOutline,
  documentTextOutline,
  schoolOutline,
  shieldCheckmarkOutline,
  timeOutline
} from 'ionicons/icons';
import { Link } from 'react-router-dom';
import {
  Navbar,
  Footer,
  StatCard,
  Progress
} from '@/components';
import { useAuth } from '@/context/AuthContext';
import './InicioPage.css';
import { API_URL } from '@/shared/api/apiClient';
import { ContentState } from '@/shared/components/states/ContentState';

interface Activity {
  id: string;

  title?: string;
  titulo?: string;

  description?: string;
  descripcion?: string;

  date?: string;
  fecha?: string;
}

interface NormalizedActivity {
  id: string;
  title: string;
  description: string;
  date: string;
  rawDate: string;
}

interface ContentCounts {
  education: number;
  questionnaires: number;
  protocols: number;
}


const formatDateForView = (date?: string) => {
  if (!date) return 'Sin fecha';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString('es-CL', {
    timeZone: 'America/Santiago',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const InicioPage: React.FC = () => {
  const { user } = useAuth();

  const [activities, setActivities] = useState<NormalizedActivity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [activitiesError, setActivitiesError] = useState('');

  const [contentCounts, setContentCounts] = useState<ContentCounts>({
    education: 0,
    questionnaires: 0,
    protocols: 0
  });

  const [isLoadingCounts, setIsLoadingCounts] = useState(false);

  const userName =
    user?.nombre_completo ||
    user?.name ||
    user?.email ||
    user?.correo ||
    'Usuario';

  const normalizeActivity = (activity: Activity): NormalizedActivity => {
    const rawDate = activity.date || activity.fecha || '';

    return {
      id: String(activity.id),
      title: activity.title || activity.titulo || 'Actividad municipal',
      description:
        activity.description ||
        activity.descripcion ||
        'Actividad disponible para la comunidad.',
      date: formatDateForView(rawDate),
      rawDate
    };
  };

  const getArrayCount = (data: unknown) => {
    if (Array.isArray(data)) return data.length;

    if (data && typeof data === 'object') {
      const value = data as { data?: unknown[]; pagination?: { total?: number } };

      if (typeof value.pagination?.total === 'number') return value.pagination.total;
      if (Array.isArray(value.data)) return value.data.length;
    }

    return 0;
  };

  const loadContentCounts = async () => {
    try {
      setIsLoadingCounts(true);

      const summaryResponse = await fetch(`${API_URL}/api/dashboard/summary`);
      const summaryData = await summaryResponse.json().catch(() => null);

      if (summaryResponse.ok && summaryData?.data) {
        setContentCounts({
          education: Number(summaryData.data.education || 0),
          questionnaires: Number(summaryData.data.questionnaires || 0),
          protocols: Number(summaryData.data.protocols || 0)
        });

        return;
      }

      const [educationResponse, questionnairesResponse, protocolsResponse] =
        await Promise.all([
          fetch(`${API_URL}/api/education?page=1&limit=1`),
          fetch(`${API_URL}/api/questionnaires?page=1&limit=1`),
          fetch(`${API_URL}/api/protocolos?page=1&limit=1`)
        ]);

      const [educationData, questionnairesData, protocolsData] =
        await Promise.all([
          educationResponse.json().catch(() => []),
          questionnairesResponse.json().catch(() => []),
          protocolsResponse.json().catch(() => [])
        ]);

      setContentCounts({
        education: educationResponse.ok ? getArrayCount(educationData) : 0,
        questionnaires: questionnairesResponse.ok
          ? getArrayCount(questionnairesData)
          : 0,
        protocols: protocolsResponse.ok ? getArrayCount(protocolsData) : 0
      });
    } catch (error) {
      console.error('Error al cargar contadores de inicio:', error);

      setContentCounts({
        education: 0,
        questionnaires: 0,
        protocols: 0
      });
    } finally {
      setIsLoadingCounts(false);
    }
  };

  const loadActivities = async () => {
    try {
      setIsLoadingActivities(true);
      setActivitiesError('');

      const response = await fetch(`${API_URL}/api/activities?page=1&limit=6`);
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            'No se pudieron cargar las actividades'
        );
      }

      const activitiesPayload: Activity[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : [];

      const normalizedActivities = activitiesPayload.map((activity) =>
        normalizeActivity(activity)
      );

      setActivities(normalizedActivities);
    } catch (error: any) {
      console.error('Error al cargar actividades:', error);
      setActivitiesError(error?.message || 'No se pudieron cargar las actividades.');
      setActivities([]);
    } finally {
      setIsLoadingActivities(false);
    }
  };

  useEffect(() => {
    loadActivities();
    loadContentCounts();

    const activitiesHandler = () => loadActivities();
    const educationHandler = () => loadContentCounts();
    const questionnairesHandler = () => loadContentCounts();
    const protocolosHandler = () => loadContentCounts();

    window.addEventListener('activities-updated', activitiesHandler);
    window.addEventListener('education-updated', educationHandler);
    window.addEventListener('questionnaires-updated', questionnairesHandler);
    window.addEventListener('protocolos-updated', protocolosHandler);

    return () => {
      window.removeEventListener('activities-updated', activitiesHandler);
      window.removeEventListener('education-updated', educationHandler);
      window.removeEventListener('questionnaires-updated', questionnairesHandler);
      window.removeEventListener('protocolos-updated', protocolosHandler);
    };
  }, []);

  const upcomingActivities = useMemo(() => {
    return activities.slice(0, 6);
  }, [activities]);

  return (
    <IonPage>
      <Navbar />

      <IonContent className="inicio-content-page">
        <div className="inicio-shell">
          <header className="inicio-hero-card">
            <div>
              <span className="inicio-kicker">Panel personal</span>

              <h1>Hola, {userName}</h1>

              <p>
                Revisa tu actividad, accede a módulos educativos, consulta
                cuestionarios y mantente al día con las acciones municipales de
                ciberseguridad.
              </p>
            </div>

            <div className="inicio-profile-card">
              <span>Cuenta</span>
              <strong>{user?.role === 'admin' ? 'Administrador' : 'Usuario'}</strong>
            </div>
          </header>

          {user && (
            <section className="inicio-user-summary">
              <div>
                <strong>Nombre</strong>
                <span>{userName}</span>
              </div>

              <div>
                <strong>RUT</strong>
                <span>{user.rut || 'No registrado'}</span>
              </div>

              <div>
                <strong>Ubicación</strong>
                <span>
                  {user.comuna || 'Comuna'}, {user.region || 'Región'}
                </span>
              </div>

              <div>
                <strong>Correo</strong>
                <span>{user.email || user.correo || 'Sin correo'}</span>
              </div>
            </section>
          )}

          <section className="inicio-stats-grid">
            <StatCard
              icon={checkmarkCircleOutline}
              label="Estado de cuenta"
              value="Activa"
            />

            <StatCard
              icon={schoolOutline}
              label="Módulos educativos"
              value={isLoadingCounts ? '...' : String(contentCounts.education)}
            />

            <StatCard
              icon={documentTextOutline}
              label="Cuestionarios"
              value={isLoadingCounts ? '...' : String(contentCounts.questionnaires)}
            />

            <StatCard
              icon={shieldCheckmarkOutline}
              label="Protocolos"
              value={isLoadingCounts ? '...' : String(contentCounts.protocols)}
            />
          </section>

          <section className="inicio-main-grid">
            <div className="inicio-progress-section">
              <Progress />
            </div>

            <section className="inicio-shortcuts-section">
              <div className="inicio-section-header">
                <div>
                  <span className="section-eyebrow">Accesos rápidos</span>
                  <h2>Continúa navegando</h2>
                  <p>
                    Entra rápidamente a las secciones principales de la
                    plataforma.
                  </p>
                </div>
              </div>

              <div className="inicio-shortcuts-grid">
                <Link to="/educacion" className="inicio-shortcut-card">
                  <IonIcon icon={schoolOutline} />
                  <div>
                    <strong>Educación</strong>
                    <span>{contentCounts.education} módulo(s)</span>
                  </div>
                </Link>

                <Link to="/cuestionarios" className="inicio-shortcut-card">
                  <IonIcon icon={documentTextOutline} />
                  <div>
                    <strong>Cuestionarios</strong>
                    <span>{contentCounts.questionnaires} disponible(s)</span>
                  </div>
                </Link>

                <Link to="/protocolos" className="inicio-shortcut-card">
                  <IonIcon icon={shieldCheckmarkOutline} />
                  <div>
                    <strong>Protocolos</strong>
                    <span>{contentCounts.protocols} documento(s)</span>
                  </div>
                </Link>
              </div>
            </section>
          </section>

          <section className="activities-dashboard-section">
            <div className="activities-dashboard-header">
              <div>
                <span className="section-eyebrow">Calendario municipal</span>
                <h2>Próximas actividades</h2>
                <p>
                  Revisa las actividades publicadas por la municipalidad.
                </p>
              </div>

              <span className="activities-counter">
                {activities.length} actividad{activities.length === 1 ? '' : 'es'}
              </span>
            </div>

            {isLoadingActivities ? (
              <ContentState
                variant="loading"
                title="Cargando actividades"
                message="Estamos obteniendo la programación municipal."
              />
            ) : activitiesError ? (
              <ContentState
                variant="error"
                title="No se pudieron cargar las actividades"
                message={activitiesError}
                actionLabel="Intentar nuevamente"
                onAction={loadActivities}
              />
            ) : upcomingActivities.length === 0 ? (
              <ContentState
                variant="empty"
                title="No hay actividades disponibles"
                message="Revisa nuevamente cuando la municipalidad publique actividades."
              />
            ) : (
              <div className="activities-dashboard-grid">
                {upcomingActivities.map((activity) => (
                  <article key={activity.id} className="activity-dashboard-card">
                    <div className="activity-dashboard-icon">
                      <IonIcon icon={calendarOutline} />
                    </div>

                    <div className="activity-dashboard-info">
                      <h3>{activity.title}</h3>
                      <p>{activity.description}</p>

                      <span>
                        <IonIcon icon={timeOutline} />
                        {activity.date}
                      </span>
                    </div>
                  </article>
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

export default InicioPage;
