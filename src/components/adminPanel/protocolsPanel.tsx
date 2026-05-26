import React, { useState, useEffect } from 'react';
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

interface Protocol {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  categoria: string;
  archivoUrl?: string;
  archivoNombre?: string;
}

export const ProtocolsPanel: React.FC = () => {
  const { user } = useAuth();
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [editingProtocol, setEditingProtocol] = useState<Protocol | null>(null);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('General');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [archivoNombre, setArchivoNombre] = useState('');

  if (!user || user.role !== 'admin') return null;

  const loadProtocols = () => {
    fetch('http://localhost:3000/api/protocolos')
      .then(res => res.json())
      .then(data => setProtocols(data))
      .catch(err => console.log(err));
  };

  useEffect(() => {
    loadProtocols();
    
    const handler = () => loadProtocols();
    window.addEventListener('protocolos-updated', handler);
    return () => window.removeEventListener('protocolos-updated', handler);
  }, []);

  const resetForm = () => {
    setTitulo('');
    setDescripcion('');
    setCategoria('General');
    setArchivo(null);
    setArchivoNombre('');
    setEditingProtocol(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setArchivo(file);
      setArchivoNombre(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo || !descripcion) {
      alert('Completa título y descripción');
      return;
    }

    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('descripcion', descripcion);
    formData.append('categoria', categoria);
    if (archivo) {
      formData.append('archivo', archivo);
    }

    try {
      let response: Response;
      
      if (editingProtocol) {
        response = await fetch(`http://localhost:3000/api/protocolos/${editingProtocol.id}`, {
          method: 'PUT',
          body: formData
        });
      } else {
        response = await fetch('http://localhost:3000/api/protocolos', {
          method: 'POST',
          body: formData
        });
      }
      
      if (!response.ok) throw new Error();

      resetForm();
      loadProtocols();
      window.dispatchEvent(new Event('protocolos-updated'));
    } catch {
      alert('Error al guardar el protocolo');
    }
  };

  const handleEdit = (protocol: Protocol) => {
    setEditingProtocol(protocol);
    setTitulo(protocol.titulo);
    setDescripcion(protocol.descripcion);
    setCategoria(protocol.categoria);
    setArchivoNombre(protocol.archivoNombre || '');
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar este protocolo?')) return;
    
    try {
      const response = await fetch(`http://localhost:3000/api/protocolos/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error();
      loadProtocols();
      window.dispatchEvent(new Event('protocolos-updated'));
    } catch {
      alert('Error al eliminar');
    }
  };

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
              <p>Documentación institucional</p>
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
                onIonChange={(e) => setTitulo(e.detail.value!)}
                className="custom-input"
              />
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <IonTextarea
                placeholder="Descripción del protocolo"
                rows={3}
                value={descripcion}
                onIonChange={(e) => setDescripcion(e.detail.value!)}
                className="custom-textarea"
              />
            </div>

            <div className="form-group">
              <label>Categoría</label>
              <IonSelect value={categoria} onIonChange={(e) => setCategoria(e.detail.value)}>
                <IonSelectOption value="General">General</IonSelectOption>
                <IonSelectOption value="Seguridad">Seguridad</IonSelectOption>
                <IonSelectOption value="Tecnología">Tecnología</IonSelectOption>
                <IonSelectOption value="Redes">Redes</IonSelectOption>
              </IonSelect>
            </div>

            <div className="form-group">
              <label>Archivo PDF</label>
              <div className="file-drop-zone" onClick={() => document.getElementById('protocol-file')?.click()}>
                <div className="file-drop-content">
                  <IonIcon icon={cloudUploadOutline} />
                  <span>
                    {archivoNombre || editingProtocol?.archivoNombre 
                      ? `${archivoNombre || editingProtocol?.archivoNombre}` 
                      : 'Seleccionar archivo PDF'}
                  </span>
                </div>
                <input
                  id="protocol-file"
                  type="file"
                  accept=".pdf"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </div>
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
        <h2>Protocolos Existentes ({protocols.length})</h2>
        <div className="protocols-list">
          {protocols.map((protocol) => (
            <div key={protocol.id} className="protocol-item">
              <div className="protocol-info">
                <h4>{protocol.titulo}</h4>
                <p>{protocol.descripcion}</p>
                <div className="protocol-meta">
                  <span className="category">{protocol.categoria}</span>
                  <span>{protocol.fecha}</span>
                  {protocol.archivoNombre && (
                    <span className="file-indicator">
                      <IonIcon icon={documentOutline} /> {protocol.archivoNombre}
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
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProtocolsPanel;