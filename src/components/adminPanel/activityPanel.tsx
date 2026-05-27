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
  createOutline,
  trashOutline,
  closeCircleOutline,
  calendarOutline
} from 'ionicons/icons';
import { useAuth } from '../../context/AuthContext';
import './activityPanel.css';

interface Activity {
  id: number;
  title: string;
  description: string;
  date: string;
  createdAt: string;
}

export const ActivityPanel: React.FC = () => {
  const { user } = useAuth();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');

  const [viewItem, setViewItem] = useState<Activity | null>(null);

  const isAdmin = user?.role === 'admin';

  const loadActivities = () => {
    try {
      const storedActivities = localStorage.getItem('activities');

      if (storedActivities) {
        setActivities(JSON.parse(storedActivities));
      } else {
        setActivities([]);
      }
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
  }, [isAdmin]);

  const filteredActivities = activities.filter((activity) =>
    activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDate('');
    setEditingActivity(null);
  };

  const saveActivities = (updatedActivities: Activity[]) => {
    setActivities(updatedActivities);
    localStorage.setItem('activities', JSON.stringify(updatedActivities));
    window.dispatchEvent(new Event('activities-updated'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !date.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      if (editingActivity) {
        const updatedActivities = activities.map((activity) =>
          activity.id === editingActivity.id
            ? {
                ...activity,
                title: title.trim(),
                description: description.trim(),
                date
              }
            : activity
        );

        saveActivities(updatedActivities);
        alert('Actividad actualizada con éxito');
      } else {
        const newActivity: Activity = {
          id: Date.now(),
          title: title.trim(),
          description: description.trim(),
          date,
          createdAt: new Date().toISOString()
        };

        saveActivities([newActivity, ...activities]);
        alert('Actividad publicada con éxito');
      }

      resetForm();
      setViewItem(null);
    } catch (error) {
      console.error('Error al guardar actividad:', error);
      alert('Error al guardar la actividad');
    }
  };

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setTitle(activity.title);
    setDescription(activity.description);
    setDate(activity.date);
    setViewItem(null);
  };

  const handleDelete = (id: number) => {
    if (!window.confirm('¿Eliminar esta actividad?')) return;

    try {
      const updatedActivities = activities.filter((activity) => activity.id !== id);
      saveActivities(updatedActivities);

      if (viewItem?.id === id) {
        setViewItem(null);
      }

      alert('Actividad eliminada');
    } catch (error) {
      console.error('Error al eliminar actividad:', error);
      alert('Error al eliminar');
    }
  };

  const handleView = (activity: Activity) => {
    setViewItem(activity);
  };

  const formatDate = (value: string) => {
    if (!value) return 'Sin fecha';

    const dateValue = new Date(value);

    if (Number.isNaN(dateValue.getTime())) {
      return value;
    }

    return dateValue.toLocaleDateString();
  };

  if (!isAdmin) return null;

  return (
    <div className="activity-admin-panel">
      <section className="panel-form-section">
        <div className="admin-form-card">
          <div className="form-header-inline">
            <div className="icon-square">
              <IonIcon icon={addOutline} />
            </div>

            <div className="header-text-container">
              <h2>{editingActivity ? 'Editar Actividad' : 'Nueva Actividad'}</h2>
              <p>Programa una nueva actividad o capacitación.</p>
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
                onIonChange={(e) => setTitle(e.detail.value || '')}
                className="custom-input"
              />
            </div>

            <div className="form-group">
              <label>Descripción</label>

              <IonTextarea
                placeholder="Descripción detallada"
                rows={4}
                value={description}
                onIonChange={(e) => setDescription(e.detail.value || '')}
                className="custom-textarea"
              />
            </div>

            <div className="form-group">
              <label>Fecha</label>

              <input
                type="date"
                className="custom-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="form-footer">
              <button type="submit" className="btn-submit">
                {editingActivity ? 'Guardar Cambios' : 'Publicar Actividad'}
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="panel-list-section">
        <div className="panel-section-header">
          <div>
            <h2>Actividades Programadas ({activities.length})</h2>
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
              <div key={activity.id} className="activity-item">
                <div className="activity-info">
                  <h4>{activity.title}</h4>
                  <p>{activity.description}</p>

                  <div className="activity-meta">
                    <span>📅 {formatDate(activity.date)}</span>
                    <span>📌 Creado: {formatDate(activity.createdAt)}</span>
                  </div>
                </div>

                <div className="activity-actions">
                  <IonButton
                    fill="clear"
                    size="small"
                    className="activity-action-button"
                    onClick={() => handleView(activity)}
                  >
                    <IonIcon icon={calendarOutline} />
                    Ver
                  </IonButton>

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
              </div>
            ))
          )}
        </div>

        {viewItem && (
          <div className="activity-detail-panel">
            <h3>Detalles de la Actividad</h3>

            <div className="activity-detail-card">
              <h2>{viewItem.title}</h2>
              <p>{viewItem.description}</p>

              <div className="activity-meta">
                <span>📅 Fecha: {formatDate(viewItem.date)}</span>
                <span>📌 Creado: {formatDate(viewItem.createdAt)}</span>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default ActivityPanel;