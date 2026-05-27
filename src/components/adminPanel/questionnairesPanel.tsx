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

type RiskValue = 'BAJO' | 'MEDIO' | 'ALTO';

interface QuestionnaireImage {
  id: string;
  file?: File;
  previewUrl: string;
  url?: string;
  path?: string;
  name: string;
  type?: string;
  size?: number | null;
  order: number;
}

interface Questionnaire {
  id: string;

  title: string;
  titulo?: string;

  description: string;
  resumen?: string;

  category?: string;

  risk: RiskValue;
  riesgo?: string;
  difficulty?: string;

  questionsCount?: number;
  questions_count?: number;
  puntajeMaximo?: number;
  puntaje_maximo?: number;

  createdAt?: string | null;

  fileUrl?: string;
  fileName?: string;
  archivo_url?: string;
  archivo_nombre?: string;
  archivo_tipo?: string;

  coverUrl?: string;
  coverName?: string;
  cover_img?: string;

  images?: QuestionnaireImage[];
  imagenes?: string[];

  publicado_por?: string | null;
}

const API_URL = 'http://localhost:3000';
const MAX_QUESTIONNAIRE_IMAGES = 10;

const normalizeRiskToUpper = (value?: string): RiskValue => {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (normalized === 'alto') return 'ALTO';
  if (normalized === 'bajo') return 'BAJO';

  return 'MEDIO';
};

