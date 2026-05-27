import { useEffect, useState } from 'react';
import { IonContent, IonIcon, IonPage } from '@ionic/react';
import { Navbar, StatCard, Progress, NewsPanel, Footer } from '../../components';
import {
  listOutline,
  eyeOutline,
  sendOutline,
  checkmarkCircleOutline,
  calendarOutline
} from 'ionicons/icons';
import { useAuth } from '../../context/AuthContext';
import './InicioPage.css';

interface Activity {
  id: string;

  title?: string;
  titulo?: string;

  description?: string;
  descripcion?: string;

  date?: string;
  fecha?: string | null;

  host?: string | null;
  publicado_por?: string | null;
}

interface NormalizedActivity {
  id: string;
  title: string;
  description: string;
  date: string;
  rawDate: string;
}

const API_URL = 'http://localhost:3000';

const formatDateForInput = (date?: string | null) => {
  if (!date) return '';

  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }

  return parsedDate.toISOString().split('T')[0];
};

const formatDateForView = (date?: string | null) => {
  if (!date) return 'Sin fecha';

  const inputDate = formatDateForInput(date);

  if (!inputDate) return 'Sin fecha';

  const [year, month, day] = inputDate.split('-');

  return `${day}-${month}-${year}`;
};

export const InicioPage: React.FC = () => {
  const { user } = useAuth();

  const [activities, setActivities] = useState<NormalizedActivity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);

  const nombreCompleto = user?.nombre_completo || user?.name || 'Usuario';
  const primerNombre = nombreCompleto.split(' ')[0] || 'Usuario';

  const rut = user?.rut || 'No disponible';
  const region = user?.region || '';
  const comuna = user?.comuna || '';
  const correo = user?.correo || user?.email || 'No disponible';

  const ubicacion =
    comuna && region
      ? `${comuna}, ${region}`
      : comuna || region || 'No disponible';

  const normalizeActivity = (activity: Activity): NormalizedActivity => {
    const rawDate = activity.fecha || activity.date || '';

    return {
      id: String(activity.id),
      title: activity.title || activity.titulo || 'Actividad municipal',
      description:
        activity.description ||
        activity.descripcion ||
        'Actividad disponible para la comunidad.',
      date: formatDateForView(rawDate),
      rawDate: formatDateForInput(rawDate)
    };
  };

  const loadActivities = async () => {
    try {
      setIsLoadingActivities(true);

      const response = await fetch(`${API_URL}/api/activities`);

      if (!response.ok) {
        throw new Error('No se pudieron cargar las actividades');
      }

      const data = await response.json();

      const normalizedActivities = Array.isArray(data)
        ? data.map((activity) => normalizeActivity(activity))
        : [];

      setActivities(normalizedActivities);
    } catch (error) {
      console.error('Error al cargar actividades:', error);
      setActivities([]);
    } finally {
      setIsLoadingActivities(false);
    }
  };

  useEffect(() => {
    loadActivities();

    const handler = () => loadActivities();
    window.addEventListener('activities-updated', handler);

    return () => {
      window.removeEventListener('activities-updated', handler);
    };
  }, []);

  return (
    <IonPage>
      <Navbar />

      <IonContent className="inicio-content-page">
        <div className="central-container">
          <div className="welcome-section">
            <h1>BIENVENID@, {primerNombre.toUpperCase()}!</h1>

            <p>
              Bienvenid@ de vuelta. Aquí tienes un resumen de tu actividad y
              alertas recientes.
            </p>

            {user && (
              <div className="user-profile-summary">
                <div>
                  <strong>Nombre completo</strong>
                  <span>{nombreCompleto}</span>
                </div>

                <div>
                  <strong>RUT</strong>
                  <span>{rut}</span>
                </div>

                <div>
                  <strong>Ubicación</strong>
                  <span>{ubicacion}</span>
                </div>

                <div>
                  <strong>Correo</strong>
                  <span>{correo}</span>
                </div>
              </div>
            )}
          </div>

          <div className="stats-grid">
            <StatCard
              icon={listOutline}
              label="CUESTIONARIOS COMPLETADOS"
              value="3"
            />

            <StatCard
              icon={eyeOutline}
              label="MÓDULOS VISTOS"
              value="5"
            />

            <StatCard
              icon={sendOutline}
              label="DENUNCIAS ENVIADAS"
              value="0"
            />

            <StatCard
              icon={checkmarkCircleOutline}
              label="CURSOS COMPLETADOS"
              value="1"
            />
          </div>

          <section className="activities-dashboard-section">
            <div className="activities-dashboard-header">
              <div>
                <h2>Actividades disponibles</h2>

                <p>
                  Revisa las próximas actividades educativas y municipales
                  publicadas por el equipo administrador.
                </p>
              </div>

              <span className="activities-counter">
                {activities.length} actividad(es)
              </span>
            </div>

            {isLoadingActivities ? (
              <div className="activities-empty-state">
                Cargando actividades...
              </div>
            ) : activities.length === 0 ? (
              <div className="activities-empty-state">
                No hay actividades disponibles por el momento.
              </div>
            ) : (
              <div className="activities-dashboard-grid">
                {activities.map((activity) => (
                  <article
                    key={activity.id}
                    className="activity-dashboard-card"
                  >
                    <div className="activity-dashboard-icon">
                      <IonIcon icon={calendarOutline} />
                    </div>

                    <div className="activity-dashboard-info">
                      <h3>{activity.title}</h3>

                      <p>{activity.description}</p>

                      <span>{activity.date}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <div className="main-grid">
            <Progress />
            <NewsPanel />
          </div>
        </div>

        <Footer />
      </IonContent>
    </IonPage>
  );
};

export default InicioPage;