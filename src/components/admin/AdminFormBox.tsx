import React, { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { addOutline } from 'ionicons/icons';
import './AdminFormBox.css';

interface AdminFormBoxProps {
  type: 'actividad' | 'protocolo';
  title: string;
  subtitle: string;
}

export const AdminFormBox: React.FC<AdminFormBoxProps> = ({
  type,
  title,
  subtitle
}) => {

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo || !descripcion) {
      alert('Por favor completa todos los campos');
      return;
    }

    // 🌟 SI ES ACTIVIDAD: La simulamos para que no intente pegarle a una ruta que no existe en Node
    if (type === 'actividad') {
      alert('¡Actividad publicada con éxito (Simulado)!');
      setTitulo('');
      setDescripcion('');
      return;
    }

    // 🌟 SI ES PROTOCOLO: Viaja de forma real al Backend
    const nuevo = {
      titulo,
      descripcion,
      categoria: 'General' // Valor por defecto para tu controlador
    };

    try {
      const response = await fetch('http://localhost:3000/api/protocolos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(nuevo)
      });

      if (!response.ok) {
        alert('Error en el servidor al guardar el protocolo');
        return;
      }

      const data = await response.json();
      console.log('Creado en el servidor:', data);

      alert('¡Protocolo publicado con éxito en el Backend!');

      // Limpiar campos
      setTitulo('');
      setDescripcion('');

      // Notificar a la página de visualización
      window.dispatchEvent(new Event('protocolos-updated'));

    } catch (error) {
      console.error('Error de conexión:', error);
      alert('Error al publicar: No se pudo conectar con el servidor Express.');
    }
  };

  return (
    <div className="admin-form-card">
      <div className="form-header-inline">
        <div className="icon-square">
          <IonIcon icon={addOutline} />
        </div>

        <div className="header-text-container">
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>

      <form className="admin-form-body" onSubmit={handleSubmit}>

        <div className="form-group">
          <label>Título</label>

          <input
            type="text"
            placeholder="Capacitación"
            className="custom-input"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Descripción</label>

          {type === 'actividad' ? (
            <textarea
              placeholder="Detalle"
              className="custom-textarea"
              rows={5}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          ) : (
            <input
              type="text"
              placeholder="Detalle protocolo"
              className="custom-input"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          )}
        </div>

        <div className="form-footer">
          <button type="submit" className="btn-submit">
            {type === 'actividad'
              ? 'PUBLICAR ACTIVIDAD'
              : 'PUBLICAR PROTOCOLO'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default AdminFormBox;