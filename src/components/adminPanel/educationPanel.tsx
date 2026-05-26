import React, { useState } from 'react';
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
  closeCircleOutline
} from 'ionicons/icons';
import { useAuth } from '../../context/AuthContext';
import './educationPanel.css';

interface EducationModule {
  id: number;
  title: string;
  description: string;
  tag: string;
  time: string;
  level: string;
  image: string;
}

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
      image: ''
    }
  ]);

  const [editingModule, setEditingModule] = useState<EducationModule | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('Phishing');
  const [time, setTime] = useState('10 min');
  const [level, setLevel] = useState('Básico');
  const [imagePreview, setImagePreview] = useState('');

  if (!user || user.role !== 'admin') return null;

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTag('Phishing');
    setTime('10 min');
    setLevel('Básico');
    setImagePreview('');
    setEditingModule(null);
  };

  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      alert('Completa título y descripción');
      return;
    }

    if (editingModule) {
      setModules(modules.map(m =>
        m.id === editingModule.id
          ? { ...m, title, description, tag, time, level, image: imagePreview || m.image }
          : m
      ));
    } else {
      const newModule: EducationModule = {
        id: Date.now(),
        title,
        description,
        tag,
        time,
        level,
        image: imagePreview
      };
      setModules([newModule, ...modules]);
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
    setImagePreview(module.image);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('¿Eliminar este módulo?')) {
      setModules(modules.filter(m => m.id !== id));
    }
  };

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
              <p>Complete los datos del módulo</p>
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
                onIonChange={(e) => setTitle(e.detail.value!)}
                className="custom-input"
              />
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <IonTextarea
                placeholder="Descripción del módulo"
                rows={3}
                value={description}
                onIonChange={(e) => setDescription(e.detail.value!)}
                className="custom-textarea"
              />
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label>Tag/Categoría</label>
                <IonSelect value={tag} onIonChange={(e) => setTag(e.detail.value)}>
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
                  onIonChange={(e) => setTime(e.detail.value!)}
                  className="custom-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Nivel</label>
              <IonSelect value={level} onIonChange={(e) => setLevel(e.detail.value)}>
                <IonSelectOption value="Básico">Básico</IonSelectOption>
                <IonSelectOption value="Intermedio">Intermedio</IonSelectOption>
                <IonSelectOption value="Avanzado">Avanzado</IonSelectOption>
              </IonSelect>
            </div>

            <div className="form-group">
              <label>Imagen</label>
              <div
                className="file-drop-zone"
                onDrop={(e) => {
                  e.preventDefault();
                  handleImageUpload(e.dataTransfer.files[0]);
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                <div className="file-drop-content">
                  <IonIcon icon={cloudUploadOutline} />
                  <span>Arrastra imagen o haz click</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="file-input"
                  onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])}
                />
              </div>
              {imagePreview && (
                <div className="image-preview-box">
                  <img src={imagePreview} alt="preview" />
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
        <h2>Módulos Existentes ({modules.length})</h2>
        <div className="modules-list">
          {modules.map((module) => (
            <div key={module.id} className="module-item">
              <div className="module-info">
                <h4>{module.title}</h4>
                <p>{module.description}</p>
                <div className="module-meta">
                  <span className="tag">{module.tag}</span>
                  <span>{module.time}</span>
                  <span>{module.level}</span>
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
          ))}
        </div>
      </section>
    </div>
  );
};

export default EducationPanel;