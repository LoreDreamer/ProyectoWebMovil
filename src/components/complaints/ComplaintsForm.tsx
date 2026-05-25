import React, { useState } from 'react';
import './ComplaintsForm.css';

export const ComplaintsForm: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [tipoIncidente, setTipoIncidente] = useState('');
  const [fechaIncidente, setFechaIncidente] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [declaracion, setDeclaracion] = useState(false);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(Date.now());

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setArchivo(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🌟 Usamos FormData para enviar el archivo binario real
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('correo', correo);
    formData.append('tipoIncidente', tipoIncidente);
    formData.append('fechaIncidente', fechaIncidente);
    formData.append('descripcion', descripcion);
    
    // Si hay un archivo seleccionado, lo adjuntamos bajo la clave 'archivo'
    if (archivo) {
      formData.append('archivo', archivo);
    }

    try {
      // NOTA: Al enviar FormData, NO se debe definir el header 'Content-Type'
      const response = await fetch('http://localhost:3000/api/denuncias', {
        method: 'POST',
        body: formData 
      });

      if (response.ok) {
        alert('¡Denuncia enviada con éxito al municipio!');
        
        setNombre('');
        setCorreo('');
        setTipoIncidente('');
        setFechaIncidente('');
        setDescripcion('');
        setDeclaracion(false);
        setArchivo(null);
        setFileInputKey(Date.now()); 
      } else {
        const errorData = await response.json();
        alert(`Error al enviar: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      alert('No se pudo conectar con el servidor municipal.');
    }
  };

  return (
    <div className="complaints-form-container">
      <header className="form-header">
        <div className="icon-container">
          <span className="icon-placeholder">📋</span>
        </div>
        <div className="header-text">
          <h1>FORMULARIO DE DENUNCIA</h1>
          <p>Todos los campos marcados son obligatorios*</p>
        </div>
      </header>

      <form className="denuncia-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre completo</label>
          <input 
            type="text" 
            placeholder="Escribe tu nombre completo" 
            required 
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Correo electrónico</label>
          <input 
            type="email" 
            placeholder="ejemplo@correo.com" 
            required 
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Tipo de incidente</label>
            <select 
              required 
              value={tipoIncidente}
              onChange={(e) => setTipoIncidente(e.target.value)}
            >
              <option value="">Selecciona el tipo</option>
              <option value="infraestructura">Infraestructura</option>
              <option value="seguridad">Seguridad</option>
              <option value="otros">Otros</option>
            </select>
          </div>
          <div className="form-group">
            <label>Fecha del incidente</label>
            <input 
              type="date" 
              required 
              value={fechaIncidente}
              onChange={(e) => setFechaIncidente(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Descripción del problema</label>
          <textarea 
            rows={4} 
            placeholder="Describe lo sucedido..."
            required
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          ></textarea>
        </div>

        <div className="form-group">
          <label>Adjuntar archivos (Opcional)</label>
          <div className="file-drop-zone">
            <input 
              type="file" 
              id="file-upload" 
              key={fileInputKey}
              accept="image/*,application/pdf"
              onChange={handleFileChange} 
            />
            <label htmlFor="file-upload">
              {archivo ? `Archivo: ${archivo.name}` : 'Haga clic o arrastre archivos aquí'}
            </label>
          </div>
        </div>

        <div className="form-footer">
          <div className="checkbox-container">
            <input 
              type="checkbox" 
              id="declaracion" 
              required 
              checked={declaracion}
              onChange={(e) => setDeclaracion(e.target.checked)}
            />
            <label htmlFor="declaracion">
              Declaro que la información entregada es verdadera y que la entrego de buena fe para colaborar con la prevención de incidentes.
            </label>
          </div>
          <button type="submit" className="btn-send">Enviar</button>
        </div>
      </form>
    </div>
  );
};

export default ComplaintsForm;