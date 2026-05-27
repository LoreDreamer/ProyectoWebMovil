import React, { useRef, useState } from 'react';
import {
  IonIcon,
  IonButton,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption
} from '@ionic/react';
import {
  addOutline,
  createOutline,
  trashOutline,
  cloudUploadOutline,
  closeCircleOutline,
  documentOutline
} from 'ionicons/icons';
import { useAuth } from '../../context/AuthContext';
import './educationPanel.css';

interface OrderedModuleImage {
  id: string;
  name: string;
  previewUrl: string;
  order: number;
}

interface EducationModule {
  id: number;
  title: string;
  description: string;
  tag: string;
  time: string;
  level: string;
  image: string;
  imageName: string;
  fileName: string;
  moduleImages: OrderedModuleImage[];
}

const MAX_MODULE_IMAGES = 10;

export const EducationPanel: React.FC = () => {
  const { user } = useAuth();

  const [modules, setModules] = useState<EducationModule[]>([
    {
      id: 1,
      title: '¿Qué es el phishing?',
      description: 'Aprende a reconocer correos y mensajes fraudulentos.',
      tag: 'Phishing',
      time: '12 min',
      level: 'Básico',
      image: '',
      imageName: '',
      fileName: '',
      moduleImages: []
    }
  ]);

  const [editingModule, setEditingModule] = useState<EducationModule | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('Phishing');
  const [time, setTime] = useState('10 min');
  const [level, setLevel] = useState('Básico');

  const [coverPreview, setCoverPreview] = useState('');
  const [coverName, setCoverName] = useState('');
  const [removeCover, setRemoveCover] = useState(false);

  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachedFileName, setAttachedFileName] = useState('');
  const [removeAttachedFile, setRemoveAttachedFile] = useState(false);

  const [moduleImages, setModuleImages] = useState<OrderedModuleImage[]>([]);

  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const attachedFileInputRef = useRef<HTMLInputElement | null>(null);
  const moduleImagesInputRef = useRef<HTMLInputElement | null>(null);

  const isAdmin = user?.role === 'admin';

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

  const normalizeImageOrder = (images: OrderedModuleImage[]) => {
    return images.map((image, index) => ({
      ...image,
      order: index + 1
    }));
  };

  const resetInputs = () => {
    if (coverInputRef.current) {
      coverInputRef.current.value = '';
    }

    if (attachedFileInputRef.current) {
      attachedFileInputRef.current.value = '';
    }

    if (moduleImagesInputRef.current) {
      moduleImagesInputRef.current.value = '';
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTag('Phishing');
    setTime('10 min');
    setLevel('Básico');

    setCoverPreview('');
    setCoverName('');
    setRemoveCover(false);

    setAttachedFile(null);
    setAttachedFileName('');
    setRemoveAttachedFile(false);

    setModuleImages([]);
    setEditingModule(null);

    resetInputs();
  };

  const handleCoverUpload = async (file?: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Solo puedes adjuntar imágenes como portada.');

      if (coverInputRef.current) {
        coverInputRef.current.value = '';
      }

      return;
    }

    try {
      const previewUrl = await readImageAsDataUrl(file);

      setCoverPreview(previewUrl);
      setCoverName(file.name);
      setRemoveCover(false);
    } catch (error) {
      console.error('Error al cargar portada:', error);
      alert('No se pudo cargar la portada.');
    }
  };

  const handleRemoveCover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    setCoverPreview('');
    setCoverName('');

    if (editingModule?.image) {
      setRemoveCover(true);
    } else {
      setRemoveCover(false);
    }

    if (coverInputRef.current) {
      coverInputRef.current.value = '';
    }
  };

  const handleAttachedFileUpload = (file?: File) => {
    if (!file) return;

    setAttachedFile(file);
    setAttachedFileName(file.name);
    setRemoveAttachedFile(false);
  };

  const handleRemoveAttachedFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    setAttachedFile(null);
    setAttachedFileName('');

    if (editingModule?.fileName) {
      setRemoveAttachedFile(true);
    } else {
      setRemoveAttachedFile(false);
    }

    if (attachedFileInputRef.current) {
      attachedFileInputRef.current.value = '';
    }
  };

  const handleModuleImagesUpload = async (filesList?: FileList | null) => {
    const files = Array.from(filesList || []);

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

    try {
      const newImages = await Promise.all(
        filesToAdd.map(async (file, index) => {
          const previewUrl = await readImageAsDataUrl(file);

          return {
            id: `${Date.now()}-${index}-${file.name}`,
            name: file.name,
            previewUrl,
            order: moduleImages.length + index + 1
          };
        })
      );

      setModuleImages((prev) => normalizeImageOrder([...prev, ...newImages]));
    } catch (error) {
      console.error('Error al cargar imágenes del módulo:', error);
      alert('No se pudieron cargar una o más imágenes.');
    }

    if (moduleImagesInputRef.current) {
      moduleImagesInputRef.current.value = '';
    }
  };

  const removeModuleImage = (imageId: string) => {
    setModuleImages((prev) =>
      normalizeImageOrder(prev.filter((image) => image.id !== imageId))
    );
  };

  const moveModuleImage = (imageId: string, direction: 'up' | 'down') => {
    setModuleImages((prev) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      alert('Completa título y descripción');
      return;
    }

    const finalCover = removeCover
      ? ''
      : coverPreview || editingModule?.image || '';

    const finalCoverName = removeCover
      ? ''
      : coverName || editingModule?.imageName || '';

    const finalFileName = removeAttachedFile
      ? ''
      : attachedFileName || editingModule?.fileName || '';

    if (editingModule) {
      const updatedModules = modules.map((module) =>
        module.id === editingModule.id
          ? {
              ...module,
              title: title.trim(),
              description: description.trim(),
              tag,
              time: time.trim(),
              level,
              image: finalCover,
              imageName: finalCoverName,
              fileName: finalFileName,
              moduleImages: normalizeImageOrder(moduleImages)
            }
          : module
      );

      setModules(updatedModules);
      alert('Módulo actualizado con éxito');
    } else {
      const newModule: EducationModule = {
        id: Date.now(),
        title: title.trim(),
        description: description.trim(),
        tag,
        time: time.trim(),
        level,
        image: finalCover,
        imageName: finalCoverName,
        fileName: finalFileName,
        moduleImages: normalizeImageOrder(moduleImages)
      };

      setModules([newModule, ...modules]);
      alert('Módulo creado con éxito');
    }

    resetForm();
  };

  const handleEdit = (module: EducationModule) => {
    setEditingModule(module);

    setTitle(module.title);
    setDescription(module.description);
    setTag(module.tag);
    setTime(module.time);
    setLevel(module.level);

    setCoverPreview(module.image || '');
    setCoverName(module.imageName || '');
    setRemoveCover(false);

    setAttachedFile(null);
    setAttachedFileName(module.fileName || '');
    setRemoveAttachedFile(false);

    setModuleImages(normalizeImageOrder(module.moduleImages || []));

    resetInputs();
  };

  const handleDelete = (id: number) => {
    if (window.confirm('¿Eliminar este módulo?')) {
      setModules(modules.filter((module) => module.id !== id));
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="education-admin-panel">
      <section className="panel-form-section">
        <div className="admin-form-card">
          <div className="form-header-inline">
            <div className="icon-square">
              <IonIcon icon={addOutline} />
            </div>

            <div className="header-text-container">
              <h2>{editingModule ? 'Editar Módulo' : 'Nuevo Módulo Educativo'}</h2>
              <p>Completa los datos del módulo, su portada, archivo e imágenes internas.</p>
            </div>

            {editingModule && (
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
                placeholder="Título del módulo"
                value={title}
                onIonChange={(e) => setTitle(e.detail.value || '')}
                className="custom-input"
              />
            </div>

            <div className="form-group">
              <label>Descripción</label>

              <IonTextarea
                placeholder="Descripción del módulo"
                rows={3}
                value={description}
                onIonChange={(e) => setDescription(e.detail.value || '')}
                className="custom-textarea"
              />
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label>Tag/Categoría</label>

                <IonSelect
                  value={tag}
                  onIonChange={(e) => setTag(e.detail.value)}
                  className="custom-select"
                >
                  <IonSelectOption value="Phishing">Phishing</IonSelectOption>
                  <IonSelectOption value="Redes">Redes</IonSelectOption>
                  <IonSelectOption value="Privacidad">Privacidad</IonSelectOption>
                  <IonSelectOption value="Seguridad">Seguridad</IonSelectOption>
                </IonSelect>
              </div>

              <div className="form-group half">
                <label>Duración</label>

                <IonInput
                  placeholder="10 min"
                  value={time}
                  onIonChange={(e) => setTime(e.detail.value || '')}
                  className="custom-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Nivel</label>

              <IonSelect
                value={level}
                onIonChange={(e) => setLevel(e.detail.value)}
                className="custom-select"
              >
                <IonSelectOption value="Básico">Básico</IonSelectOption>
                <IonSelectOption value="Intermedio">Intermedio</IonSelectOption>
                <IonSelectOption value="Avanzado">Avanzado</IonSelectOption>
              </IonSelect>
            </div>

            <div className="form-group">
              <label>Portada</label>

              <div
                className={`file-drop-zone attachment-zone ${removeCover ? 'attachment-zone-removed' : ''}`}
                onClick={() => coverInputRef.current?.click()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleCoverUpload(e.dataTransfer.files[0]);
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                {(coverPreview || (!removeCover && editingModule?.image)) && (
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
                        editingModule?.imageName ||
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
                  <img src={coverPreview} alt="Vista previa de portada" />
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Archivo adjunto</label>

              <div
                className={`file-drop-zone attachment-zone ${removeAttachedFile ? 'attachment-zone-removed' : ''}`}
                onClick={() => attachedFileInputRef.current?.click()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleAttachedFileUpload(e.dataTransfer.files[0]);
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                {(attachedFileName || (!removeAttachedFile && editingModule?.fileName)) && (
                  <button
                    type="button"
                    className="attachment-remove-x"
                    aria-label="Quitar archivo adjunto"
                    onClick={handleRemoveAttachedFile}
                  >
                    ×
                  </button>
                )}

                <div className="file-drop-content">
                  <IonIcon icon={cloudUploadOutline} />

                  <span>
                    {removeAttachedFile
                      ? 'Archivo eliminado'
                      : attachedFileName ||
                        editingModule?.fileName ||
                        'Adjuntar PDF, DOC o DOCX'}
                  </span>
                </div>

                <input
                  ref={attachedFileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  style={{ display: 'none' }}
                  onChange={(e) => handleAttachedFileUpload(e.target.files?.[0])}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Imágenes internas del módulo ({moduleImages.length}/{MAX_MODULE_IMAGES})</label>

              {moduleImages.length < MAX_MODULE_IMAGES ? (
                <div
                  className="file-drop-zone"
                  onClick={() => moduleImagesInputRef.current?.click()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleModuleImagesUpload(e.dataTransfer.files);
                  }}
                  onDragOver={(e) => e.preventDefault()}
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
                    onChange={(e) => handleModuleImagesUpload(e.target.files)}
                  />
                </div>
              ) : (
                <div className="images-limit-message">
                  Ya alcanzaste el límite de 10 imágenes. Elimina una imagen para poder adjuntar otra.
                </div>
              )}

              {moduleImages.length > 0 && (
                <div className="ordered-images-list">
                  {moduleImages.map((image, index) => (
                    <div key={image.id} className="ordered-image-item">
                      <div className="ordered-image-preview-wrap">
                        <img src={image.previewUrl} alt={`Imagen ${index + 1}`} />

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
                            moveModuleImage(image.id, 'up');
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
                            moveModuleImage(image.id, 'down');
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
                            removeModuleImage(image.id);
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
                {editingModule ? 'Guardar Cambios' : 'Crear Módulo'}
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="panel-list-section">
        <div className="panel-section-header">
          <div>
            <h2>Módulos Existentes ({modules.length})</h2>
            <p>Administra los módulos educativos disponibles.</p>
          </div>
        </div>

        <div className="modules-list">
          {modules.length === 0 ? (
            <p>No hay módulos disponibles.</p>
          ) : (
            modules.map((module) => (
              <div key={module.id} className="module-item">
                <div className="module-main">
                  <div className="module-thumb">
                    {module.image ? (
                      <img src={module.image} alt={`Imagen de ${module.title}`} />
                    ) : (
                      <div className="module-thumb-placeholder">
                        Sin imagen
                      </div>
                    )}
                  </div>

                  <div className="module-info">
                    <h4>{module.title}</h4>
                    <p>{module.description}</p>

                    <div className="module-meta">
                      <span className="module-tag">{module.tag}</span>
                      <span>{module.time}</span>
                      <span>{module.level}</span>

                      {module.fileName && (
                        <span className="file-indicator">
                          <IonIcon icon={documentOutline} />
                          {module.fileName}
                        </span>
                      )}

                      <span>{module.moduleImages.length} imagen(es)</span>
                    </div>
                  </div>
                </div>

                <div className="module-actions">
                  <IonButton
                    fill="clear"
                    size="small"
                    onClick={() => handleEdit(module)}
                  >
                    <IonIcon icon={createOutline} />
                  </IonButton>

                  <IonButton
                    fill="clear"
                    size="small"
                    onClick={() => handleDelete(module.id)}
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

export default EducationPanel;