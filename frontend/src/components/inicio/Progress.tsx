import { Link } from 'react-router-dom';
import './Progress.css';

export const Progress: React.FC = () => {
  return (
    <div className="progress-container">
      <div className="progress-text">
        <h3>CONOCIMIENTO EN CIBERSEGURIDAD</h3>

        <p>
          Aún no hay resultados de diagnósticos disponibles para calcular tu
          progreso.
        </p>
      </div>

      <Link to="/educacion" className="btn-reforzar">
        Reforzar
      </Link>
    </div>
  );
};

export default Progress;