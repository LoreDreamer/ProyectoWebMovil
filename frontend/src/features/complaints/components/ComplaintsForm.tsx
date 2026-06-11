import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import './ComplaintsForm.css';
import { API_URL } from '@/shared/api/apiClient';
import { notify } from '@/shared/notifications';

interface ComplaintAttachment {
  id: string;
  file: File;
  previewUrl: string;
}

const MAX_FILES = 10;
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const COMPLAINT_DRAFT_BASE_KEY = 'draft_denuncia';

const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

const ALLOWED_EXTENSIONS = [
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.pdf',
  '.doc',
  '.docx',
  '.txt'
];

const getFileExtension = (fileName: string) => {
  const lastDot = fileName.lastIndexOf('.');

  if (lastDot === -1) return '';

  return fileName.substring(lastDot).toLowerCase();
};

const isValidFile = (file: File) => {
  const extension = getFileExtension(file.name);

  return (
    ALLOWED_MIME_TYPES.includes(file.type) ||
    ALLOWED_EXTENSIONS.includes(extension)
  );
};

const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} B`;

  const kb = size / 1024;

  if (kb < 1024) return `${kb.toFixed(1)} KB`;

  const mb = kb / 1024;

  return `${mb.toFixed(1)} MB`;
};

const isImageFile = (file: File) => {
  return file.type.startsWith('image/');
};

const normalizeDraftKeyPart = (value: string) => {
  return value.trim().toLowerCase().replace(/[^a-z0-9@._-]/g, '_');
};

export const ComplaintsForm: React.FC = () => {
  const { user } = useAuth();

  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [tipoIncidente, setTipoIncidente] = useState('');
  const [fechaIncidente, setFechaIncidente] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [declaracion, setDeclaracion] = useState(false);
  const [archivos, setArchivos] = useState<ComplaintAttachment[]>([]);
  const [isSending, setIsSending] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const archivosRef = useRef<ComplaintAttachment[]>([]);
  const loadedDraftKeyRef = useRef<string | null>(null);

  const userName = user?.nombre_completo || user?.name || '';
  const userEmail = user?.email || user?.correo || '';
  const userDraftId = user?.id || userEmail;
  const complaintDraftKey = userDraftId
    ? `${COMPLAINT_DRAFT_BASE_KEY}_${normalizeDraftKeyPart(userDraftId)}`
    : '';

  useEffect(() => {
    archivosRef.current = archivos;
  }, [archivos]);

  useEffect(() => {
    return () => {
      archivosRef.current.forEach((attachment) => {
        URL.revokeObjectURL(attachment.previewUrl);
      });
    };
  }, []);

  useEffect(() => {
    // Limpia el borrador antiguo global para que no se cargue en sesiones equivocadas.
    window.localStorage.removeItem(COMPLAINT_DRAFT_BASE_KEY);

    if (!user || !complaintDraftKey) {
      loadedDraftKeyRef.current = null;
      setNombre('');
      setCorreo('');
      setTipoIncidente('');
      setFechaIncidente('');
      setDescripcion('');
      setDeclaracion(false);
      return;
    }

    if (loadedDraftKeyRef.current === complaintDraftKey) {
      setNombre(userName);
      setCorreo(userEmail);
      return;
    }

    try {
      const savedDraft = window.localStorage.getItem(complaintDraftKey);

      if (savedDraft) {
        const draft = JSON.parse(savedDraft);

        setNombre(userName);
        setCorreo(userEmail);
        setTipoIncidente(draft.tipoIncidente || '');
        setFechaIncidente(draft.fechaIncidente || '');
        setDescripcion(draft.descripcion || '');
        setDeclaracion(Boolean(draft.declaracion));
        loadedDraftKeyRef.current = complaintDraftKey;
        return;
      }
    } catch {
      window.localStorage.removeItem(complaintDraftKey);
    }

    setNombre(userName);
    setCorreo(userEmail);
    setTipoIncidente('');
    setFechaIncidente('');
    setDescripcion('');
    setDeclaracion(false);
    loadedDraftKeyRef.current = complaintDraftKey;
  }, [user, userName, userEmail, complaintDraftKey]);

  useEffect(() => {
    if (!user || !complaintDraftKey || isSending) return;

    if (loadedDraftKeyRef.current !== complaintDraftKey) return;

    const hasDraftData =
      tipoIncidente.trim() ||
      fechaIncidente.trim() ||
      descripcion.trim() ||
      declaracion;

    if (!hasDraftData) {
      window.localStorage.removeItem(complaintDraftKey);
      return;
    }

    window.localStorage.setItem(
      complaintDraftKey,
      JSON.stringify({
        nombre: userName,
        correo: userEmail,
        tipoIncidente,
        fechaIncidente,
        descripcion,
        declaracion
      })
    );
  }, [
    tipoIncidente,
    fechaIncidente,
    descripcion,
    declaracion,
    isSending,
    user,
    userName,
    userEmail,
    complaintDraftKey
  ]);

  const clearLocalPreviewUrls = () => {
    archivos.forEach((attachment) => {
      URL.revokeObjectURL(attachment.previewUrl);
    });
  };

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetForm = () => {
    clearLocalPreviewUrls();

    setNombre(userName);
    setCorreo(userEmail);
    setTipoIncidente('');
    setFechaIncidente('');
    setDescripcion('');
    setDeclaracion(false);
    setArchivos([]);
    setIsSending(false);
    if (complaintDraftKey) {
      window.localStorage.removeItem(complaintDraftKey);
    }

    resetFileInput();
  };

  const addFiles = (filesList?: FileList | File[] | null) => {
    const selectedFiles = Array.from(filesList || []);

    if (selectedFiles.length === 0) return;

    const availableSlots = MAX_FILES - archivos.length;

    if (availableSlots <= 0) {
      notify.warning(`Solo puedes adjuntar un máximo de ${MAX_FILES} archivos.`);
      resetFileInput();
      return;
    }

    const validFiles: File[] = [];

    selectedFiles.forEach((file) => {
      if (!isValidFile(file)) {
        notify.warning(
          `Archivo no permitido: ${file.name}. Solo se aceptan imágenes, PDF, DOC, DOCX o TXT.`
        );
        return;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        notify.warning(
          `El archivo ${file.name} supera el límite de ${MAX_FILE_SIZE_MB} MB.`
        );
        return;
      }

      validFiles.push(file);
    });

    if (validFiles.length === 0) {
      resetFileInput();
      return;
    }

    if (validFiles.length > availableSlots) {
      notify.warning(
        `Solo puedes agregar ${availableSlots} archivo(s) más. El límite total es ${MAX_FILES}.`
      );
    }

    const filesToAdd = validFiles.slice(0, availableSlots);

    const newAttachments: ComplaintAttachment[] = filesToAdd.map(
      (file, index) => ({
        id: `${Date.now()}-${index}-${file.name}`,
        file,
        previewUrl: URL.createObjectURL(file)
      })
    );

    setArchivos((prev) => [...prev, ...newAttachments]);
    notify.info(`${newAttachments.length} archivo(s) agregado(s) a la denuncia.`);
    resetFileInput();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
  };

  const handleRemoveFile = (
    e: React.MouseEvent<HTMLButtonElement>,
    attachmentId: string
  ) => {
    e.stopPropagation();

    setArchivos((prev) => {
      const attachmentToRemove = prev.find((item) => item.id === attachmentId);

      if (attachmentToRemove) {
        URL.revokeObjectURL(attachmentToRemove.previewUrl);
      }

      return prev.filter((item) => item.id !== attachmentId);
    });

    resetFileInput();
  };

  const handleClearFiles = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    clearLocalPreviewUrls();
    setArchivos([]);
    resetFileInput();
  };

  const validateForm = () => {
    if (
      !nombre.trim() ||
      !correo.trim() ||
      !tipoIncidente.trim() ||
      !fechaIncidente.trim() ||
      !descripcion.trim()
    ) {
      notify.warning('Por favor completa todos los campos obligatorios.');
      return false;
    }

    if (!declaracion) {
      notify.warning('Debes aceptar la declaración antes de enviar la denuncia.');
      return false;
    }

    if (archivos.length > MAX_FILES) {
      notify.warning(`Solo puedes adjuntar un máximo de ${MAX_FILES} archivos.`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const formData = new FormData();

    formData.append('nombre', nombre.trim());
    formData.append('correo', correo.trim().toLowerCase());
    formData.append('tipoIncidente', tipoIncidente);
    formData.append('fechaIncidente', fechaIncidente);
    formData.append('descripcion', descripcion.trim());

    archivos.forEach((attachment) => {
      formData.append('archivos', attachment.file);
    });

    try {
      setIsSending(true);

      const response = await fetch(`${API_URL}/api/denuncias`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        notify.error(
          `Error al enviar: ${
            errorData?.error ||
            errorData?.message ||
            'No se pudo enviar la denuncia'
          }`
        );

        return;
      }

      notify.success('¡Denuncia enviada con éxito al municipio!');
      notify.add({
        type: 'success',
        title: 'Denuncia enviada',
        message: 'Tu denuncia fue registrada correctamente.'
      });
      resetForm();
    } catch (error) {
      console.error('Error de conexión:', error);
      notify.error('No se pudo conectar con el servidor municipal.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="complaints-form-container">
      <header className="complaints-form-header">
        <div className="complaints-icon-box">
          <span>📋</span>
        </div>

        <div className="complaints-header-text">
          <h1>Formulario de Denuncia</h1>
          <p>Todos los campos marcados son obligatorios.</p>
        </div>
      </header>

      <form className="complaints-denuncia-form" onSubmit={handleSubmit}>
        <div className="complaints-field">
          <label>Nombre completo</label>

          <input
            type="text"
            placeholder="Escribe tu nombre completo"
            required
            value={nombre}
            disabled={!!user}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>

        <div className="complaints-field">
          <label>Correo electrónico</label>

          <input
            type="email"
            placeholder="ejemplo@correo.com"
            required
            value={correo}
            disabled={!!user}
            onChange={(e) => setCorreo(e.target.value)}
          />
        </div>

        <div className="complaints-row">
          <div className="complaints-field">
            <label>Tipo de incidente</label>

            <select
              required
              value={tipoIncidente}
              onChange={(e) => setTipoIncidente(e.target.value)}
            >
              <option value="">Selecciona el tipo</option>
              <option value="infraestructura">Infraestructura</option>
              <option value="seguridad">Seguridad</option>
              <option value="ciberseguridad">Ciberseguridad</option>
              <option value="servicios_municipales">
                Servicios municipales
              </option>
              <option value="otros">Otros</option>
            </select>
          </div>

          <div className="complaints-field">
            <label>Fecha del incidente</label>

            <input
              type="date"
              required
              value={fechaIncidente}
              onChange={(e) => setFechaIncidente(e.target.value)}
            />
          </div>
        </div>

        <div className="complaints-field">
          <label>Descripción del problema</label>

          <textarea
            rows={4}
            placeholder="Describe lo sucedido con la mayor claridad posible."
            required
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>

        <div className="complaints-field">
          <label>
            Archivos adjuntos opcionales ({archivos.length}/{MAX_FILES})
          </label>

          <div
            className={`complaints-file-zone ${
              archivos.length > 0 ? 'complaints-file-zone-active' : ''
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={(e) => {
              e.preventDefault();
              addFiles(e.dataTransfer.files);
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            {archivos.length > 0 && (
              <button
                type="button"
                className="complaints-file-remove"
                aria-label="Quitar todos los archivos"
                onClick={handleClearFiles}
              >
                ×
              </button>
            )}

            <div className="complaints-file-content">
              <span className="complaints-file-icon">📎</span>

              <span>
                {archivos.length > 0
                  ? `${archivos.length} archivo(s) seleccionado(s)`
                  : 'Haz clic o arrastra hasta 10 archivos aquí'}
              </span>

              <small>
                Imágenes, PDF, DOC, DOCX o TXT. Máximo {MAX_FILE_SIZE_MB} MB por
                archivo.
              </small>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,.png,.jpg,.jpeg,.webp,.pdf,.doc,.docx,.txt"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>

          {archivos.length > 0 && (
            <div className="complaints-files-list">
              {archivos.map((attachment, index) => (
                <div key={attachment.id} className="complaints-file-item">
                  <div className="complaints-file-preview">
                    {isImageFile(attachment.file) ? (
                      <img
                        src={attachment.previewUrl}
                        alt={attachment.file.name}
                      />
                    ) : (
                      <span>
                        {getFileExtension(attachment.file.name).replace(
                          '.',
                          ''
                        ) || 'file'}
                      </span>
                    )}
                  </div>

                  <div className="complaints-file-info">
                    <strong>
                      {index + 1}. {attachment.file.name}
                    </strong>

                    <span>
                      {attachment.file.type || 'Archivo'} ·{' '}
                      {formatFileSize(attachment.file.size)}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="complaints-file-item-remove"
                    onClick={(e) => handleRemoveFile(e, attachment.id)}
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="complaints-form-footer">
          <label className="complaints-checkbox-container">
            <input
              type="checkbox"
              required
              checked={declaracion}
              onChange={(e) => setDeclaracion(e.target.checked)}
            />

            <span>
              Declaro que la información entregada es verdadera y que la entrego
              de buena fe para colaborar con la prevención de incidentes.
            </span>
          </label>

          <button type="submit" className="btn-send" disabled={isSending}>
            {isSending ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComplaintsForm;
