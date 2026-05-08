import React from 'react';
import './QuestionnaireCard.css';

interface QuestionnaireCardProps {
  title: string;
  description: string;
  risk: string;
  status: 'Completado' | 'Pendiente';
  score?: number;
  bgImage: string;
}

export const QuestionnaireCard: React.FC<QuestionnaireCardProps> = ({
  title, description, risk, status, score, bgImage 
}) => {
  const isComplete = status === 'Completado';

  return (
    <article className="cuestionario-card-modular">
      <div className="card-body-content">
        <div className="card-meta-row">
          <span>Riesgo: {risk}</span>
          <span className={`status-badge ${status.toLowerCase()}`}>{status}</span>
        </div>
        
        <h3>{title}</h3>
        <p>{description}</p>
        
        {/* Solo mostramos el puntaje si está completado */}
        {isComplete && (
          <div className="card-score-info">
            <span>PUNTAJE: </span>
            <strong>{score}/100</strong>
          </div>
        )}
      </div>

      <div 
        className="card-visual-footer" 
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <button className="card-btn-action">
          {isComplete ? 'Ver resultados' : 'Comenzar Cuestionario'}
        </button>
      </div>
    </article>
  );
};