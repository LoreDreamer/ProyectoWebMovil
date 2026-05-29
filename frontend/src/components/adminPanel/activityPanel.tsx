import React, { useEffect, useState } from 'react';
import {
  IonIcon,
  IonButton,
  IonInput,
  IonTextarea,
  IonSearchbar
} from '@ionic/react';
import {
  addOutline,
  calendarOutline,
  createOutline,
  trashOutline,
  closeCircleOutline
} from 'ionicons/icons';
import { useAuth } from '../../context/AuthContext';
import './activityPanel.css';

interface Activity {
  id: string;

  title: string;
  titulo?: string;

  description: string;
  descripcion?: string;

  date: string;
  fecha?: string;

  createdAt?: string | null;
  publicado_por?: string | null;
  host?: string | null;
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

export const ActivityPanel: React.FC = () => {
  const { user, token } = useAuth();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');

  const isAdmin = user?.role === 'admin';

  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };
  };

  const normalizeActivityFromApi = (activity: Activity): Activity => {
    const normalizedTitle = activity.title || activity.titulo || '';
    const normalizedDescription =
      activity.description || activity.descripcion || '';
    const normalizedDate = activity.date || activity.fecha || '';

    return {
      ...activity,
      id: String(activity.id),
      title: normalizedTitle,
      titulo: normalizedTitle,
      description: normalizedDescription,
      descripcion: normalizedDescription,
      date: formatDateForInput(normalizedDate),
      fecha: activity.fecha || normalizedDate,
      publicado_por: activity.publicado_por || activity.host || null
    };
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDate('');
    setEditingActivity(null);
  };

  const loadActivities = async () => {
    try {
      const response = await fetch(`${API_URL}/api/activities`);

      if (!response.ok) {
        throw new Error('No se pudieron cargar las actividades');
      }

      const data = await response.json();

      setActivities(
        Array.isArray(data)
          ? data.map((activity) => normalizeActivityFromApi(activity))
          : []
      );
    } catch (error) {
      console.error('Error al cargar actividades:', error);
      setActivities([]);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;

    loadActivities();

    const handler = () => loadActivities();
    window.addEventListener('activities-updated', handler);

    return () => {
      window.removeEventListener('activities-updated', handler);
    };
  }, [isAdmin, token]);

  const filteredActivities = activities.filter((activity) => {
    const normalizedSearch = searchTerm.toLowerCase();

    return (
      activity.title.toLowerCase().includes(normalizedSearch) ||
      activity.description.toLowerCase().includes(normalizedSearch) ||
      activity.date.toLowerCase().includes(normalizedSearch) ||
      formatDateForView(activity.date).toLowerCase().includes(normalizedSearch)
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !date.trim()) {
      alert('Completa título, descripción y fecha.');
      return;
    }

    if (!token) {
      alert('Debes iniciar sesión como administrador.');
      return;
    }

    const payload = {
      title: title.trim(),
      titulo: title.trim(),
      description: description.trim(),
      descripcion: description.trim(),
      date,
      fecha: date
    };

    try {
      let response: Response;

      if (editingActivity) {
        response = await fetch(
          `${API_URL}/api/activities/${editingActivity.id}`,
          {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
          }
        );
      } else {
        response = await fetch(`${API_URL}/api/activities`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message ||
            errorData?.error ||
            'Error al guardar actividad'
        );
      }

      resetForm();
      await loadActivities();
      window.dispatchEvent(new Event('activities-updated'));

      alert(
        editingActivity
          ? 'Actividad actualizada correctamente.'
          : 'Actividad creada correctamente.'
      );
    } catch (error: any) {
      console.error('Error al guardar actividad:', error);
      alert(error.message || 'Error al guardar actividad.');
    }
  };

  const handleEdit = (activity: Activity) => {
    const normalizedActivity = normalizeActivityFromApi(activity);

    setEditingActivity(normalizedActivity);
    setTitle(normalizedActivity.title);
    setDescription(normalizedActivity.description);
    setDate(normalizedActivity.date);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar esta actividad?')) return;

    if (!token) {
      alert('Debes iniciar sesión como administrador.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/activities/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message ||
            errorData?.error ||
            'Error al eliminar actividad'
        );
      }

      await loadActivities();
      window.dispatchEvent(new Event('activities-updated'));

      if (editingActivity?.id === id) {
        resetForm();
      }

      alert('Actividad eliminada correctamente.');
    } catch (error: any) {
      console.error('Error al eliminar actividad:', error);
      alert(error.message || 'Error al eliminar actividad.');
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="activity-admin-panel">
      <section className="panel-form-section">
        <div className="admin-form-card">
          <div className="form-header-inline">
            <div className="icon-square">
              <IonIcon icon={calendarOutline} />
            </div>

            <div className="header-text-container">
              <h2>{editingActivity ? 'Editar Actividad' : 'Nueva Actividad'}</h2>

              <p>
                Publica actividades educativas o municipales visibles para los
                usuarios.
              </p>
            </div>

            {editingActivity && (
              <IonButton
                fill="clear"
                onClick={resetForm}
                className="cancel-edit-btn"
              >
                <IonIcon icon={closeCircleOutline} />
              </IonButton>
            )}
          </div>

          <form className="admin-form-body" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Título</label>

              <IonInput
                placeholder="Título de la actividad"
                value={title}
                onIonChange={(e) => setTitle(String(e.detail.value || ''))}
                className="custom-input"
              />
            </div>

            <div className="form-group">
              <label>Descripción</label>

              <IonTextarea
                placeholder="Descripción de la actividad"
                rows={4}
                value={description}
                onIonChange={(e) =>
                  setDescription(String(e.detail.value || ''))
                }
                className="custom-textarea"
              />
            </div>

            <div className="form-group">
              <label>Fecha</label>

              <IonInput
                type="date"
                value={date}
                onIonChange={(e) => setDate(String(e.detail.value || ''))}
                className="custom-input"
              />
            </div>

            <div className="form-footer">
              <button type="submit" className="btn-submit">
                <IonIcon icon={addOutline} />
                {editingActivity ? 'Guardar Cambios' : 'Crear Actividad'}
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="panel-list-section">
        <div className="panel-section-header">
          <div>
            <h2>Actividades publicadas ({activities.length})</h2>
            <p>Busca, edita o elimina las actividades existentes.</p>
          </div>

          <IonSearchbar
            value={searchTerm}
            placeholder="Buscar actividad..."
            onIonChange={(e) => setSearchTerm(e.detail.value || '')}
            mode="ios"
          />
        </div>

        <div className="activities-list">
          {filteredActivities.length === 0 ? (
            <p>No hay actividades disponibles.</p>
          ) : (
            filteredActivities.map((activity) => (
              <article key={activity.id} className="activity-item">
                <div className="activity-info">
                  <h4>{activity.title}</h4>

                  <p>{activity.description}</p>

                  <div className="activity-meta">
                    <span>{formatDateForView(activity.date)}</span>
                  </div>
                </div>

                <div className="activity-actions">
                  <IonButton
                    fill="clear"
                    size="small"
                    className="activity-action-button"
                    onClick={() => handleEdit(activity)}
                  >
                    <IonIcon icon={createOutline} />
                    Editar
                  </IonButton>

                  <IonButton
                    fill="clear"
                    size="small"
                    className="activity-action-button delete-btn"
                    onClick={() => handleDelete(activity.id)}
                  >
                    <IonIcon icon={trashOutline} />
                    Eliminar
                  </IonButton>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default ActivityPanel;