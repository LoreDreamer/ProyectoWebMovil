import React, { useState, useEffect } from 'react';
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
  eyeOutline,
  cloudUploadOutline
} from 'ionicons/icons';
import { useAuth } from '../../context/AuthContext';
import './alertsPanel.css';

interface Alert {
  id: number;
  title: string;
  description: string;
  image: string;
  createdAt: string;
}

export const AlertsPanel: React.FC = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [viewItem, setViewItem] = useState<Alert | null>(null);

  if (!user || user.role !== 'admin') return null;

  const loadAlerts = () => {
    fetch('http://localhost:3000/api/alerts')
      .then(res => res.json())
      .then(data => setAlerts(data))
      .catch(err => console.log(err));
  };

  useEffect(() => {
    loadAlerts();
    
    const handler = () => loadAlerts();
    window.addEventListener('alerts-updated', handler);
    return () => window.removeEventListener('alerts-updated', handler);
  }, []);

  const filteredAlerts = alerts.filter(alert =>
    alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setImagePreview('');
    setEditingAlert(null);
  };

  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      alert('Completa título y descripción');
      return;
    }

    const payload = { title, description, image: imagePreview };

    try {
      let response: Response;
      
      if (editingAlert) {
        response = await fetch(`http://localhost:3000/api/alerts/${editingAlert.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch('http://localhost:3000/api/alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      
      if (!response.ok) throw new Error();

      resetForm();
      loadAlerts();
      window.dispatchEvent(new Event('alerts-updated'));
    } catch {
      alert('Error al guardar la alerta');
    }
  };

  const handleEdit = (alert: Alert) => {
    setEditingAlert(alert);
    setTitle(alert.title);
    setDescription(alert.description);
    setImagePreview(alert.image);
    setViewItem(null);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar esta alerta?')) return;
    
    try {
      const response = await fetch(`http://localhost:3000/api/alerts/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error();
      loadAlerts();
      window.dispatchEvent(new Event('alerts-updated'));
    } catch {
      alert('Error al eliminar');
    }
  };

  const handleView = (alert: Alert) => {
    setViewItem(alert);
  };

  return (
    <div className="alerts-admin-panel">
      <section className="panel-form-section">
        <div className="admin-form-card">
          <div className="form-header-inline">
            <div className="icon-square">
              <IonIcon icon={addOutline} />
            </div>
            <div className="header-text-container">
              <h2>{editingAlert ? 'Editar Alerta' : 'Nueva Alerta'}</h2>
              <p>Agrega un aviso corto con imagen y descripción.</p>
            </div>
            {editingAlert && (
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
                placeholder="Título de la alerta"
                value={title}
                onIonChange={(e) => setTitle(e.detail.value!)}
                className="custom-input"
              />
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <IonTextarea
                placeholder="Descripción breve"
                rows={4}
                value={description}
                onIonChange={(e) => setDescription(e.detail.value!)}
                className="custom-textarea"
              />
            </div>

            <div className="form-group">
              <label>Imagen</label>
              <div
                className="file-drop-zone"
                onDrop={(e) => {
                  e.preventDefault();
                  handleImageUpload(e.dataTransfer.files[0]);
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                <div className="file-drop-content">
                  <IonIcon icon={cloudUploadOutline} />
                  <span>Arrastra una imagen o selecciona archivo</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="file-input"
                  onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])}
                />
              </div>
              {imagePreview && (
                <div className="image-preview-box">
                  <img src={imagePreview} alt="preview" />
                </div>
              )}
            </div>

            <div className="form-footer">
              <button type="submit" className="btn-submit">
                {editingAlert ? 'Guardar Cambios' : 'Crear Alerta'}
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="panel-list-section">
        <div className="panel-section-header">
          <div>
            <h2>Alertas publicadas</h2>
            <p>Busca, edita o elimina las alertas existentes.</p>
          </div>
          <IonSearchbar
            value={searchTerm}
            placeholder="Buscar alerta..."
            onIonChange={(e) => setSearchTerm(e.detail.value || '')}
            mode="ios"
          />
        </div>

        <div className="alerts-grid">
          {filteredAlerts.map((alert) => (
            <article key={alert.id} className="alert-card">
              <div className="card-image-wrap">
                <img src={alert.image} alt={alert.title} />
              </div>
              <h2>{alert.title}</h2>
              <p>{alert.description}</p>
              <div className="card-meta">
                <span>{alert.createdAt}</span>
              </div>
              <div className="card-actions">
                <IonButton fill="clear" size="small" onClick={() => handleView(alert)}>
                  <IonIcon icon={eyeOutline} /> Leer más
                </IonButton>
                <IonButton fill="clear" size="small" onClick={() => handleEdit(alert)}>
                  <IonIcon icon={createOutline} /> Editar
                </IonButton>
                <IonButton fill="clear" size="small" onClick={() => handleDelete(alert.id)}>
                  <IonIcon icon={trashOutline} /> Eliminar
                </IonButton>
              </div>
            </article>
          ))}
        </div>

        {viewItem && (
          <div className="detail-panel">
            <h3>Vista rápida</h3>
            <div className="alert-detail-card">
              <div className="card-image-wrap">
                <img src={viewItem.image} alt={viewItem.title} />
              </div>
              <h2>{viewItem.title}</h2>
              <p>{viewItem.description}</p>
              <div className="card-meta">
                <span>{viewItem.createdAt}</span>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default AlertsPanel;