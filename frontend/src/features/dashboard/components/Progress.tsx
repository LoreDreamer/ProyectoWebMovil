import React from 'react';
import { useHistory } from 'react-router-dom';
import { useCybersecurityProgress } from '@/features/questionnaires/hooks/useCybersecurityProgress';
import './Progress.css';

export const Progress: React.FC = () => {
  const history = useHistory();
  const {
    resumen,
    categoriaMasBaja,
    estaCargando,
    mensajeError
  } = useCybersecurityProgress();

  return (
    <div className="progress-container">
      <div className="progress-title-row">
        <div>
          <h3>CONOCIMIENTO EN CIBERSEGURIDAD</h3>
          <p>Tu progreso global a través de los módulos y diagnósticos.</p>
        </div>

        {resumen.completados > 0 && (
          <div className="progress-global-score">
            <strong>{resumen.porcentajeGlobal}%</strong>
            <span>global</span>
          </div>
        )}
      </div>

      {estaCargando ? (
        <div className="progress-empty-state">
          Cargando resultados de diagnósticos...
        </div>
      ) : mensajeError ? (
        <div className="progress-empty-state progress-error-state">
          {mensajeError}
        </div>
      ) : resumen.completados === 0 ? (
        <div className="progress-empty-state">
          Aún no hay resultados de diagnósticos disponibles para calcular tu
          progreso.
          <button
            type="button"
            className="btn-reforzar btn-progress-empty"
            onClick={() => history.push('/cuestionarios')}
          >
            Responder cuestionario
          </button>
        </div>
      ) : (
        <>
          <div className="progress-summary-row">
            <div>
              <span>Cuestionarios completados</span>
              <strong>
                {resumen.completados}/{resumen.disponibles || resumen.completados}
              </strong>
            </div>

            <div>
              <span>Puntaje acumulado</span>
              <strong>
                {resumen.puntajeTotalObtenido}/{resumen.puntajeTotalMaximo}
              </strong>
            </div>
          </div>

          {resumen.categorias.map((categoria) => (
            <div key={categoria.nombre} className="progress-row">
              <span className="skill-name">{categoria.nombre}</span>

              <div className="bar-wrapper">
                <div className="bar-bg">
                  <div
                    className="bar-fill"
                    style={{ width: `${categoria.porcentaje}%` }}
                  />
                </div>

                <span className="skill-perc">{categoria.porcentaje}%</span>
              </div>
            </div>
          ))}

          {categoriaMasBaja && (
            <div className="progress-recommendation">
              <strong>Área a reforzar:</strong> {categoriaMasBaja.nombre}
            </div>
          )}

          <button
            type="button"
            className="btn-reforzar"
            onClick={() => history.push('/educacion')}
          >
            Reforzar
          </button>
        </>
      )}
    </div>
  );
};

export default Progress;