export const QuestionnairesPanel: React.FC = () => {
  const { user, token } = useAuth();

  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingQuestionnaire, setEditingQuestionnaire] =
    useState<Questionnaire | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [risk, setRisk] = useState<RiskValue>('MEDIO');
  const [questionsCount, setQuestionsCount] = useState('10');

  const [archivo, setArchivo] = useState<File | null>(null);
  const [archivoNombre, setArchivoNombre] = useState('');
  const [removeFile, setRemoveFile] = useState(false);

  const [portada, setPortada] = useState<File | null>(null);
  const [portadaPreview, setPortadaPreview] = useState('');
  const [portadaNombre, setPortadaNombre] = useState('');
  const [removeCover, setRemoveCover] = useState(false);

  const [questionnaireImages, setQuestionnaireImages] = useState<
    QuestionnaireImage[]
  >([]);

  const portadaInputRef = useRef<HTMLInputElement | null>(null);
  const archivoInputRef = useRef<HTMLInputElement | null>(null);
  const questionnaireImagesInputRef = useRef<HTMLInputElement | null>(null);

  const questionnaireImagesRef = useRef<QuestionnaireImage[]>([]);
  const portadaRef = useRef<File | null>(null);
  const portadaPreviewRef = useRef('');

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    questionnaireImagesRef.current = questionnaireImages;
  }, [questionnaireImages]);

  useEffect(() => {
    portadaRef.current = portada;
    portadaPreviewRef.current = portadaPreview;
  }, [portada, portadaPreview]);

  useEffect(() => {
    return () => {
      questionnaireImagesRef.current.forEach((img) => {
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

  const normalizeImageOrder = (images: QuestionnaireImage[]) => {
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

    if (questionnaireImagesInputRef.current) {
      questionnaireImagesInputRef.current.value = '';
    }
  };

  const clearLocalPreviewUrls = () => {
    questionnaireImages.forEach((img) => {
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
    setCategory('General');
    setRisk('MEDIO');
    setQuestionsCount('10');

    setArchivo(null);
    setArchivoNombre('');
    setRemoveFile(false);

    setPortada(null);
    setPortadaPreview('');
    setPortadaNombre('');
    setRemoveCover(false);

    setQuestionnaireImages([]);
    setEditingQuestionnaire(null);

    resetInputs();
  };

  const normalizeQuestionnaireFromApi = (
    questionnaire: Questionnaire
  ): Questionnaire => {
    const normalizedImages = normalizeImageOrder(
      (questionnaire.images || []).map((img, index) => ({
        ...img,
        id: img.id || `${index + 1}-${img.previewUrl || img.url || img.path}`,
        name: img.name || `imagen-${index + 1}`,
        previewUrl: buildFileUrl(img.previewUrl || img.url || img.path || ''),
        url: img.url || img.previewUrl || img.path || '',
        path: img.path || img.url || img.previewUrl || '',
        type: img.type || '',
        size: img.size || null,
        order: index + 1
      }))
    );

    const score =
      questionnaire.puntajeMaximo ||
      questionnaire.puntaje_maximo ||
      questionnaire.questionsCount ||
      questionnaire.questions_count ||
      10;

    return {
      ...questionnaire,
      id: String(questionnaire.id),
      title: questionnaire.title || questionnaire.titulo || '',
      description: questionnaire.description || questionnaire.resumen || '',
      category: questionnaire.category || 'General',
      risk: normalizeRiskToUpper(
        questionnaire.risk ||
          questionnaire.riesgo ||
          questionnaire.difficulty
      ),
      questionsCount: score,
      questions_count: score,
      puntajeMaximo: score,
      puntaje_maximo: score,
      coverUrl: questionnaire.coverUrl || questionnaire.cover_img || '',
      coverName: questionnaire.coverName || '',
      fileUrl: questionnaire.fileUrl || questionnaire.archivo_url || '',
      fileName: questionnaire.fileName || questionnaire.archivo_nombre || '',
      images: normalizedImages
    };
  };

  const loadQuestionnaires = async () => {
    try {
      const response = await fetch(`${API_URL}/api/questionnaires`);

      if (!response.ok) {
        throw new Error('No se pudieron cargar los cuestionarios');
      }

      const data = await response.json();

      setQuestionnaires(
        Array.isArray(data)
          ? data.map((item) => normalizeQuestionnaireFromApi(item))
          : []
      );
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
    q.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (q.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.risk.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePortadaChange = (file?: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('La portada debe ser una imagen.');
      return;
    }

    if (portada && portadaPreview.startsWith('blob:')) {
      URL.revokeObjectURL(portadaPreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setPortada(file);
    setPortadaNombre(file.name);
    setPortadaPreview(previewUrl);
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
      alert('El archivo debe ser PDF, DOC o DOCX.');
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

    if (editingQuestionnaire?.coverUrl) {
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

    if (editingQuestionnaire?.fileUrl) {
      setRemoveFile(true);
    } else {
      setRemoveFile(false);
    }

    if (archivoInputRef.current) {
      archivoInputRef.current.value = '';
    }
  };

  const handleQuestionnaireImagesUpload = (filesList?: FileList | null) => {
    const files = Array.from(filesList || []);

    if (files.length === 0) return;

    const onlyImages = files.filter((file) => file.type.startsWith('image/'));

    if (onlyImages.length !== files.length) {
      alert('Solo puedes adjuntar imágenes.');
    }

    const availableSlots =
      MAX_QUESTIONNAIRE_IMAGES - questionnaireImages.length;

    if (availableSlots <= 0) {
      alert(
        `Solo puedes adjuntar un máximo de ${MAX_QUESTIONNAIRE_IMAGES} imágenes.`
      );

      if (questionnaireImagesInputRef.current) {
        questionnaireImagesInputRef.current.value = '';
      }

      return;
    }

    if (onlyImages.length > availableSlots) {
      alert(`Solo puedes agregar ${availableSlots} imagen(es) más.`);
    }

    const filesToAdd = onlyImages.slice(0, availableSlots);

    const newImages: QuestionnaireImage[] = filesToAdd.map((file, index) => ({
      id: `${Date.now()}-${index}-${file.name}`,
      file,
      previewUrl: URL.createObjectURL(file),
      name: file.name,
      type: file.type,
      size: file.size,
      order: questionnaireImages.length + index + 1
    }));

    setQuestionnaireImages((prev) =>
      normalizeImageOrder([...prev, ...newImages])
    );

    if (questionnaireImagesInputRef.current) {
      questionnaireImagesInputRef.current.value = '';
    }
  };

  const removeQuestionnaireImage = (imageId: string) => {
    setQuestionnaireImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === imageId);

      if (imageToRemove?.file && imageToRemove.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
      }

      return normalizeImageOrder(prev.filter((img) => img.id !== imageId));
    });
  };

  const moveQuestionnaireImage = (
    imageId: string,
    direction: 'up' | 'down'
  ) => {
    setQuestionnaireImages((prev) => {
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
    return normalizeImageOrder(questionnaireImages).map((img, index) => ({
      id: img.id,
      name: img.name,
      previewUrl: img.url || img.path || img.previewUrl,
      url: img.url || img.path || img.previewUrl,
      path: img.path || img.url || img.previewUrl,
      type: img.type || '',
      size: img.size || null,
      order: index + 1
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      alert('Completa título y descripción.');
      return;
    }

    if (!token) {
      alert('Debes iniciar sesión como administrador.');
      return;
    }

    const score = Number(questionsCount);

    if (!Number.isFinite(score) || score <= 0) {
      alert('El puntaje máximo debe ser un número mayor a 0.');
      return;
    }

    const formData = new FormData();

    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('category', category.trim() || 'General');
    formData.append('risk', risk);
    formData.append('difficulty', risk);
    formData.append('questionsCount', String(Math.round(score)));
    formData.append('questions_count', String(Math.round(score)));
    formData.append('puntajeMaximo', String(Math.round(score)));
    formData.append('puntaje_maximo', String(Math.round(score)));

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

    questionnaireImages.forEach((img) => {
      if (img.file) {
        formData.append('imagenes', img.file);
      }
    });

    const orderedImages = buildImagesPayload();

    formData.append('images', JSON.stringify(orderedImages));
    formData.append('imagenesOrden', JSON.stringify(orderedImages));

    if (editingQuestionnaire && !removeCover && !portada) {
      formData.append('coverUrl', editingQuestionnaire.coverUrl || '');
      formData.append('coverName', editingQuestionnaire.coverName || '');
    }

    if (editingQuestionnaire && !removeFile && !archivo) {
      formData.append('fileName', editingQuestionnaire.fileName || '');
      formData.append('fileUrl', editingQuestionnaire.fileUrl || '');
    }

    try {
      let response: Response;

      if (editingQuestionnaire) {
        response = await fetch(
          `${API_URL}/api/questionnaires/${editingQuestionnaire.id}`,
          {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: formData
          }
        );
      } else {
        response = await fetch(`${API_URL}/api/questionnaires`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: formData
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message || 'Error al guardar el cuestionario'
        );
      }

      resetForm();
      await loadQuestionnaires();
      window.dispatchEvent(new Event('questionnaires-updated'));

      alert(
        editingQuestionnaire
          ? 'Cuestionario actualizado correctamente.'
          : 'Cuestionario creado correctamente.'
      );
    } catch (error: any) {
      console.error('Error al guardar cuestionario:', error);
      alert(error.message || 'Error al guardar el cuestionario.');
    }
  };

  const handleEdit = (questionnaire: Questionnaire) => {
    clearLocalPreviewUrls();
    resetInputs();

    const normalizedQuestionnaire =
      normalizeQuestionnaireFromApi(questionnaire);

    setEditingQuestionnaire(normalizedQuestionnaire);

    setTitle(normalizedQuestionnaire.title);
    setDescription(normalizedQuestionnaire.description);
    setCategory(normalizedQuestionnaire.category || 'General');
    setRisk(normalizedQuestionnaire.risk);
    setQuestionsCount(
      String(
        normalizedQuestionnaire.puntajeMaximo ||
          normalizedQuestionnaire.puntaje_maximo ||
          normalizedQuestionnaire.questionsCount ||
          normalizedQuestionnaire.questions_count ||
          10
      )
    );

    setArchivo(null);
    setArchivoNombre(normalizedQuestionnaire.fileName || '');
    setRemoveFile(false);

    setPortada(null);
    setPortadaPreview(
      normalizedQuestionnaire.coverUrl
        ? buildFileUrl(normalizedQuestionnaire.coverUrl)
        : ''
    );
    setPortadaNombre(normalizedQuestionnaire.coverName || '');
    setRemoveCover(false);

    setQuestionnaireImages(normalizedQuestionnaire.images || []);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar este cuestionario?')) return;

    if (!token) {
      alert('Debes iniciar sesión como administrador.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/questionnaires/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message || 'Error al eliminar el cuestionario'
        );
      }

      await loadQuestionnaires();
      window.dispatchEvent(new Event('questionnaires-updated'));

      if (editingQuestionnaire?.id === id) {
        resetForm();
      }

      alert('Cuestionario eliminado correctamente.');
    } catch (error: any) {
      console.error('Error al eliminar cuestionario:', error);
      alert(error.message || 'Error al eliminar el cuestionario.');
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
              <h2>
                {editingQuestionnaire
                  ? 'Editar Cuestionario'
                  : 'Nuevo Cuestionario'}
              </h2>

              <p>
                Crea cuestionarios de evaluación con portada, archivo e imágenes
                ordenadas.
              </p>
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
            <div className="form-row">
              <div className="form-group half">
                <label>Título</label>

                <IonInput
                  placeholder="Ej: Phishing y correo"
                  value={title}
                  onIonChange={(e) => setTitle(String(e.detail.value || ''))}
                  className="custom-input"
                />
              </div>

              <div className="form-group half">
                <label>Riesgo</label>

                <IonSelect
                  value={risk}
                  onIonChange={(e) => setRisk(e.detail.value as RiskValue)}
                  interface="popover"
                  className="custom-select"
                >
                  <IonSelectOption value="BAJO">Bajo</IonSelectOption>
                  <IonSelectOption value="MEDIO">Medio</IonSelectOption>
                  <IonSelectOption value="ALTO">Alto</IonSelectOption>
                </IonSelect>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label>Categoría visible</label>

                <IonInput
                  placeholder="Ej: General"
                  value={category}
                  onIonChange={(e) => setCategory(String(e.detail.value || ''))}
                  className="custom-input"
                />
              </div>

              <div className="form-group half">
                <label>Puntaje máximo</label>

                <IonInput
                  type="number"
                  min="1"
                  placeholder="Ej: 100"
                  value={questionsCount}
                  onIonChange={(e) =>
                    setQuestionsCount(String(e.detail.value || ''))
                  }
                  className="custom-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Descripción</label>

              <IonTextarea
                placeholder="Describe el objetivo del cuestionario."
                rows={4}
                value={description}
                onIonChange={(e) => setDescription(String(e.detail.value || ''))}
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
                  (!removeCover && editingQuestionnaire?.coverUrl)) && (
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
                  onChange={(e) => handlePortadaChange(e.target.files?.[0])}
                />
              </div>

              {portadaPreview && !removeCover && (
                <div className="image-preview-list">
                  <div className="image-preview-item">
                    <img
                      src={buildFileUrl(portadaPreview)}
                      alt="Vista previa de portada"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>
                Imágenes adicionales ({questionnaireImages.length}/
                {MAX_QUESTIONNAIRE_IMAGES})
              </label>

              {questionnaireImages.length < MAX_QUESTIONNAIRE_IMAGES ? (
                <div
                  className="file-drop-zone"
                  onClick={() => questionnaireImagesInputRef.current?.click()}
                >
                  <div className="file-drop-content">
                    <IonIcon icon={cloudUploadOutline} />

                    <span>
                      Puedes agregar{' '}
                      {MAX_QUESTIONNAIRE_IMAGES - questionnaireImages.length}{' '}
                      imagen(es) más
                    </span>
                  </div>

                  <input
                    ref={questionnaireImagesInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={(e) =>
                      handleQuestionnaireImagesUpload(e.target.files)
                    }
                  />
                </div>
              ) : (
                <div className="images-limit-message">
                  Ya alcanzaste el límite de 10 imágenes.
                </div>
              )}

              {questionnaireImages.length > 0 && (
                <div className="ordered-images-list">
                  {questionnaireImages.map((img, index) => (
                    <div key={img.id} className="ordered-image-item">
                      <div className="ordered-image-preview-wrap">
                        <img
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
                            moveQuestionnaireImage(img.id, 'up');
                          }}
                        >
                          Subir
                        </IonButton>

                        <IonButton
                          fill="clear"
                          size="small"
                          disabled={index === questionnaireImages.length - 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            moveQuestionnaireImage(img.id, 'down');
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
                            removeQuestionnaireImage(img.id);
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
                  (!removeFile && editingQuestionnaire?.fileName)) && (
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
                        editingQuestionnaire?.fileName ||
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
                {editingQuestionnaire
                  ? 'Guardar Cambios'
                  : 'Crear Cuestionario'}
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
            filteredQuestionnaires.map((questionnaire) => (
              <div key={questionnaire.id} className="questionnaire-item">
                <div className="questionnaire-info">
                  <div className="questionnaire-cover">
                    {questionnaire.coverUrl ? (
                      <img
                        src={buildFileUrl(questionnaire.coverUrl)}
                        alt={questionnaire.title}
                      />
                    ) : (
                      <div className="questionnaire-cover-placeholder">
                        Sin portada
                      </div>
                    )}
                  </div>

                  <div>
                    <h4>{questionnaire.title}</h4>
                    <p>{questionnaire.description}</p>

                    <div className="questionnaire-meta">
                      <span
                        className="risk-dot"
                        style={{
                          backgroundColor: getRiskColor(questionnaire.risk)
                        }}
                      />

                      <span>Riesgo {questionnaire.risk}</span>

                      <span>
                        Puntaje máximo:{' '}
                        {questionnaire.puntajeMaximo ||
                          questionnaire.puntaje_maximo ||
                          questionnaire.questionsCount ||
                          questionnaire.questions_count ||
                          10}
                      </span>

                      {questionnaire.fileName && (
                        <span>
                          <IonIcon icon={documentOutline} />{' '}
                          {questionnaire.fileName}
                        </span>
                      )}

                      {questionnaire.images &&
                        questionnaire.images.length > 0 && (
                          <span>
                            {questionnaire.images.length} imagen(es)
                          </span>
                        )}
                    </div>
                  </div>
                </div>

                <div className="questionnaire-actions">
                  <IonButton
                    fill="clear"
                    size="small"
                    onClick={() => handleEdit(questionnaire)}
                  >
                    <IonIcon icon={createOutline} />
                    Editar
                  </IonButton>

                  <IonButton
                    fill="clear"
                    size="small"
                    onClick={() => handleDelete(questionnaire.id)}
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

export default QuestionnairesPanel;