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
  documentOutline,
  cloudUploadOutline
} from 'ionicons/icons';
import { useAuth } from '../../context/AuthContext';
import './protocolsPanel.css';

type ProtocolCategory = 'Teletrabajo' | 'Ciberseguridad' | 'Atencion Ciudadana';

interface ProtocolFile {
  id: string;
  name: string;
  url: string;
  path?: string;
  type?: string;
  size?: number | null;
  order: number;
}

interface Protocol {
  id: string;

  titulo: string;

  descripcion: string;
  resumen?: string;

  fecha: string;
  fechaRaw?: string;

  categoria: ProtocolCategory | string;

  archivoUrl?: string;
  archivo_url?: string;

  archivoNombre?: string;
  archivo_nombre?: string;

  archivoTipo?: string;
  archivo_tipo?: string;

  archivos?: ProtocolFile[];

  publicado_por?: string | null;
  autor?: string | null;
}

const API_URL = 'http://localhost:3000';
const MAX_PROTOCOL_FILES = 10;
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp'
];

const ALLOWED_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp'
];

const PROTOCOL_CATEGORIES: ProtocolCategory[] = [
  'Teletrabajo',
  'Ciberseguridad',
  'Atencion Ciudadana'
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

const formatFileSize = (size?: number | null) => {
  if (!size) return 'Tamaño no disponible';

  if (size < 1024) return `${size} B`;

  const kb = size / 1024;

  if (kb < 1024) return `${kb.toFixed(1)} KB`;

  const mb = kb / 1024;

  return `${mb.toFixed(1)} MB`;
};

const normalizeCategory = (value?: string): ProtocolCategory => {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (normalized.includes('teletrabajo')) {
    return 'Teletrabajo';
  }

  if (normalized.includes('atencion') || normalized.includes('ciudadan')) {
    return 'Atencion Ciudadana';
  }

  return 'Ciberseguridad';
};

export const ProtocolsPanel: React.FC = () => {
  const { user, token } = useAuth();

  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProtocol, setEditingProtocol] = useState<Protocol | null>(null);

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState<ProtocolCategory>('Ciberseguridad');

  const [protocolFiles, setProtocolFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<ProtocolFile[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isAdmin = user?.role === 'admin';

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

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetForm = () => {
    setTitulo('');
    setDescripcion('');
    setCategoria('Ciberseguridad');
    setProtocolFiles([]);
    setExistingFiles([]);
    setEditingProtocol(null);
    resetFileInput();
  };

  const normalizeFiles = (files?: ProtocolFile[]): ProtocolFile[] => {
    if (!Array.isArray(files)) return [];

    return files
      .filter((file) => file?.url || file?.path)
      .map((file, index) => {
        const url = file.url || file.path || '';

        return {
          id: String(file.id || `${index + 1}-${url}`),
          name: file.name || `archivo-${index + 1}`,
          url,
          path: file.path || url,
          type: file.type || '',
          size: typeof file.size === 'number' ? file.size : null,
          order: index + 1
        };
      })
      .slice(0, MAX_PROTOCOL_FILES);
  };

  const normalizeProtocolFromApi = (protocol: Protocol): Protocol => {
    const files = normalizeFiles(protocol.archivos || []);

    const fallbackFileUrl =
      protocol.archivoUrl ||
      protocol.archivo_url ||
      files[0]?.url ||
      '';

    const fallbackFileName =
      protocol.archivoNombre ||
      protocol.archivo_nombre ||
      files[0]?.name ||
      '';

    const allFiles =
      files.length > 0
        ? files
        : fallbackFileUrl
          ? [
              {
                id: `${protocol.id}-archivo-principal`,
                name: fallbackFileName || 'Documento',
                url: fallbackFileUrl,
                path: fallbackFileUrl,
                type: protocol.archivoTipo || protocol.archivo_tipo || '',
                size: null,
                order: 1
              }
            ]
          : [];

    return {
      ...protocol,
      id: String(protocol.id),
      titulo: protocol.titulo || '',
      descripcion: protocol.descripcion || protocol.resumen || '',
      fecha: protocol.fecha || '',
      categoria: normalizeCategory(protocol.categoria),
      archivoUrl: fallbackFileUrl,
      archivoNombre: fallbackFileName,
      archivos: allFiles
    };
  };

  const loadProtocols = async () => {
    try {
      const response = await fetch(`${API_URL}/api/protocolos`);

      if (!response.ok) {
        throw new Error('No se pudieron cargar los protocolos');
      }

      const data = await response.json();

      setProtocols(
        Array.isArray(data)
          ? data.map((protocol) => normalizeProtocolFromApi(protocol))
          : []
      );
    } catch (error) {
      console.error('Error al cargar protocolos:', error);
      setProtocols([]);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;

    loadProtocols();

    const handler = () => loadProtocols();
    window.addEventListener('protocolos-updated', handler);

    return () => {
      window.removeEventListener('protocolos-updated', handler);
    };
  }, [isAdmin, token]);

  const filteredProtocols = protocols.filter((protocol) =>
    protocol.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    protocol.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(protocol.categoria).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalFiles = existingFiles.length + protocolFiles.length;

  const handleFilesChange = (filesList?: FileList | null) => {
    const selectedFiles = Array.from(filesList || []);

    if (selectedFiles.length === 0) return;

    const availableSlots = MAX_PROTOCOL_FILES - totalFiles;

    if (availableSlots <= 0) {
      alert(`Solo puedes adjuntar un máximo de ${MAX_PROTOCOL_FILES} archivos.`);
      resetFileInput();
      return;
    }

    const validFiles: File[] = [];

    selectedFiles.forEach((file) => {
      if (!isValidFile(file)) {
        alert(
          `Archivo no permitido: ${file.name}. Solo se permiten PDF, DOC, DOCX, PNG, JPG, JPEG o WEBP.`
        );
        return;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        alert(
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
      alert(
        `Solo puedes agregar ${availableSlots} archivo(s) más. El límite total es ${MAX_PROTOCOL_FILES}.`
      );
    }

    setProtocolFiles((prev) => [
      ...prev,
      ...validFiles.slice(0, availableSlots)
    ]);

    resetFileInput();
  };

  const removeExistingFile = (fileId: string) => {
    setExistingFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const removeNewFile = (indexToRemove: number) => {
    setProtocolFiles((prev) =>
      prev.filter((_file, index) => index !== indexToRemove)
    );

    resetFileInput();
  };

  const moveExistingFile = (fileId: string, direction: 'up' | 'down') => {
    setExistingFiles((prev) => {
      const currentIndex = prev.findIndex((file) => file.id === fileId);

      if (currentIndex === -1) return prev;

      const newIndex =
        direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      if (newIndex < 0 || newIndex >= prev.length) return prev;

      const updated = [...prev];
      const temp = updated[currentIndex];

      updated[currentIndex] = updated[newIndex];
      updated[newIndex] = temp;

      return updated.map((file, index) => ({
        ...file,
        order: index + 1
      }));
    });
  };

  const buildExistingFilesPayload = () => {
    return existingFiles.map((file, index) => ({
      id: file.id,
      name: file.name,
      url: file.url || file.path || '',
      path: file.path || file.url || '',
      type: file.type || '',
      size: file.size || null,
      order: index + 1
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo.trim() || !descripcion.trim()) {
      alert('Completa título y descripción.');
      return;
    }

    if (!token) {
      alert('Debes iniciar sesión como administrador.');
      return;
    }

    if (totalFiles === 0) {
      alert('Debes adjuntar al menos un archivo.');
      return;
    }

    const formData = new FormData();

    formData.append('titulo', titulo.trim());
    formData.append('descripcion', descripcion.trim());
    formData.append('resumen', descripcion.trim());
    formData.append('categoria', categoria);
    formData.append('existingFiles', JSON.stringify(buildExistingFilesPayload()));

    protocolFiles.forEach((file, index) => {
      if (index === 0) {
        formData.append('archivo', file);
      }

      formData.append('archivos', file);
    });

    try {
      let response: Response;

      if (editingProtocol) {
        response = await fetch(
          `${API_URL}/api/protocolos/${editingProtocol.id}`,
          {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: formData
          }
        );
      } else {
        response = await fetch(`${API_URL}/api/protocolos`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: formData
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message ||
            errorData?.error ||
            'Error al guardar protocolo'
        );
      }

      resetForm();
      await loadProtocols();
      window.dispatchEvent(new Event('protocolos-updated'));

      alert(
        editingProtocol
          ? 'Protocolo actualizado correctamente.'
          : 'Protocolo creado correctamente.'
      );
    } catch (error: any) {
      console.error('Error al guardar protocolo:', error);
      alert(error.message || 'Error al guardar el protocolo.');
    }
  };

  const handleEdit = (protocol: Protocol) => {
    const normalizedProtocol = normalizeProtocolFromApi(protocol);

    setEditingProtocol(normalizedProtocol);
    setTitulo(normalizedProtocol.titulo);
    setDescripcion(normalizedProtocol.descripcion);
    setCategoria(normalizeCategory(normalizedProtocol.categoria));

    setProtocolFiles([]);
    setExistingFiles(normalizedProtocol.archivos || []);

    resetFileInput();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar este protocolo?')) return;

    if (!token) {
      alert('Debes iniciar sesión como administrador.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/protocolos/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message ||
            errorData?.error ||
            'Error al eliminar protocolo'
        );
      }

      await loadProtocols();
      window.dispatchEvent(new Event('protocolos-updated'));

      if (editingProtocol?.id === id) {
        resetForm();
      }

      alert('Protocolo eliminado correctamente.');
    } catch (error: any) {
      console.error('Error al eliminar protocolo:', error);
      alert(error.message || 'Error al eliminar protocolo.');
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="protocols-admin-panel">
      <section className="panel-form-section">
        <div className="admin-form-card">
          <div className="form-header-inline">
            <div className="icon-square">
              <IonIcon icon={addOutline} />
            </div>

            <div className="header-text-container">
              <h2>
                {editingProtocol ? 'Editar Protocolo' : 'Nuevo Protocolo'}
              </h2>

              <p>
                Publica documentos institucionales visibles para los usuarios.
              </p>
            </div>

            {editingProtocol && (
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
                placeholder="Título del protocolo"
                value={titulo}
                onIonChange={(e) => setTitulo(String(e.detail.value || ''))}
                className="custom-input"
              />
            </div>

            <div className="form-group">
              <label>Descripción</label>

              <IonTextarea
                placeholder="Descripción del protocolo"
                rows={3}
                value={descripcion}
                onIonChange={(e) =>
                  setDescripcion(String(e.detail.value || ''))
                }
                className="custom-textarea"
              />
            </div>

            <div className="form-group">
              <label>Categoría</label>

              <IonSelect
                value={categoria}
                onIonChange={(e) =>
                  setCategoria(e.detail.value as ProtocolCategory)
                }
                interface="popover"
                className="custom-select"
              >
                {PROTOCOL_CATEGORIES.map((item) => (
                  <IonSelectOption key={item} value={item}>
                    {item}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </div>

            <div className="form-group">
              <label>
                Archivos adjuntos ({totalFiles}/{MAX_PROTOCOL_FILES})
              </label>

              {totalFiles < MAX_PROTOCOL_FILES ? (
                <div
                  className="file-drop-zone"
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleFilesChange(e.dataTransfer.files);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <div className="file-drop-content">
                    <IonIcon icon={cloudUploadOutline} />

                    <span>
                      Puedes agregar {MAX_PROTOCOL_FILES - totalFiles}{' '}
                      archivo(s) más
                    </span>

                    <small>
                      PDF, DOC, DOCX o imágenes. Máximo {MAX_FILE_SIZE_MB} MB
                      por archivo.
                    </small>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/jpg,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    multiple
                    style={{ display: 'none' }}
                    onChange={(e) => handleFilesChange(e.target.files)}
                  />
                </div>
              ) : (
                <div className="files-limit-message">
                  Ya alcanzaste el límite de 10 archivos.
                </div>
              )}

              {(existingFiles.length > 0 || protocolFiles.length > 0) && (
                <div className="protocol-files-list">
                  {existingFiles.map((file, index) => (
                    <div key={file.id} className="protocol-file-item">
                      <div className="protocol-file-main">
                        <div className="protocol-file-icon">
                          <IonIcon icon={documentOutline} />
                        </div>

                        <div className="protocol-file-info">
                          <strong>
                            {index + 1}. {file.name}
                          </strong>

                          <span>
                            Existente · {file.type || 'Archivo'} ·{' '}
                            {formatFileSize(file.size)}
                          </span>
                        </div>
                      </div>

                      <div className="protocol-file-actions">
                        <IonButton
                          fill="clear"
                          size="small"
                          disabled={index === 0}
                          onClick={() => moveExistingFile(file.id, 'up')}
                        >
                          Subir
                        </IonButton>

                        <IonButton
                          fill="clear"
                          size="small"
                          disabled={index === existingFiles.length - 1}
                          onClick={() => moveExistingFile(file.id, 'down')}
                        >
                          Bajar
                        </IonButton>

                        <button
                          type="button"
                          className="attachment-remove-x protocol-file-remove-position"
                          onClick={() => removeExistingFile(file.id)}
                          aria-label="Quitar archivo"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}

                  {protocolFiles.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="protocol-file-item"
                    >
                      <div className="protocol-file-main">
                        <div className="protocol-file-icon">
                          <IonIcon icon={documentOutline} />
                        </div>

                        <div className="protocol-file-info">
                          <strong>
                            {existingFiles.length + index + 1}. {file.name}
                          </strong>

                          <span>
                            Nuevo · {file.type || 'Archivo'} ·{' '}
                            {formatFileSize(file.size)}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="attachment-remove-x protocol-file-remove-position"
                        onClick={() => removeNewFile(index)}
                        aria-label="Quitar archivo"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-footer">
              <button type="submit" className="btn-submit">
                {editingProtocol ? 'Guardar Cambios' : 'Crear Protocolo'}
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="panel-list-section">
        <div className="panel-section-header">
          <div>
            <h2>Protocolos existentes ({protocols.length})</h2>
            <p>Busca, edita o elimina documentos institucionales.</p>
          </div>

          <IonSearchbar
            value={searchTerm}
            placeholder="Buscar protocolo..."
            onIonChange={(e) => setSearchTerm(e.detail.value || '')}
            mode="ios"
          />
        </div>

        <div className="protocols-list">
          {filteredProtocols.length === 0 ? (
            <p>No hay protocolos disponibles.</p>
          ) : (
            filteredProtocols.map((protocol) => (
              <div key={protocol.id} className="protocol-item">
                <div className="protocol-info">
                  <h4>{protocol.titulo}</h4>
                  <p>{protocol.descripcion}</p>

                  <div className="protocol-meta">
                    <span className="category">{protocol.categoria}</span>
                    <span>{protocol.fecha}</span>

                    {(protocol.archivos?.length || 0) > 0 && (
                      <span className="file-indicator">
                        <IonIcon icon={documentOutline} />
                        {protocol.archivos?.length} archivo(s)
                      </span>
                    )}
                  </div>
                </div>

                <div className="protocol-actions">
                  <IonButton
                    fill="clear"
                    size="small"
                    onClick={() => handleEdit(protocol)}
                  >
                    <IonIcon icon={createOutline} />
                    Editar
                  </IonButton>

                  <IonButton
                    fill="clear"
                    size="small"
                    onClick={() => handleDelete(protocol.id)}
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

export default ProtocolsPanel;