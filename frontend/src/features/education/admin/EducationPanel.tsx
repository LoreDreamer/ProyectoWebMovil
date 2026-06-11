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
  cloudUploadOutline,
  closeCircleOutline,
  documentOutline
} from 'ionicons/icons';
import { useAuth } from '@/context/AuthContext';
import './EducationPanel.css';
import { API_URL } from '@/shared/api/apiClient';
import { notify } from '@/shared/notifications';

type DifficultyValue = 'facil' | 'medio' | 'dificil';
type EducationTypeValue = 'Phishing' | 'Seguridad' | 'VPNs' | 'Privacidad';

interface ModuleImage {
  id: string;
  file?: File;
  previewUrl: string;
  url?: string;
  path?: string;
  name: string;
  order: number;
}

interface EducationModule {
  id: string;

  title: string;
  titulo?: string;

  description: string;
  resumen?: string;

  body?: string;
  cuerpo?: string;
  content?: string;

  category: string;
  tipo_educacion?: string;

  duration?: string;

  level: string;
  nivel?: DifficultyValue;

  image: string;
  cover_img?: string;
  coverName?: string;

  fileName?: string;
  fileUrl?: string;
  archivo_nombre?: string;
  archivo_url?: string;
  archivo_tipo?: string;

  images?: ModuleImage[];
  imagenes?: string[];

  createdAt?: string | null;
}

const MAX_MODULE_IMAGES = 10;

const EDUCATION_TYPES: EducationTypeValue[] = [
  'Phishing',
  'Seguridad',
  'VPNs',
  'Privacidad'
];

const DIFFICULTY_OPTIONS: Array<{
  value: DifficultyValue;
  label: string;
}> = [
  { value: 'facil', label: 'Básico' },
  { value: 'medio', label: 'Intermedio' },
  { value: 'dificil', label: 'Avanzado' }
];

const normalizeDifficultyValue = (value?: string): DifficultyValue => {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (
    normalized === 'facil' ||
    normalized === 'basico' ||
    normalized === 'basica'
  ) {
    return 'facil';
  }

  if (
    normalized === 'dificil' ||
    normalized === 'avanzado' ||
    normalized === 'avanzada'
  ) {
    return 'dificil';
  }

  return 'medio';
};

const getDifficultyLabel = (value?: string) => {
  const difficulty = normalizeDifficultyValue(value);

  if (difficulty === 'facil') return 'Básico';
  if (difficulty === 'dificil') return 'Avanzado';

  return 'Intermedio';
};

const normalizeEducationType = (value?: string): EducationTypeValue => {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (normalized.includes('phish') || normalized.includes('phis')) {
    return 'Phishing';
  }

  if (normalized.includes('vpn')) {
    return 'VPNs';
  }

  if (normalized.includes('privacidad')) {
    return 'Privacidad';
  }

  return 'Seguridad';
};

