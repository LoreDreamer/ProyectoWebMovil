import React from 'react';
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
import {
  formatDateForView,
  useActivityAdmin
} from '@/features/admin/hooks/useActivityAdmin';
import './ActivityPanel.css';

export const ActivityPanel: React.FC = () => {
  const {
    activities,
    filteredActivities,
    searchTerm,
    setSearchTerm,
    editingActivity,
    title,
    setTitle,
    description,
    setDescription,
    date,
    setDate,
    isAdmin,
    resetForm,
    handleSubmit,
    handleEdit,
    handleDelete
  } = useActivityAdmin();

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
                onIonChange={(e) => setDescription(String(e.detail.value || ''))}
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
