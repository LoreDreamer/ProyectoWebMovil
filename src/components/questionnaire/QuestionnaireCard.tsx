import React from 'react';
import './QuestionnaireCard.css';

interface QuestionnaireCardProps {
  title: string;
  description: string;
  risk: string;
  status: 'Completado' | 'Pendiente';
  score?: number;
  bgImage: string;
  onComplete?: () => void;
  onViewResults?: () => void;
}

export const QuestionnaireCard: React.FC<QuestionnaireCardProps> = ({
  title,
  description,
  risk,
  status,
  score,
  bgImage,
  onComplete,
  onViewResults
}) => {
  const isComplete = status === 'Completado';

  const handleAction = () => {
    if (isComplete) {
      onViewResults?.();
      return;
    }

    onComplete?.();
  };

  return (
    <article className="cuestionario-card-modular">
      <div className="card-body-content">
        <div className="card-meta-row">
          <span>Riesgo: {risk}</span>

          <span className={`status-badge ${status.toLowerCase()}`}>
            {status}
          </span>
        </div>

        <h3>{title}</h3>
        <p>{description}</p>

        {isComplete && (
          <div className="card-score-info">
            <span>PUNTAJE: </span>
            <strong>{score || 0}/100</strong>
          </div>
        )}
      </div>

      <div
        className="card-visual-footer"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <button
          type="button"
          className="card-btn-action"
          onClick={handleAction}
        >
          {isComplete ? 'Ver resultados' : 'Completar cuestionario'}
        </button>
      </div>
    </article>
  );
};

export default QuestionnaireCard;