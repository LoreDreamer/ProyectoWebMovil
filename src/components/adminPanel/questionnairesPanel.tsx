import React, { useState, useEffect } from 'react';
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
}

export const QuestionnairesPanel: React.FC = () => {
  const { user } = useAuth();
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingQuestionnaire, setEditingQuestionnaire] = useState<Questionnaire | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [risk, setRisk] = useState<'BAJO' | 'MEDIO' | 'ALTO'>('MEDIO');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [archivoNombre, setArchivoNombre] = useState('');

  if (!user || user.role !== 'admin') return null;

  const loadQuestionnaires = () => {
    fetch('http://localhost:3000/api/questionnaires')
      .then(res => res.json())
      .then(data => setQuestionnaires(data))
      .catch(err => console.log(err));
  };

  useEffect(() => {
    loadQuestionnaires();
    
    const handler = () => loadQuestionnaires();
    window.addEventListener('questionnaires-updated', handler);
    return () => window.removeEventListener('questionnaires-updated', handler);
  }, []);

  const filteredQuestionnaires = questionnaires.filter(q =>
    q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setRisk('MEDIO');
    setArchivo(null);
    setArchivoNombre('');
    setEditingQuestionnaire(null);
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
    if (!title || !description) {
      alert('Completa título y descripción');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('risk', risk);
    if (archivo) {
      formData.append('archivo', archivo);
    }

    try {
      let response: Response;
      
      if (editingQuestionnaire) {
        response = await fetch(`http://localhost:3000/api/questionnaires/${editingQuestionnaire.id}`, {
          method: 'PUT',
          body: formData
        });
      } else {
        response = await fetch('http://localhost:3000/api/questionnaires', {
          method: 'POST',
          body: formData
        });
      }
      
      if (!response.ok) throw new Error();

      resetForm();
      loadQuestionnaires();
      window.dispatchEvent(new Event('questionnaires-updated'));
    } catch {
      alert('Error al guardar el cuestionario');
    }
  };

  const handleEdit = (questionnaire: Questionnaire) => {
    setEditingQuestionnaire(questionnaire);
    setTitle(questionnaire.title);
    setDescription(questionnaire.description);
    setRisk(questionnaire.risk);
    setArchivoNombre(questionnaire.fileName || '');
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar este cuestionario?')) return;
    
    try {
      const response = await fetch(`http://localhost:3000/api/questionnaires/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error();
      loadQuestionnaires();
      window.dispatchEvent(new Event('questionnaires-updated'));
    } catch {
      alert('Error al eliminar');
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'ALTO': return '#ff6b6b';
      case 'MEDIO': return '#fcc419';
      case 'BAJO': return '#51cf66';
      default: return '#888';
    }
  };

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
              <p>Crea un cuestionario de evaluación</p>
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
                onIonChange={(e) => setTitle(e.detail.value!)}
                className="custom-input"
              />
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <IonTextarea
                placeholder="Descripción del cuestionario"
                rows={3}
                value={description}
                onIonChange={(e) => setDescription(e.detail.value!)}
                className="custom-textarea"
              />
            </div>

            <div className="form-group">
              <label>Nivel de Riesgo</label>
              <IonSelect value={risk} onIonChange={(e) => setRisk(e.detail.value)}>
                <IonSelectOption value="BAJO">Bajo</IonSelectOption>
                <IonSelectOption value="MEDIO">Medio</IonSelectOption>
                <IonSelectOption value="ALTO">Alto</IonSelectOption>
              </IonSelect>
            </div>

            <div className="form-group">
              <label>Archivo (PDF/DOC)</label>
              <div className="file-drop-zone" onClick={() => document.getElementById('questionnaire-file')?.click()}>
                <div className="file-drop-content">
                  <IonIcon icon={cloudUploadOutline} />
                  <span>
                    {archivoNombre || editingQuestionnaire?.fileName
                      ? `${archivoNombre || editingQuestionnaire?.fileName}`
                      : 'Seleccionar archivo'}
                  </span>
                </div>
                <input
                  id="questionnaire-file"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
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
          {filteredQuestionnaires.map((q) => (
            <div key={q.id} className="questionnaire-item">
              <div className="questionnaire-info">
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
                      <IonIcon icon={documentOutline} /> {q.fileName}
                    </span>
                  )}
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
          ))}
        </div>
      </section>
    </div>
  );
};

export default QuestionnairesPanel;