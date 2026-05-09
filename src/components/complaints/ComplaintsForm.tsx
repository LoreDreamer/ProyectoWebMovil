import './ComplaintsForm.css';

export const ComplaintsForm: React.FC = () => {
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

      <form className="denuncia-form">
        <div className="form-group">
          <label>Nombre completo</label>
          <input type="text" placeholder="Escribe tu nombre completo" required />
        </div>

        <div className="form-group">
          <label>Correo electrónico</label>
          <input type="email" placeholder="ejemplo@correo.com" required />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Tipo de incidente</label>
            <select required>
              <option value="">Selecciona el tipo</option>
              <option value="infraestructura">Infraestructura</option>
              <option value="seguridad">Seguridad</option>
              <option value="otros">Otros</option>
            </select>
          </div>
          <div className="form-group">
            <label>Fecha del incidente</label>
            <input type="date" required />
          </div>
        </div>

        <div className="form-group">
          <label>Descripción del problema</label>
          <textarea rows={4} placeholder="Describe lo sucedido..."></textarea>
        </div>

        <div className="form-group">
          <label>Adjuntar archivos</label>
          <div className="file-drop-zone">
            <input type="file" id="file-upload" multiple />
            <label htmlFor="file-upload">Haga clic o arrastre archivos aquí</label>
          </div>
        </div>

        <div className="form-footer">
          <div className="checkbox-container">
            <input type="checkbox" id="declaracion" required />
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