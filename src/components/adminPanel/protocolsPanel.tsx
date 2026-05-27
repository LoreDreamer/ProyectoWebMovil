import React, { useEffect, useRef, useState } from 'react';
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
  closeCircleOutline,
  documentOutline,
  cloudUploadOutline
} from 'ionicons/icons';
import { useAuth } from '../../context/AuthContext';
import './protocolsPanel.css';

interface ProtocolFileMeta {
  nombre?: string;
  name?: string;
  url?: string;
}

interface Protocol {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  categoria: string;
  archivoUrl?: string;
  archivoNombre?: string;
  archivos?: ProtocolFileMeta[];
}

interface ProtocolFileItem {
  id: string;
  name: string;
  file?: File;
  url?: string;
  existing: boolean;
  order: number;
}

const API_URL = 'http://localhost:3000';
const MAX_PROTOCOL_FILES = 10;

export const ProtocolsPanel: React.FC = () => {
  const { user, token } = useAuth();

  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [editingProtocol, setEditingProtocol] = useState<Protocol | null>(null);

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('General');

  const [protocolFiles, setProtocolFiles] = useState<ProtocolFileItem[]>([]);

  const protocolFilesInputRef = useRef<HTMLInputElement | null>(null);

  const isAdmin = user?.role === 'admin';

  const getAuthHeaders = (): Record<string, string> | undefined => {
    if (!token) return undefined;

    return {
      Authorization: `Bearer ${token}`
    };
  };

  const normalizeFileOrder = (files: ProtocolFileItem[]) => {
    return files.map((file, index) => ({
      ...file,
      order: index + 1
    }));
  };

  const resetInputs = () => {
    if (protocolFilesInputRef.current) {
      protocolFilesInputRef.current.value = '';
    }
  };

  const getProtocolFilesFromExistingProtocol = (protocol: Protocol): ProtocolFileItem[] => {
    if (protocol.archivos && protocol.archivos.length > 0) {
      return normalizeFileOrder(
        protocol.archivos
          .filter((file) => file.nombre || file.name)
          .slice(0, MAX_PROTOCOL_FILES)
          .map((file, index) => ({
            id: `existing-${protocol.id}-${index}-${file.nombre || file.name}`,
            name: file.nombre || file.name || `Archivo ${index + 1}`,
            url: file.url,
            existing: true,
            order: index + 1
          }))
      );
    }

    if (protocol.archivoNombre) {
      return [
        {
          id: `existing-${protocol.id}-${protocol.archivoNombre}`,
          name: protocol.archivoNombre,
          url: protocol.archivoUrl,
          existing: true,
          order: 1
        }
      ];
    }

    return [];
  };

  const loadProtocols = async () => {
    if (!isAdmin) return;

    try {
      const response = await fetch(`${API_URL}/api/protocolos`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('No se pudieron cargar los protocolos');
      }

      const data = await response.json();
      setProtocols(data);
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

  const resetForm = () => {
    setTitulo('');
    setDescripcion('');
    setCategoria('General');
    setProtocolFiles([]);
    setEditingProtocol(null);
    resetInputs();
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    const availableSlots = MAX_PROTOCOL_FILES - protocolFiles.length;

    if (availableSlots <= 0) {
      alert(`Solo puedes adjuntar un máximo de ${MAX_PROTOCOL_FILES} archivos.`);

      if (protocolFilesInputRef.current) {
        protocolFilesInputRef.current.value = '';
      }

      return;
    }

    if (files.length > availableSlots) {
      alert(`Solo puedes agregar ${availableSlots} archivo(s) más. El límite total es ${MAX_PROTOCOL_FILES}.`);
    }

    const filesToAdd = files.slice(0, availableSlots);

    const newFiles: ProtocolFileItem[] = filesToAdd.map((file, index) => ({
      id: `${Date.now()}-${index}-${file.name}`,
      name: file.name,
      file,
      existing: false,
      order: protocolFiles.length + index + 1
    }));

    setProtocolFiles((prev) => normalizeFileOrder([...prev, ...newFiles]));

    if (protocolFilesInputRef.current) {
      protocolFilesInputRef.current.value = '';
    }
  };

  const removeProtocolFile = (fileId: string) => {
    setProtocolFiles((prev) =>
      normalizeFileOrder(prev.filter((file) => file.id !== fileId))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo.trim() || !descripcion.trim()) {
      alert('Completa título y descripción');
      return;
    }

    const formData = new FormData();

    formData.append('titulo', titulo.trim());
    formData.append('descripcion', descripcion.trim());
    formData.append('categoria', categoria);

    const newFiles = protocolFiles.filter((file) => file.file);
    const existingFiles = protocolFiles.filter((file) => file.existing);

    if (newFiles[0]?.file) {
      formData.append('archivo', newFiles[0].file);
    }

    newFiles.forEach((file) => {
      if (file.file) {
        formData.append('archivos', file.file);
      }
    });

    formData.append(
      'archivosExistentes',
      JSON.stringify(
        existingFiles.map((file, index) => ({
          order: index + 1,
          name: file.name,
          url: file.url || ''
        }))
      )
    );

    formData.append(
      'archivosOrden',
      JSON.stringify(
        protocolFiles.map((file, index) => ({
          order: index + 1,
          name: file.name,
          existing: file.existing
        }))
      )
    );

    try {
      let response: Response;

      if (editingProtocol) {
        response = await fetch(`${API_URL}/api/protocolos/${editingProtocol.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: formData
        });
      } else {
        response = await fetch(`${API_URL}/api/protocolos`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: formData
        });
      }

      if (!response.ok) {
        throw new Error('Error al guardar el protocolo');
      }

      resetForm();
      await loadProtocols();
      window.dispatchEvent(new Event('protocolos-updated'));

      alert(editingProtocol ? 'Protocolo actualizado con éxito' : 'Protocolo creado con éxito');
    } catch (error) {
      console.error('Error al guardar protocolo:', error);
      alert('Error al guardar el protocolo');
    }
  };

  const handleEdit = (protocol: Protocol) => {
    setEditingProtocol(protocol);
    setTitulo(protocol.titulo);
    setDescripcion(protocol.descripcion);
    setCategoria(protocol.categoria || 'General');
    setProtocolFiles(getProtocolFilesFromExistingProtocol(protocol));
    resetInputs();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar este protocolo?')) return;

    try {
      const response = await fetch(`${API_URL}/api/protocolos/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el protocolo');
      }

      await loadProtocols();
      window.dispatchEvent(new Event('protocolos-updated'));

      alert('Protocolo eliminado');
    } catch (error) {
      console.error('Error al eliminar protocolo:', error);
      alert('Error al eliminar');
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
              <h2>{editingProtocol ? 'Editar Protocolo' : 'Nuevo Protocolo'}</h2>
              <p>Documentación institucional con hasta 10 archivos adjuntos.</p>
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
                onIonChange={(e) => setTitulo(e.detail.value || '')}
                className="custom-input"
              />
            </div>

            <div className="form-group">
              <label>Descripción</label>

              <IonTextarea
                placeholder="Descripción del protocolo"
                rows={3}
                value={descripcion}
                onIonChange={(e) => setDescripcion(e.detail.value || '')}
                className="custom-textarea"
              />
            </div>

            <div className="form-group">
              <label>Categoría</label>

              <IonSelect
                value={categoria}
                onIonChange={(e) => setCategoria(e.detail.value || 'General')}
                className="custom-select"
              >
                <IonSelectOption value="General">General</IonSelectOption>
                <IonSelectOption value="Seguridad">Seguridad</IonSelectOption>
                <IonSelectOption value="Tecnología">Tecnología</IonSelectOption>
                <IonSelectOption value="Redes">Redes</IonSelectOption>
              </IonSelect>
            </div>

            <div className="form-group">
              <label>Archivos adjuntos ({protocolFiles.length}/{MAX_PROTOCOL_FILES})</label>

              {protocolFiles.length < MAX_PROTOCOL_FILES ? (
                <div
                  className="file-drop-zone"
                  onClick={() => protocolFilesInputRef.current?.click()}
                >
                  <div className="file-drop-content">
                    <IonIcon icon={cloudUploadOutline} />

                    <span>
                      Puedes agregar {MAX_PROTOCOL_FILES - protocolFiles.length} archivo(s) más
                    </span>
                  </div>

                  <input
                    ref={protocolFilesInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleFilesChange}
                  />
                </div>
              ) : (
                <div className="files-limit-message">
                  Ya alcanzaste el límite de 10 archivos. Elimina un archivo para poder adjuntar otro.
                </div>
              )}

              {protocolFiles.length > 0 && (
                <div className="protocol-files-list">
                  {protocolFiles.map((file, index) => (
                    <div key={file.id} className="protocol-file-item">
                      <div className="protocol-file-main">
                        <div className="protocol-file-icon">
                          <IonIcon icon={documentOutline} />
                        </div>

                        <div className="protocol-file-info">
                          <strong>{file.name}</strong>

                          <span>
                            Archivo {index + 1}
                            {file.existing ? ' · existente' : ' · nuevo'}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="attachment-remove-x protocol-file-remove-position"
                        aria-label={`Quitar ${file.name}`}
                        onClick={() => removeProtocolFile(file.id)}
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
            <h2>Protocolos Existentes ({protocols.length})</h2>
            <p>Administra los protocolos institucionales publicados.</p>
          </div>
        </div>

        <div className="protocols-list">
          {protocols.length === 0 ? (
            <p>No hay protocolos disponibles.</p>
          ) : (
            protocols.map((protocol) => {
              const files = getProtocolFilesFromExistingProtocol(protocol);

              return (
                <div key={protocol.id} className="protocol-item">
                  <div className="protocol-info">
                    <h4>{protocol.titulo}</h4>
                    <p>{protocol.descripcion}</p>

                    <div className="protocol-meta">
                      <span className="category">{protocol.categoria}</span>
                      <span>{protocol.fecha}</span>

                      {files.length > 0 && (
                        <span className="file-indicator">
                          <IonIcon icon={documentOutline} />
                          {files.length === 1
                            ? files[0].name
                            : `${files.length} archivos`}
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
                    </IonButton>

                    <IonButton
                      fill="clear"
                      size="small"
                      onClick={() => handleDelete(protocol.id)}
                      className="delete-btn"
                    >
                      <IonIcon icon={trashOutline} />
                    </IonButton>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};

export default ProtocolsPanel;