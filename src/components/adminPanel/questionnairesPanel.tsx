import React, { useEffect, useRef, useState } from 'react';
import {
  IonIcon,
  IonButton,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonSearchbar
} from '@ionic/react';
import {
  addOutline,
  createOutline,
  trashOutline,
  closeCircleOutline,
  cloudUploadOutline,
  documentOutline
} from 'ionicons/icons';
import { useAuth } from '../../context/AuthContext';
import './questionnairesPanel.css';

interface Questionnaire {
  id: number;
  title: string;
  description: string;
  risk: 'BAJO' | 'MEDIO' | 'ALTO';
  createdAt: string;
  fileUrl?: string;
  fileName?: string;
  coverUrl?: string;
  coverName?: string;
}

interface ModuleImage {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  order: number;
}

const API_URL = 'http://localhost:3000';
const MAX_MODULE_IMAGES = 10;

export const QuestionnairesPanel: React.FC = () => {
  const { user, token } = useAuth();

  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingQuestionnaire, setEditingQuestionnaire] = useState<Questionnaire | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [risk, setRisk] = useState<'BAJO' | 'MEDIO' | 'ALTO'>('MEDIO');

  const [archivo, setArchivo] = useState<File | null>(null);
  const [archivoNombre, setArchivoNombre] = useState('');
  const [removeFile, setRemoveFile] = useState(false);

  const [portada, setPortada] = useState<File | null>(null);
  const [portadaNombre, setPortadaNombre] = useState('');
  const [portadaPreview, setPortadaPreview] = useState('');
  const [removeCover, setRemoveCover] = useState(false);

  const [moduleImages, setModuleImages] = useState<ModuleImage[]>([]);

  const portadaInputRef = useRef<HTMLInputElement | null>(null);
  const archivoInputRef = useRef<HTMLInputElement | null>(null);
  const moduleImagesInputRef = useRef<HTMLInputElement | null>(null);
  const moduleImagesRef = useRef<ModuleImage[]>([]);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    moduleImagesRef.current = moduleImages;
  }, [moduleImages]);

  useEffect(() => {
    return () => {
      moduleImagesRef.current.forEach((img) => {
        URL.revokeObjectURL(img.previewUrl);
      });
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

    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return `${API_URL}${url}`;

    return `${API_URL}/${url}`;
  };

  const readImageAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result as string);
      };

      reader.onerror = () => {
        reject(new Error('No se pudo leer la imagen'));
      };

      reader.readAsDataURL(file);
    });
  };

  const loadQuestionnaires = async () => {
    if (!isAdmin) return;

    try {
      const response = await fetch(`${API_URL}/api/questionnaires`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('No se pudieron cargar los cuestionarios');
      }

      const data = await response.json();
      setQuestionnaires(data);
    } catch (error) {
      console.error('Error al cargar cuestionarios:', error);
      setQuestionnaires([]);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;

    loadQuestionnaires();

    const handler = () => loadQuestionnaires();
    window.addEventListener('questionnaires-updated', handler);

    return () => {
      window.removeEventListener('questionnaires-updated', handler);
    };
  }, [isAdmin, token]);

  const filteredQuestionnaires = questionnaires.filter((q) =>
    q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const normalizeImageOrder = (images: ModuleImage[]) => {
    return images.map((img, index) => ({
      ...img,
      order: index + 1
    }));
  };

  const resetInputs = () => {
    if (portadaInputRef.current) {
      portadaInputRef.current.value = '';
    }

    if (archivoInputRef.current) {
      archivoInputRef.current.value = '';
    }

    if (moduleImagesInputRef.current) {
      moduleImagesInputRef.current.value = '';
    }
  };

  const clearModuleImages = () => {
    moduleImages.forEach((img) => {
      URL.revokeObjectURL(img.previewUrl);
    });

    setModuleImages([]);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setRisk('MEDIO');

    setArchivo(null);
    setArchivoNombre('');
    setRemoveFile(false);

    setPortada(null);
    setPortadaNombre('');
    setPortadaPreview('');
    setRemoveCover(false);

    setEditingQuestionnaire(null);
    clearModuleImages();
    resetInputs();
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'portada' | 'archivo'
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (type === 'portada') {
      if (!file.type.startsWith('image/')) {
        alert('Solo puedes adjuntar imágenes como portada.');

        if (portadaInputRef.current) {
          portadaInputRef.current.value = '';
        }

        return;
      }

      try {
        const previewUrl = await readImageAsDataUrl(file);

        setPortada(file);
        setPortadaNombre(file.name);
        setPortadaPreview(previewUrl);
        setRemoveCover(false);
      } catch (error) {
        console.error('Error al cargar portada:', error);
        alert('No se pudo cargar la portada.');
      }

      return;
    }

    setArchivo(file);
    setArchivoNombre(file.name);
    setRemoveFile(false);
  };

  const handleRemovePortada = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    setPortada(null);
    setPortadaNombre('');
    setPortadaPreview('');

    if (editingQuestionnaire?.coverName || editingQuestionnaire?.coverUrl) {
      setRemoveCover(true);
    } else {
      setRemoveCover(false);
    }

    if (portadaInputRef.current) {
      portadaInputRef.current.value = '';
    }
  };

  const handleRemoveArchivo = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    setArchivo(null);
    setArchivoNombre('');

    if (editingQuestionnaire?.fileName) {
      setRemoveFile(true);
    } else {
      setRemoveFile(false);
    }

    if (archivoInputRef.current) {
      archivoInputRef.current.value = '';
    }
  };

  const handleModuleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    const onlyImages = files.filter((file) => file.type.startsWith('image/'));

    if (onlyImages.length !== files.length) {
      alert('Solo puedes adjuntar imágenes.');
    }

    const availableSlots = MAX_MODULE_IMAGES - moduleImages.length;

    if (availableSlots <= 0) {
      alert(`Solo puedes adjuntar un máximo de ${MAX_MODULE_IMAGES} imágenes.`);

      if (moduleImagesInputRef.current) {
        moduleImagesInputRef.current.value = '';
      }

      return;
    }

    if (onlyImages.length > availableSlots) {
      alert(`Solo puedes agregar ${availableSlots} imagen(es) más. El límite total es ${MAX_MODULE_IMAGES}.`);
    }

    const filesToAdd = onlyImages.slice(0, availableSlots);

    const newImages: ModuleImage[] = filesToAdd.map((file, index) => ({
      id: `${Date.now()}-${index}-${file.name}`,
      file,
      previewUrl: URL.createObjectURL(file),
      name: file.name,
      order: moduleImages.length + index + 1
    }));

    setModuleImages((prev) => normalizeImageOrder([...prev, ...newImages]));

    if (moduleImagesInputRef.current) {
      moduleImagesInputRef.current.value = '';
    }
  };

  const removeModuleImage = (imageId: string) => {
    setModuleImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === imageId);

      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
      }

      return normalizeImageOrder(prev.filter((img) => img.id !== imageId));
    });
  };

  const moveModuleImage = (imageId: string, direction: 'up' | 'down') => {
    setModuleImages((prev) => {
      const currentIndex = prev.findIndex((img) => img.id === imageId);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      alert('Completa título y descripción');
      return;
    }

    const formData = new FormData();

    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('risk', risk);

    if (archivo) {
      formData.append('archivo', archivo);
    }

    if (portada) {
      formData.append('portada', portada);
    }

    if (editingQuestionnaire && removeCover) {
      formData.append('removeCover', 'true');
    }

    if (editingQuestionnaire && removeFile) {
      formData.append('removeFile', 'true');
    }

    moduleImages.forEach((img) => {
      formData.append('imagenes', img.file);
    });

    formData.append(
      'imagenesOrden',
      JSON.stringify(
        moduleImages.map((img, index) => ({
          order: index + 1,
          name: img.name
        }))
      )
    );

    try {
      let response: Response;

      if (editingQuestionnaire) {
        response = await fetch(`${API_URL}/api/questionnaires/${editingQuestionnaire.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: formData
        });
      } else {
        response = await fetch(`${API_URL}/api/questionnaires`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: formData
        });
      }

      if (!response.ok) {
        throw new Error('Error al guardar el cuestionario');
      }

      resetForm();
      await loadQuestionnaires();
      window.dispatchEvent(new Event('questionnaires-updated'));

      alert(editingQuestionnaire ? 'Cuestionario actualizado' : 'Cuestionario creado');
    } catch (error) {
      console.error('Error al guardar cuestionario:', error);
      alert('Error al guardar el cuestionario');
    }
  };

  const handleEdit = (questionnaire: Questionnaire) => {
    setEditingQuestionnaire(questionnaire);
    setTitle(questionnaire.title);
    setDescription(questionnaire.description);
    setRisk(questionnaire.risk);

    setArchivo(null);
    setArchivoNombre(questionnaire.fileName || '');
    setRemoveFile(false);

    setPortada(null);
    setPortadaNombre(questionnaire.coverName || '');
    setPortadaPreview(buildFileUrl(questionnaire.coverUrl));
    setRemoveCover(false);

    clearModuleImages();
    resetInputs();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar este cuestionario?')) return;

    try {
      const response = await fetch(`${API_URL}/api/questionnaires/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el cuestionario');
      }

      await loadQuestionnaires();
      window.dispatchEvent(new Event('questionnaires-updated'));

      alert('Cuestionario eliminado');
    } catch (error) {
      console.error('Error al eliminar cuestionario:', error);
      alert('Error al eliminar');
    }
  };

  const getRiskColor = (riskValue: string) => {
    switch (riskValue) {
      case 'ALTO':
        return '#ff6b6b';
      case 'MEDIO':
        return '#fcc419';
      case 'BAJO':
        return '#51cf66';
      default:
        return '#888';
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="questionnaires-admin-panel">
      <section className="panel-form-section">
        <div className="admin-form-card">
          <div className="form-header-inline">
            <div className="icon-square">
              <IonIcon icon={addOutline} />
            </div>

            <div className="header-text-container">
              <h2>{editingQuestionnaire ? 'Editar Cuestionario' : 'Nuevo Cuestionario'}</h2>
              <p>Crea un cuestionario de evaluación con portada e imágenes ordenadas.</p>
            </div>

            {editingQuestionnaire && (
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
                placeholder="Título del cuestionario"
                value={title}
                onIonChange={(e) => setTitle(e.detail.value || '')}
                className="custom-input"
              />
            </div>

            <div className="form-group">
              <label>Descripción</label>

              <IonTextarea
                placeholder="Descripción del cuestionario"
                rows={3}
                value={description}
                onIonChange={(e) => setDescription(e.detail.value || '')}
                className="custom-textarea"
              />
            </div>

            <div className="form-group">
              <label>Nivel de Riesgo</label>

              <IonSelect
                value={risk}
                onIonChange={(e) => setRisk(e.detail.value)}
                className="custom-select"
              >
                <IonSelectOption value="BAJO">Bajo</IonSelectOption>
                <IonSelectOption value="MEDIO">Medio</IonSelectOption>
                <IonSelectOption value="ALTO">Alto</IonSelectOption>
              </IonSelect>
            </div>

            <div className="form-group">
              <label>Portada</label>

              <div
                className={`file-drop-zone attachment-zone ${removeCover ? 'attachment-zone-removed' : ''}`}
                onClick={() => portadaInputRef.current?.click()}
              >
                {(portadaPreview || portadaNombre || (!removeCover && (editingQuestionnaire?.coverName || editingQuestionnaire?.coverUrl))) && (
                  <button
                    type="button"
                    className="attachment-remove-x"
                    aria-label="Quitar portada"
                    onClick={handleRemovePortada}
                  >
                    ×
                  </button>
                )}

                <div className="file-drop-content">
                  <IonIcon icon={cloudUploadOutline} />

                  <span>
                    {removeCover
                      ? 'Portada eliminada'
                      : portadaNombre ||
                        editingQuestionnaire?.coverName ||
                        'Seleccionar imagen de portada'}
                  </span>
                </div>

                <input
                  ref={portadaInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileChange(e, 'portada')}
                />
              </div>

              {!removeCover && portadaPreview && (
                <div className="image-preview-box">
                  <img
                    src={portadaPreview}
                    alt="Vista previa de portada"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/600x250?text=Sin+Portada';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Imágenes del módulo ({moduleImages.length}/{MAX_MODULE_IMAGES})</label>

              {moduleImages.length < MAX_MODULE_IMAGES ? (
                <div
                  className="file-drop-zone"
                  onClick={() => moduleImagesInputRef.current?.click()}
                >
                  <div className="file-drop-content">
                    <IonIcon icon={cloudUploadOutline} />

                    <span>
                      Puedes agregar {MAX_MODULE_IMAGES - moduleImages.length} imagen(es) más
                    </span>
                  </div>

                  <input
                    ref={moduleImagesInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleModuleImagesChange}
                  />
                </div>
              ) : (
                <div className="images-limit-message">
                  Ya alcanzaste el límite de 10 imágenes. Elimina una imagen para poder adjuntar otra.
                </div>
              )}

              {moduleImages.length > 0 && (
                <div className="ordered-images-list">
                  {moduleImages.map((img, index) => (
                    <div key={img.id} className="ordered-image-item">
                      <div className="ordered-image-preview-wrap">
                        <img src={img.previewUrl} alt={`Imagen ${index + 1}`} />

                        <span className="ordered-image-number">
                          {index + 1}
                        </span>
                      </div>

                      <div className="ordered-image-info">
                        <strong>{img.name}</strong>
                        <span>Orden {index + 1}</span>
                      </div>

                      <div className="ordered-image-actions">
                        <IonButton
                          fill="clear"
                          size="small"
                          disabled={index === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            moveModuleImage(img.id, 'up');
                          }}
                        >
                          Subir
                        </IonButton>

                        <IonButton
                          fill="clear"
                          size="small"
                          disabled={index === moduleImages.length - 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            moveModuleImage(img.id, 'down');
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
                            removeModuleImage(img.id);
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

            <div className="form-group">
              <label>Archivo</label>

              <div
                className={`file-drop-zone attachment-zone ${removeFile ? 'attachment-zone-removed' : ''}`}
                onClick={() => archivoInputRef.current?.click()}
              >
                {(archivoNombre || (!removeFile && editingQuestionnaire?.fileName)) && (
                  <button
                    type="button"
                    className="attachment-remove-x"
                    aria-label="Quitar archivo"
                    onClick={handleRemoveArchivo}
                  >
                    ×
                  </button>
                )}

                <div className="file-drop-content">
                  <IonIcon icon={cloudUploadOutline} />

                  <span>
                    {removeFile
                      ? 'Archivo eliminado'
                      : archivoNombre ||
                        editingQuestionnaire?.fileName ||
                        'Seleccionar archivo'}
                  </span>
                </div>

                <input
                  ref={archivoInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileChange(e, 'archivo')}
                />
              </div>
            </div>

            <div className="form-footer">
              <button type="submit" className="btn-submit">
                {editingQuestionnaire ? 'Guardar Cambios' : 'Crear Cuestionario'}
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="panel-list-section">
        <div className="panel-section-header">
          <div>
            <h2>Cuestionarios ({questionnaires.length})</h2>
            <p>Busca, edita o elimina cuestionarios existentes.</p>
          </div>

          <IonSearchbar
            value={searchTerm}
            placeholder="Buscar cuestionario..."
            onIonChange={(e) => setSearchTerm(e.detail.value || '')}
            mode="ios"
          />
        </div>

        <div className="questionnaires-list">
          {filteredQuestionnaires.length === 0 ? (
            <p>No hay cuestionarios disponibles.</p>
          ) : (
            filteredQuestionnaires.map((q) => (
              <div key={q.id} className="questionnaire-item">
                <div className="questionnaire-info">
                  <div className="questionnaire-cover">
                    {q.coverUrl ? (
                      <img
                        src={buildFileUrl(q.coverUrl)}
                        alt={`Portada de ${q.title}`}
                        onError={(e) => {
                          e.currentTarget.src =
                            'https://via.placeholder.com/150?text=Sin+Portada';
                        }}
                      />
                    ) : (
                      <div className="questionnaire-cover-placeholder">
                        Sin portada
                      </div>
                    )}
                  </div>

                  <div>
                    <h4>{q.title}</h4>
                    <p>{q.description}</p>

                    <div className="questionnaire-meta">
                      <span
                        className="risk-badge"
                        style={{ backgroundColor: getRiskColor(q.risk) }}
                      >
                        {q.risk}
                      </span>

                      <span>{q.createdAt}</span>

                      {q.fileName && (
                        <span className="file-indicator">
                          <IonIcon icon={documentOutline} />
                          {q.fileName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="questionnaire-actions">
                  <IonButton
                    fill="clear"
                    size="small"
                    onClick={() => handleEdit(q)}
                  >
                    <IonIcon icon={createOutline} />
                  </IonButton>

                  <IonButton
                    fill="clear"
                    size="small"
                    onClick={() => handleDelete(q.id)}
                    className="delete-btn"
                  >
                    <IonIcon icon={trashOutline} />
                  </IonButton>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default QuestionnairesPanel;