import React from 'react';
import { refreshOutline, trashOutline } from 'ionicons/icons';
import { IonIcon } from '@ionic/react';
import { buildResourceUrl } from '@/shared/api/apiClient';
import { useAdminComplaints } from '@/features/admin/hooks/useAdminComplaints';
import './AdminComplaintsPanel.css';

const truncateText = (value: string, maxLength = 170) => {
  if (value.length <= maxLength) return value;

  return `${value.substring(0, maxLength).trim()}...`;
};

export const AdminComplaintsPanel: React.FC = () => {
  const {
    complaints,
    complaintsError,
    complaintsSuccess,
    isLoadingComplaints,
    isDeletingComplaint,
    loadComplaints,
    deleteComplaint
  } = useAdminComplaints();

  const handleDeleteComplaint = async (id: string, nombreCompleto: string) => {
    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar la denuncia de ${nombreCompleto}? Esta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    await deleteComplaint(id);
  };

  return (
    <section className="panel-list-section admin-complaints-panel">
      <div className="panel-section-header admin-complaints-header">
        <div>
          <span className="admin-complaints-kicker">Denuncias</span>
          <h2>Denuncias recibidas</h2>
          <p>
            Revisa las denuncias enviadas por usuarios y elimina registros cuando
            corresponda.
          </p>
        </div>

        <button
          type="button"
          className="admin-complaints-refresh-btn"
          disabled={isLoadingComplaints}
          onClick={loadComplaints}
        >
          <IonIcon icon={refreshOutline} />
          {isLoadingComplaints ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {complaintsError && (
        <div className="admin-complaints-message admin-complaints-message-error">
          {complaintsError}
        </div>
      )}

      {complaintsSuccess && (
        <div className="admin-complaints-message admin-complaints-message-success">
          {complaintsSuccess}
        </div>
      )}

      {isLoadingComplaints ? (
        <div className="admin-complaints-empty">Cargando denuncias...</div>
      ) : complaints.length === 0 ? (
        <div className="admin-complaints-empty">
          No hay denuncias registradas por el momento.
        </div>
      ) : (
        <div className="admin-complaints-list">
          {complaints.map((complaint) => (
            <article key={complaint.id} className="admin-complaint-card">
              <div className="admin-complaint-main">
                <div className="admin-complaint-title-row">
                  <div>
                    <h3>{complaint.nombreCompleto}</h3>
                    <span>{complaint.correo}</span>
                  </div>

                  <strong>{complaint.tipoIncidente}</strong>
                </div>

                <div className="admin-complaint-meta-grid">
                  <div>
                    <span>Fecha incidente</span>
                    <strong>{complaint.fechaIncidente}</strong>
                  </div>

                  <div>
                    <span>Fecha registro</span>
                    <strong>{complaint.fechaRegistro}</strong>
                  </div>

                  <div>
                    <span>Archivos</span>
                    <strong>{complaint.archivos.length}</strong>
                  </div>
                </div>

                <p className="admin-complaint-description">
                  {truncateText(complaint.descripcion)}
                </p>

                {complaint.archivos.length > 0 && (
                  <div className="admin-complaint-files">
                    {complaint.archivos.map((fileItem) => (
                      <a
                        key={fileItem.id}
                        href={buildResourceUrl(fileItem.url)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {fileItem.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <div className="admin-complaint-actions">
                <button
                  type="button"
                  className="admin-complaint-delete-btn"
                  disabled={isDeletingComplaint}
                  onClick={() =>
                    handleDeleteComplaint(
                      complaint.id,
                      complaint.nombreCompleto
                    )
                  }
                >
                  <IonIcon icon={trashOutline} />
                  Eliminar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default AdminComplaintsPanel;
