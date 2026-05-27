import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './ComplaintsForm.css';

export const ComplaintsForm: React.FC = () => {
  const { user } = useAuth();

  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [tipoIncidente, setTipoIncidente] = useState('');
  const [fechaIncidente, setFechaIncidente] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [declaracion, setDeclaracion] = useState(false);
  const [archivo, setArchivo] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (user) {
      setNombre(user.nombre_completo || '');
      setCorreo(user.email || '');
    }
  }, [user]);

  const resetForm = () => {
    setNombre(user?.nombre_completo || '');
    setCorreo(user?.email || '');
    setTipoIncidente('');
    setFechaIncidente('');
    setDescripcion('');
    setDeclaracion(false);
    setArchivo(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = (file?: File) => {
    if (!file) return;

    const validTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
      'application/pdf'
    ];

    if (!validTypes.includes(file.type)) {
      alert('Solo puedes adjuntar imágenes o archivos PDF.');
      return;
    }

    setArchivo(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFileUpload(file);
  };

  const handleRemoveFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    setArchivo(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !nombre.trim() ||
      !correo.trim() ||
      !tipoIncidente.trim() ||
      !fechaIncidente.trim() ||
      !descripcion.trim()
    ) {
      alert('Por favor completa todos los campos obligatorios.');
      return;
    }

    if (!declaracion) {
      alert('Debes aceptar la declaración antes de enviar la denuncia.');
      return;
    }

    const formData = new FormData();

    formData.append('nombre', nombre.trim());
    formData.append('correo', correo.trim());
    formData.append('tipoIncidente', tipoIncidente);
    formData.append('fechaIncidente', fechaIncidente);
    formData.append('descripcion', descripcion.trim());

    if (archivo) {
      formData.append('archivo', archivo);
    }

    try {
      const response = await fetch('http://localhost:3000/api/denuncias', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error al enviar: ${errorData.error || errorData.message || 'No se pudo enviar la denuncia'}`);
        return;
      }

      alert('¡Denuncia enviada con éxito al municipio!');
      resetForm();
    } catch (error) {
      console.error('Error de conexión:', error);
      alert('No se pudo conectar con el servidor municipal.');
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
              <option value="servicios_municipales">Servicios municipales</option>
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
          <label>Archivo adjunto opcional</label>

          <div
            className={`complaints-file-zone ${archivo ? 'complaints-file-zone-active' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={(e) => {
              e.preventDefault();
              handleFileUpload(e.dataTransfer.files[0]);
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            {archivo && (
              <button
                type="button"
                className="complaints-file-remove"
                aria-label="Quitar archivo"
                onClick={handleRemoveFile}
              >
                ×
              </button>
            )}

            <div className="complaints-file-content">
              <span className="complaints-file-icon">📎</span>

              <span>
                {archivo
                  ? archivo.name
                  : 'Haz clic o arrastra una imagen o PDF aquí'}
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
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
              Declaro que la información entregada es verdadera y que la entrego de buena fe para colaborar con la prevención de incidentes.
            </span>
          </label>

          <button type="submit" className="btn-send">
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComplaintsForm;