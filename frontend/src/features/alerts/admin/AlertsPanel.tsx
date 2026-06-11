import React, { useEffect, useRef, useState } from 'react';
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
import { useAuth } from '@/context/AuthContext';
import './AlertsPanel.css';
import { API_URL } from '@/shared/api/apiClient';
import { notify } from '@/shared/notifications';

interface AlertImage {
  id: string;
  name: string;
  previewUrl: string;
  url?: string;
  path?: string;
  type?: string;
  size?: number | null;
  order: number;
  file?: File;
}

interface Alert {
  id: string;
  title: string;
  titulo?: string;
  description: string;
  resumen?: string;
  cuerpo?: string;
  image: string;
  imagen_url?: string;
  coverName?: string;
  imagen_nombre?: string;
  images?: AlertImage[];
  imagenes?: AlertImage[];
  createdAt: string;
  fecha?: string;
  publicado_por?: string;
  autorNombre?: string;
  autorCorreo?: string;
  writtenBy?: string;
  escrito_por?: string; 
}

const MAX_ALERT_IMAGES = 10;

export const AlertsPanel: React.FC = () => {
  const { user, token } = useAuth();

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [writtenBy, setWrittenBy] = useState('');

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [coverName, setCoverName] = useState('');
  const [removeCover, setRemoveCover] = useState(false);

  const [alertImages, setAlertImages] = useState<AlertImage[]>([]);
  const [viewItem, setViewItem] = useState<Alert | null>(null);

  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const alertImagesInputRef = useRef<HTMLInputElement | null>(null);
  const alertImagesRef = useRef<AlertImage[]>([]);
  const coverFileRef = useRef<File | null>(null);
  const coverPreviewRef = useRef('');

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    alertImagesRef.current = alertImages;
  }, [alertImages]);

  useEffect(() => {
    coverFileRef.current = coverFile;
    coverPreviewRef.current = coverPreview;
  }, [coverFile, coverPreview]);

  useEffect(() => {
    return () => {
      alertImagesRef.current.forEach((image) => {
        if (image.file && image.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(image.previewUrl);
        }
      });

      if (
        coverFileRef.current &&
        coverPreviewRef.current.startsWith('blob:')
      ) {
        URL.revokeObjectURL(coverPreviewRef.current);
      }
    };
  }, []);

  const getAuthHeaders = (): Record<string, string> | undefined => {
    if (!token) return undefined;

    return {
      Authorization: `Bearer ${token}`
    };
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

    if (url.startsWith('/')) {
      return `${API_URL}${url}`;
    }

    return `${API_URL}/${url}`;
  };

  const formatDateTime = (date?: string) => {
    if (!date) return '';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate
      .toLocaleString('es-CL', {
        timeZone: 'America/Santiago',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
      .replace(',', ' ·');
  };

  const normalizeImageOrder = (images: AlertImage[]) => {
    return images.map((image, index) => ({
      ...image,
      order: index + 1
    }));
  };

  const resetInputs = () => {
    if (coverInputRef.current) {
      coverInputRef.current.value = '';
    }

    if (alertImagesInputRef.current) {
      alertImagesInputRef.current.value = '';
    }
  };

  const clearLocalPreviewUrls = () => {
    alertImages.forEach((image) => {
      if (image.file && image.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(image.previewUrl);
      }
    });

    if (coverFile && coverPreview.startsWith('blob:')) {
      URL.revokeObjectURL(coverPreview);
    }
  };

  const resetForm = () => {
    clearLocalPreviewUrls();

    setTitle('');
    setDescription('');

    setWrittenBy('');

    setCoverFile(null);
    setCoverPreview('');
    setCoverName('');
    setRemoveCover(false);

    setAlertImages([]);
    setEditingAlert(null);
    setViewItem(null);

    resetInputs();
  };

  const loadAlerts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/alerts`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        console.error('Error backend /api/alerts:', data);

        throw new Error(
          data?.message ||
            data?.error ||
            'No se pudieron cargar las alertas'
        );
      }

      setAlerts(
        Array.isArray(data)
          ? data.map((alert: Alert) => ({
              ...alert,
              id: String(alert.id),

              title: alert.title || alert.titulo || '',

              writtenBy: alert.writtenBy || alert.escrito_por || '',

              description:
                alert.description ||
                alert.cuerpo ||
                alert.resumen ||
                '',

              image: buildFileUrl(alert.image || alert.imagen_url || ''),

              coverName:
                alert.coverName ||
                alert.imagen_nombre ||
                '',

              createdAt: formatDateTime(alert.createdAt || alert.fecha || ''),

              images: normalizeImageOrder(
                (alert.images || alert.imagenes || []).map((image, index) => {
                  const rawUrl =
                    image.previewUrl ||
                    image.url ||
                    image.path ||
                    '';

                  return {
                    ...image,
                    id:
                      image.id ||
                      `${index + 1}-${rawUrl}`,

                    name:
                      image.name ||
                      `imagen-${index + 1}`,

                    previewUrl:
                      buildFileUrl(rawUrl),

                    url:
                      buildFileUrl(image.url || rawUrl),

                    path:
                      image.path ||
                      image.url ||
                      image.previewUrl ||
                      '',

                    type:
                      image.type ||
                      '',

                    size:
                      typeof image.size === 'number'
                        ? image.size
                        : null,

                    order:
                      index + 1
                  };
                })
              )
            }))
          : []
      );
    } catch (error) {
      console.error('Error al cargar alertas:', error);
      setAlerts([]);
    }
  };

  useEffect(() => {
    loadAlerts();

    const handler = () => loadAlerts();
    window.addEventListener('alerts-updated', handler);

    return () => {
      window.removeEventListener('alerts-updated', handler);
    };
  }, [token]);

  const filteredAlerts = alerts.filter((alert) =>
    alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (alert.autorNombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (alert.writtenBy || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCoverUpload = (file?: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      notify.warning('Solo puedes adjuntar imágenes.');
      return;
    }

    if (coverFile && coverPreview.startsWith('blob:')) {
      URL.revokeObjectURL(coverPreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setCoverFile(file);
    setCoverPreview(previewUrl);
    setCoverName(file.name);
    setRemoveCover(false);
  };

  const handleRemoveCover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (coverFile && coverPreview.startsWith('blob:')) {
      URL.revokeObjectURL(coverPreview);
    }

    setCoverFile(null);
    setCoverPreview('');
    setCoverName('');

    if (editingAlert?.image) {
      setRemoveCover(true);
    } else {
      setRemoveCover(false);
    }

    if (coverInputRef.current) {
      coverInputRef.current.value = '';
    }
  };

  const handleAlertImagesUpload = (filesList?: FileList | null) => {
    const files = Array.from(filesList || []);

    if (files.length === 0) return;

    const onlyImages = files.filter((file) => file.type.startsWith('image/'));

    if (onlyImages.length !== files.length) {
      notify.warning('Solo puedes adjuntar imágenes.');
    }

    const availableSlots = MAX_ALERT_IMAGES - alertImages.length;

    if (availableSlots <= 0) {
      notify.warning(`Solo puedes adjuntar un máximo de ${MAX_ALERT_IMAGES} imágenes.`);

      if (alertImagesInputRef.current) {
        alertImagesInputRef.current.value = '';
      }

      return;
    }

    if (onlyImages.length > availableSlots) {
      notify.warning(
        `Solo puedes agregar ${availableSlots} imagen(es) más. El límite total es ${MAX_ALERT_IMAGES}.`
      );
    }

    const filesToAdd = onlyImages.slice(0, availableSlots);

    const newImages: AlertImage[] = filesToAdd.map((file, index) => ({
      id: `${Date.now()}-${index}-${file.name}`,
      name: file.name,
      previewUrl: URL.createObjectURL(file),
      url: '',
      path: '',
      type: file.type,
      size: file.size,
      order: alertImages.length + index + 1,
      file
    }));

    setAlertImages((prev) => normalizeImageOrder([...prev, ...newImages]));

    if (alertImagesInputRef.current) {
      alertImagesInputRef.current.value = '';
    }
  };

  const removeAlertImage = (imageId: string) => {
    setAlertImages((prev) => {
      const imageToRemove = prev.find((image) => image.id === imageId);

      if (
        imageToRemove?.file &&
        imageToRemove.previewUrl.startsWith('blob:')
      ) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
      }

      return normalizeImageOrder(
        prev.filter((image) => image.id !== imageId)
      );
    });
  };

  const moveAlertImage = (imageId: string, direction: 'up' | 'down') => {
    setAlertImages((prev) => {
      const currentIndex = prev.findIndex((image) => image.id === imageId);

      if (currentIndex === -1) return prev;

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      if (newIndex < 0 || newIndex >= prev.length) return prev;

      const updatedImages = [...prev];
      const temp = updatedImages[currentIndex];

      updatedImages[currentIndex] = updatedImages[newIndex];
      updatedImages[newIndex] = temp;

      return normalizeImageOrder(updatedImages);
    });
  };

  const buildImagesPayload = () => {
    return normalizeImageOrder(alertImages).map((image, index) => ({
      id: image.id,
      name: image.name,
      previewUrl: image.url || image.path || image.previewUrl,
      url: image.url || image.path || image.previewUrl,
      path: image.path || image.url || image.previewUrl,
      type: image.type || '',
      size: image.size || null,
      order: index + 1
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      notify.warning('Completa título y descripción.');
      return;
    }

    if (!token) {
      notify.warning('Debes iniciar sesión como administrador.');
      return;
    }

    const formData = new FormData();

    formData.append('title', title.trim());
    formData.append('titulo', title.trim());

    formData.append('summary', description.trim());
    formData.append('resumen', description.trim());

    formData.append('body', description.trim());
    formData.append('cuerpo', description.trim());

    formData.append('description', description.trim());

    formData.append('writtenBy', writtenBy.trim());
    formData.append('escrito_por', writtenBy.trim());

    if (coverFile) {
      formData.append('portada', coverFile);
    } else if (editingAlert && !removeCover) {
      formData.append('image', editingAlert.image || '');
      formData.append('coverName', coverName || editingAlert.coverName || '');
    }

    if (editingAlert && removeCover) {
      formData.append('removeCover', 'true');
    }

    alertImages.forEach((image) => {
      if (image.file) {
        formData.append('imagenes', image.file);
      }
    });

    formData.append('images', JSON.stringify(buildImagesPayload()));

    try {
      let response: Response;

      if (editingAlert) {
        response = await fetch(`${API_URL}/api/alerts/${editingAlert.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: formData
        });
      } else {
        response = await fetch(`${API_URL}/api/alerts`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: formData
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message || 'Error al guardar la alerta'
        );
      }

      resetForm();
      await loadAlerts();
      window.dispatchEvent(new Event('alerts-updated'));

      notify.success(
        editingAlert
          ? 'Alerta actualizada con éxito'
          : 'Alerta creada con éxito'
      );
      notify.add({
        type: 'info',
        title: editingAlert ? 'Alerta actualizada' : 'Nueva alerta publicada',
        message: title.trim()
      });
    } catch (error: any) {
      console.error('Error al guardar alerta:', error);
      notify.error(error.message || 'Error al guardar la alerta');
    }
  };

  const handleEdit = (alert: Alert) => {
    clearLocalPreviewUrls();
    resetInputs();

    setEditingAlert(alert);

    setTitle(alert.title);
    setDescription(alert.description);

    setWrittenBy(alert.writtenBy || alert.escrito_por || '');

    setCoverFile(null);
    setCoverPreview(buildFileUrl(alert.image || ''));
    setCoverName(alert.coverName || '');
    setRemoveCover(false);

    setAlertImages(
      normalizeImageOrder(
        (alert.images || []).map((image, index) => ({
          ...image,
          id: image.id || `${index + 1}-${image.previewUrl}`,
          name: image.name || `imagen-${index + 1}`,
          previewUrl: buildFileUrl(
            image.previewUrl || image.url || image.path || ''
          ),
          url: image.url || image.previewUrl || image.path || '',
          path: image.path || image.url || image.previewUrl || '',
          type: image.type || '',
          size: image.size || null,
          order: index + 1
        }))
      )
    );

    setViewItem(null);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await notify.confirm({
      header: 'Eliminar alerta',
      message: '¿Eliminar esta alerta? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      destructive: true
    });

    if (!confirmed) return;

    if (!token) {
      notify.warning('Debes iniciar sesión como administrador.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/alerts/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message || 'Error al eliminar la alerta'
        );
      }

      await loadAlerts();
      window.dispatchEvent(new Event('alerts-updated'));

      if (viewItem?.id === id) {
        setViewItem(null);
      }

      notify.success('Alerta eliminada correctamente.');
    } catch (error: any) {
      console.error('Error al eliminar alerta:', error);
      notify.error(error.message || 'Error al eliminar');
    }
  };

  const handleView = (alert: Alert) => {
    setViewItem(alert);
  };

  if (!isAdmin) return null;

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
              <p>
                La alerta quedará publicada automáticamente por{' '}
                {user?.nombre_completo || 'el administrador'}.
              </p>
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
                onIonChange={(e) => setTitle(e.detail.value || '')}
                className="custom-input"
              />
            </div>

            <div className="form-group">
              <label>Descripción</label>

              <IonTextarea
                placeholder="Descripción breve"
                rows={4}
                value={description}
                onIonChange={(e) => setDescription(e.detail.value || '')}
                className="custom-textarea"
              />
            </div>

            <div className="form-group">
              <label>Escrito por</label>

              <IonInput
                placeholder="Nombre de quien redactó la alerta"
                value={writtenBy}
                onIonChange={(e) => setWrittenBy(e.detail.value || '')}
                className="custom-input"
              />
            </div>

            <div className="form-group">
              <label>Portada</label>

              <div
                className={`file-drop-zone attachment-zone ${
                  removeCover ? 'attachment-zone-removed' : ''
                }`}
                onClick={() => coverInputRef.current?.click()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleCoverUpload(e.dataTransfer.files[0]);
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                {(coverPreview || (!removeCover && editingAlert?.image)) && (
                  <button
                    type="button"
                    className="attachment-remove-x"
                    aria-label="Quitar portada"
                    onClick={handleRemoveCover}
                  >
                    ×
                  </button>
                )}

                <div className="file-drop-content">
                  <IonIcon icon={cloudUploadOutline} />

                  <span>
                    {removeCover
                      ? 'Portada eliminada'
                      : coverName ||
                        editingAlert?.coverName ||
                        'Seleccionar imagen de portada'}
                  </span>
                </div>

                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handleCoverUpload(e.target.files?.[0])}
                />
              </div>

              {!removeCover && coverPreview && (
                <div className="image-preview-box">
                  <img src={buildFileUrl(coverPreview)} alt="Vista previa de portada" />
                </div>
              )}
            </div>

            <div className="form-group">
              <label>
                Imágenes de la alerta ({alertImages.length}/{MAX_ALERT_IMAGES})
              </label>

              {alertImages.length < MAX_ALERT_IMAGES ? (
                <div
                  className="file-drop-zone"
                  onClick={() => alertImagesInputRef.current?.click()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleAlertImagesUpload(e.dataTransfer.files);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <div className="file-drop-content">
                    <IonIcon icon={cloudUploadOutline} />

                    <span>
                      Puedes agregar {MAX_ALERT_IMAGES - alertImages.length}{' '}
                      imagen(es) más
                    </span>
                  </div>

                  <input
                    ref={alertImagesInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={(e) => handleAlertImagesUpload(e.target.files)}
                  />
                </div>
              ) : (
                <div className="images-limit-message">
                  Ya alcanzaste el límite de 10 imágenes. Elimina una imagen
                  para poder adjuntar otra.
                </div>
              )}

              {alertImages.length > 0 && (
                <div className="ordered-images-list">
                  {alertImages.map((image, index) => (
                    <div key={image.id} className="ordered-image-item">
                      <div className="ordered-image-preview-wrap">
                        <img
                          src={buildFileUrl(image.previewUrl)}
                          alt={`Imagen ${index + 1}`}
                        />

                        <span className="ordered-image-number">
                          {index + 1}
                        </span>
                      </div>

                      <div className="ordered-image-info">
                        <strong>{image.name}</strong>
                        <span>Orden {index + 1}</span>
                      </div>

                      <div className="ordered-image-actions">
                        <IonButton
                          fill="clear"
                          size="small"
                          disabled={index === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            moveAlertImage(image.id, 'up');
                          }}
                        >
                          Subir
                        </IonButton>

                        <IonButton
                          fill="clear"
                          size="small"
                          disabled={index === alertImages.length - 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            moveAlertImage(image.id, 'down');
                          }}
                        >
                          Bajar
                        </IonButton>

                        <IonButton
                          fill="clear"
                          size="small"
                          color="danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeAlertImage(image.id);
                          }}
                        >
                          Eliminar
                        </IonButton>
                      </div>
                    </div>
                  ))}
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
            <h2>Alertas publicadas ({alerts.length})</h2>
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
          {filteredAlerts.length === 0 ? (
            <p>No hay alertas disponibles.</p>
          ) : (
            filteredAlerts.map((alert) => (
              <article key={alert.id} className="alert-card">
                <div className="card-image-wrap">
                  {alert.image ? (
                    <img src={buildFileUrl(alert.image)} alt={alert.title} />
                  ) : (
                    <div className="alert-image-placeholder">
                      Sin portada
                    </div>
                  )}
                </div>

                <h2>{alert.title}</h2>
                <p>{alert.description}</p>

                <div className="card-meta">
                  <span>{alert.createdAt}</span>
                  <span>
                    Publicado por:{' '}
                    {alert.autorNombre || 'Municipalidad'}
                  </span>
                  <span>
                    Escrito por:{' '}
                    {alert.writtenBy || 'No especificado'}
                  </span>
                  <span>{alert.images?.length || 0} imagen(es)</span>
                </div>

                <div className="card-actions">
                  <IonButton
                    fill="clear"
                    size="small"
                    onClick={() => handleView(alert)}
                  >
                    <IonIcon icon={eyeOutline} />
                    Leer más
                  </IonButton>

                  <IonButton
                    fill="clear"
                    size="small"
                    onClick={() => handleEdit(alert)}
                  >
                    <IonIcon icon={createOutline} />
                    Editar
                  </IonButton>

                  <IonButton
                    fill="clear"
                    size="small"
                    className="delete-btn"
                    onClick={() => handleDelete(alert.id)}
                  >
                    <IonIcon icon={trashOutline} />
                    Eliminar
                  </IonButton>
                </div>
              </article>
            ))
          )}
        </div>

        {viewItem && (
          <div className="detail-panel">
            <h3>Vista rápida</h3>

            <div className="alert-detail-card">
              <div className="card-image-wrap">
                {viewItem.image ? (
                  <img src={buildFileUrl(viewItem.image)} alt={viewItem.title} />
                ) : (
                  <div className="alert-image-placeholder">
                    Sin portada
                  </div>
                )}
              </div>

              <h2>{viewItem.title}</h2>
              <p>{viewItem.description}</p>

              <div className="card-meta">
                <span>{viewItem.createdAt}</span>

                <span>
                  Publicado por:{' '}
                  {viewItem.autorNombre || 'Municipalidad'}
                </span>

                <span>
                  Escrito por:{' '}
                  {viewItem.writtenBy || 'No especificado'}
                </span>

                <span>{viewItem.images?.length || 0} imagen(es)</span>
              </div>

              {viewItem.images && viewItem.images.length > 0 && (
                <div className="alert-detail-gallery">
                  {viewItem.images.map((image, index) => (
                    <div key={image.id} className="alert-detail-gallery-item">
                      <img
                        src={buildFileUrl(image.previewUrl)}
                        alt={`Imagen ${index + 1}`}
                      />
                      <span>{index + 1}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default AlertsPanel;