export const EducationPanel: React.FC = () => {
  const { user, token } = useAuth();

  const [modules, setModules] = useState<EducationModule[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingModule, setEditingModule] = useState<EducationModule | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<EducationTypeValue>('Phishing');
  const [duration, setDuration] = useState('10 min');
  const [level, setLevel] = useState<DifficultyValue>('facil');

  const [portada, setPortada] = useState<File | null>(null);
  const [portadaPreview, setPortadaPreview] = useState('');
  const [portadaNombre, setPortadaNombre] = useState('');
  const [removeCover, setRemoveCover] = useState(false);

  const [archivo, setArchivo] = useState<File | null>(null);
  const [archivoNombre, setArchivoNombre] = useState('');
  const [removeFile, setRemoveFile] = useState(false);

  const [moduleImages, setModuleImages] = useState<ModuleImage[]>([]);

  const portadaInputRef = useRef<HTMLInputElement | null>(null);
  const archivoInputRef = useRef<HTMLInputElement | null>(null);
  const moduleImagesInputRef = useRef<HTMLInputElement | null>(null);

  const moduleImagesRef = useRef<ModuleImage[]>([]);
  const portadaRef = useRef<File | null>(null);
  const portadaPreviewRef = useRef('');

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    moduleImagesRef.current = moduleImages;
  }, [moduleImages]);

  useEffect(() => {
    portadaRef.current = portada;
    portadaPreviewRef.current = portadaPreview;
  }, [portada, portadaPreview]);

  useEffect(() => {
    return () => {
      moduleImagesRef.current.forEach((img) => {
        if (img.file && img.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(img.previewUrl);
        }
      });

      if (
        portadaRef.current &&
        portadaPreviewRef.current.startsWith('blob:')
      ) {
        URL.revokeObjectURL(portadaPreviewRef.current);
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

    if (url.startsWith('/')) return `${API_URL}${url}`;

    return `${API_URL}/${url}`;
  };

  const normalizeImageOrder = (images: ModuleImage[]) => {
    return images.map((image, index) => ({
      ...image,
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

  const clearLocalPreviewUrls = () => {
    moduleImages.forEach((img) => {
      if (img.file && img.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(img.previewUrl);
      }
    });

    if (portada && portadaPreview.startsWith('blob:')) {
      URL.revokeObjectURL(portadaPreview);
    }
  };

  const resetForm = () => {
    clearLocalPreviewUrls();

    setTitle('');
    setDescription('');
    setBody('');
    setCategory('Phishing');
    setDuration('10 min');
    setLevel('facil');

    setPortada(null);
    setPortadaPreview('');
    setPortadaNombre('');
    setRemoveCover(false);

    setArchivo(null);
    setArchivoNombre('');
    setRemoveFile(false);

    setModuleImages([]);
    setEditingModule(null);

    resetInputs();
  };

  const normalizeModuleFromApi = (module: EducationModule): EducationModule => {
    const normalizedImages = normalizeImageOrder(
      (module.images || []).map((img, index) => ({
        ...img,
        id: img.id || `${index + 1}-${img.previewUrl || img.url || img.path}`,
        name: img.name || `imagen-${index + 1}`,
        previewUrl: buildFileUrl(img.previewUrl || img.url || img.path || ''),
        url: img.url || img.previewUrl || img.path || '',
        path: img.path || img.url || img.previewUrl || '',
        order: index + 1
      }))
    );

    return {
      ...module,
      id: String(module.id),
      title: module.title || module.titulo || '',
      description: module.description || module.resumen || '',
      body: module.body || module.cuerpo || module.content || '',
      category: module.category || module.tipo_educacion || 'Seguridad',
      duration: module.duration || '10 min',
      level: module.level || getDifficultyLabel(module.nivel),
      image: module.image || module.cover_img || '',
      coverName: module.coverName || '',
      fileName: module.fileName || module.archivo_nombre || '',
      fileUrl: module.fileUrl || module.archivo_url || '',
      images: normalizedImages
    };
  };

  const loadModules = async () => {
    try {
      const response = await fetch(`${API_URL}/api/education`);

      if (!response.ok) {
        throw new Error('No se pudieron cargar los módulos educativos');
      }

      const data = await response.json();

      setModules(
        Array.isArray(data)
          ? data.map((module) => normalizeModuleFromApi(module))
          : []
      );
    } catch (error) {
      console.error('Error al cargar módulos educativos:', error);
      setModules([]);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;

    loadModules();

    const handler = () => loadModules();
    window.addEventListener('education-updated', handler);

    return () => {
      window.removeEventListener('education-updated', handler);
    };
  }, [isAdmin, token]);

  const filteredModules = modules.filter((module) =>
    module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getDifficultyLabel(module.nivel || module.level)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handlePortadaChange = (file?: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      notify.warning('La portada debe ser una imagen.');
      return;
    }

    if (portada && portadaPreview.startsWith('blob:')) {
      URL.revokeObjectURL(portadaPreview);
    }

    setPortada(file);
    setPortadaNombre(file.name);
    setPortadaPreview(URL.createObjectURL(file));
    setRemoveCover(false);
  };

  const handleArchivoChange = (file?: File) => {
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      notify.warning('El archivo debe ser PDF, DOC o DOCX.');
      return;
    }

    setArchivo(file);
    setArchivoNombre(file.name);
    setRemoveFile(false);
  };

  const handleRemovePortada = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (portada && portadaPreview.startsWith('blob:')) {
      URL.revokeObjectURL(portadaPreview);
    }

    setPortada(null);
    setPortadaPreview('');
    setPortadaNombre('');

    if (editingModule?.image) {
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

    if (editingModule?.fileUrl) {
      setRemoveFile(true);
    } else {
      setRemoveFile(false);
    }

    if (archivoInputRef.current) {
      archivoInputRef.current.value = '';
    }
  };

  const handleModuleImagesUpload = (filesList?: FileList | null) => {
    const files = Array.from(filesList || []);

    if (files.length === 0) return;

    const onlyImages = files.filter((file) => file.type.startsWith('image/'));

    if (onlyImages.length !== files.length) {
      notify.warning('Solo puedes adjuntar imágenes.');
    }

    const availableSlots = MAX_MODULE_IMAGES - moduleImages.length;

    if (availableSlots <= 0) {
      notify.warning(`Solo puedes adjuntar un máximo de ${MAX_MODULE_IMAGES} imágenes.`);

      if (moduleImagesInputRef.current) {
        moduleImagesInputRef.current.value = '';
      }

      return;
    }

    if (onlyImages.length > availableSlots) {
      notify.warning(`Solo puedes agregar ${availableSlots} imagen(es) más.`);
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

      if (imageToRemove?.file && imageToRemove.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
      }

      return normalizeImageOrder(prev.filter((img) => img.id !== imageId));
    });
  };

  const moveModuleImage = (imageId: string, direction: 'up' | 'down') => {
    setModuleImages((prev) => {
      const currentIndex = prev.findIndex((img) => img.id === imageId);

      if (currentIndex === -1) return prev;

      const newIndex = direction === 'up'
        ? currentIndex - 1
        : currentIndex + 1;

      if (newIndex < 0 || newIndex >= prev.length) return prev;

      const updatedImages = [...prev];
      const temp = updatedImages[currentIndex];

      updatedImages[currentIndex] = updatedImages[newIndex];
      updatedImages[newIndex] = temp;

      return normalizeImageOrder(updatedImages);
    });
  };

  const buildImagesPayload = () => {
    return normalizeImageOrder(moduleImages).map((img, index) => ({
      id: img.id,
      name: img.name,
      previewUrl: img.url || img.path || img.previewUrl,
      url: img.url || img.path || img.previewUrl,
      path: img.path || img.url || img.previewUrl,
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
    formData.append('description', description.trim());
    formData.append('body', body.trim() || description.trim());
    formData.append('category', category);
    formData.append('duration', duration);
    formData.append('level', level);

    if (portada) {
      formData.append('portada', portada);
    }

    if (archivo) {
      formData.append('archivo', archivo);
    }

    if (editingModule && removeCover) {
      formData.append('removeCover', 'true');
    }

    if (editingModule && removeFile) {
      formData.append('removeFile', 'true');
    }

    moduleImages.forEach((img) => {
      if (img.file) {
        formData.append('imagenes', img.file);
      }
    });

    formData.append('images', JSON.stringify(buildImagesPayload()));

    if (editingModule && !removeCover && !portada) {
      formData.append('image', editingModule.image || '');
      formData.append('coverName', editingModule.coverName || '');
    }

    if (editingModule && !removeFile && !archivo) {
      formData.append('fileName', editingModule.fileName || '');
      formData.append('fileUrl', editingModule.fileUrl || '');
    }

    try {
      let response: Response;

      if (editingModule) {
        response = await fetch(`${API_URL}/api/education/${editingModule.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: formData
        });
      } else {
        response = await fetch(`${API_URL}/api/education`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: formData
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message || 'Error al guardar módulo educativo'
        );
      }

      resetForm();
      await loadModules();
      window.dispatchEvent(new Event('education-updated'));

      notify.success(
        editingModule
          ? 'Módulo actualizado correctamente.'
          : 'Módulo creado correctamente.'
      );
      notify.add({
        type: 'info',
        title: editingModule ? 'Módulo educativo actualizado' : 'Nuevo módulo educativo',
        message: title.trim()
      });
    } catch (error: any) {
      console.error('Error al guardar módulo educativo:', error);
      notify.error(error.message || 'Error al guardar módulo educativo.');
    }
  };

  const handleEdit = (module: EducationModule) => {
    clearLocalPreviewUrls();
    resetInputs();

    const normalizedModule = normalizeModuleFromApi(module);

    setEditingModule(normalizedModule);

    setTitle(normalizedModule.title);
    setDescription(normalizedModule.description);
    setBody(
      normalizedModule.body ||
      normalizedModule.cuerpo ||
      normalizedModule.content ||
      normalizedModule.description
    );
    setCategory(normalizeEducationType(normalizedModule.category));
    setDuration(normalizedModule.duration || '10 min');
    setLevel(
      normalizeDifficultyValue(normalizedModule.nivel || normalizedModule.level)
    );

    setPortada(null);
    setPortadaPreview(
      normalizedModule.image ? buildFileUrl(normalizedModule.image) : ''
    );
    setPortadaNombre(normalizedModule.coverName || '');
    setRemoveCover(false);

    setArchivo(null);
    setArchivoNombre(normalizedModule.fileName || '');
    setRemoveFile(false);

    setModuleImages(normalizedModule.images || []);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await notify.confirm({
      header: 'Eliminar módulo educativo',
      message: '¿Eliminar este módulo educativo? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      destructive: true
    });

    if (!confirmed) return;

    if (!token) {
      notify.warning('Debes iniciar sesión como administrador.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/education/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message || 'Error al eliminar módulo educativo'
        );
      }

      await loadModules();
      window.dispatchEvent(new Event('education-updated'));

      notify.success('Módulo eliminado correctamente.');
    } catch (error: any) {
      console.error('Error al eliminar módulo educativo:', error);
      notify.error(error.message || 'Error al eliminar módulo educativo.');
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
              <h2>
                {editingModule
                  ? 'Editar módulo educativo'
                  : 'Crear módulo educativo'}
              </h2>

              <p>
                Publica contenido educativo institucional para la comunidad.
              </p>
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
            <div className="form-row">
              <div className="form-group half">
                <label>Título</label>

                <IonInput
                  placeholder="Ej: ¿Qué es el phishing?"
                  value={title}
                  onIonChange={(e) => setTitle(e.detail.value || '')}
                  className="custom-input"
                />
              </div>

              <div className="form-group half">
                <label>Tipo de educación</label>

                <IonSelect
                  value={category}
                  onIonChange={(e) =>
                    setCategory(e.detail.value as EducationTypeValue)
                  }
                  interface="popover"
                  className="custom-select"
                >
                  {EDUCATION_TYPES.map((item) => (
                    <IonSelectOption key={item} value={item}>
                      {item}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label>Nivel</label>

                <IonSelect
                  value={level}
                  onIonChange={(e) =>
                    setLevel(e.detail.value as DifficultyValue)
                  }
                  interface="popover"
                  className="custom-select"
                >
                  {DIFFICULTY_OPTIONS.map((item) => (
                    <IonSelectOption key={item.value} value={item.value}>
                      {item.label}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </div>

              <div className="form-group half">
                <label>Duración visible</label>

                <IonInput
                  placeholder="Ej: 10 min"
                  value={duration}
                  onIonChange={(e) => setDuration(e.detail.value || '')}
                  className="custom-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Resumen</label>

              <IonTextarea
                placeholder="Resumen breve del módulo educativo."
                rows={3}
                value={description}
                onIonChange={(e) => setDescription(e.detail.value || '')}
                className="custom-textarea"
              />
            </div>

            <div className="form-group">
              <label>Contenido</label>

              <IonTextarea
                placeholder="Contenido completo del módulo. Si lo dejas vacío, se usará el resumen."
                rows={5}
                value={body}
                onIonChange={(e) => setBody(e.detail.value || '')}
                className="custom-textarea"
              />
            </div>

            <div className="form-group">
              <label>Portada</label>

              <div
                className={`file-drop-zone attachment-zone ${
                  removeCover ? 'attachment-zone-removed' : ''
                }`}
                onClick={() => portadaInputRef.current?.click()}
              >
                {(portadaPreview ||
                  portadaNombre ||
                  (!removeCover && editingModule?.image)) && (
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
                        editingModule?.coverName ||
                        'Seleccionar imagen de portada'}
                  </span>
                </div>

                <input
                  ref={portadaInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handlePortadaChange(e.target.files?.[0])}
                />
              </div>

              {portadaPreview && !removeCover && (
                <div className="image-preview-list">
                  <div className="image-preview-item">
                    <img decoding="async" loading="lazy"
                      src={buildFileUrl(portadaPreview)}
                      alt="Vista previa de portada"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>
                Imágenes adicionales ({moduleImages.length}/{MAX_MODULE_IMAGES})
              </label>

              {moduleImages.length < MAX_MODULE_IMAGES ? (
                <div
                  className="file-drop-zone"
                  onClick={() => moduleImagesInputRef.current?.click()}
                >
                  <div className="file-drop-content">
                    <IonIcon icon={cloudUploadOutline} />

                    <span>
                      Puedes agregar {MAX_MODULE_IMAGES - moduleImages.length}{' '}
                      imagen(es) más
                    </span>
                  </div>

                  <input
                    ref={moduleImagesInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={(e) =>
                      handleModuleImagesUpload(e.target.files)
                    }
                  />
                </div>
              ) : (
                <div className="images-limit-message">
                  Ya alcanzaste el límite de 10 imágenes.
                </div>
              )}

              {moduleImages.length > 0 && (
                <div className="ordered-images-list">
                  {moduleImages.map((img, index) => (
                    <div key={img.id} className="ordered-image-item">
                      <div className="ordered-image-preview-wrap">
                        <img decoding="async" loading="lazy"
                          src={buildFileUrl(img.previewUrl)}
                          alt={`Imagen ${index + 1}`}
                        />

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
              <label>Archivo adjunto</label>

              <div
                className={`file-drop-zone attachment-zone ${
                  removeFile ? 'attachment-zone-removed' : ''
                }`}
                onClick={() => archivoInputRef.current?.click()}
              >
                {(archivoNombre ||
                  (!removeFile && editingModule?.fileName)) && (
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
                  <IonIcon icon={documentOutline} />

                  <span>
                    {removeFile
                      ? 'Archivo eliminado'
                      : archivoNombre ||
                        editingModule?.fileName ||
                        'Seleccionar archivo PDF, DOC o DOCX'}
                  </span>
                </div>

                <input
                  ref={archivoInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  style={{ display: 'none' }}
                  onChange={(e) => handleArchivoChange(e.target.files?.[0])}
                />
              </div>
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
            <h2>Módulos educativos ({modules.length})</h2>
            <p>Busca, edita o elimina módulos existentes.</p>
          </div>

          <IonSearchbar
            value={searchTerm}
            placeholder="Buscar módulo..."
            onIonChange={(e) => setSearchTerm(e.detail.value || '')}
            mode="ios"
          />
        </div>

        <div className="modules-list">
          {filteredModules.length === 0 ? (
            <p>No hay módulos disponibles.</p>
          ) : (
            filteredModules.map((module) => (
              <div key={module.id} className="module-item">
                <div className="module-main">
                  <div className="module-thumb">
                    {module.image ? (
                      <img decoding="async" loading="lazy"
                        src={buildFileUrl(module.image)}
                        alt={module.title}
                      />
                    ) : (
                      <div className="module-thumb-placeholder">
                        Sin portada
                      </div>
                    )}
                  </div>

                  <div className="module-info">
                    <h4>{module.title}</h4>
                    <p>{module.description}</p>

                    <div className="module-meta">
                      <span className="module-tag">{module.category}</span>
                      <span>{module.duration || '10 min'}</span>
                      <span>{getDifficultyLabel(module.nivel || module.level)}</span>

                      {module.fileName && (
                        <span className="file-indicator">
                          <IonIcon icon={documentOutline} /> {module.fileName}
                        </span>
                      )}

                      {module.images && module.images.length > 0 && (
                        <span>{module.images.length} imagen(es)</span>
                      )}
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
                    Editar
                  </IonButton>

                  <IonButton
                    fill="clear"
                    size="small"
                    onClick={() => handleDelete(module.id)}
                    className="delete-btn"
                  >
                    <IonIcon icon={trashOutline} />
                    Eliminar
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
