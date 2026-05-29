import React from 'react';
import './QuestionnaireCard.css';

interface QuestionnaireCardProps {
  title: string;
  description: string;
  risk: string;
  status: 'Completado' | 'Pendiente';
  score?: number;
  maxScore?: number;
  bgImage: string;
  isLoading?: boolean;
  onComplete?: () => void;
  onViewResults?: () => void;
}

export const QuestionnaireCard: React.FC<QuestionnaireCardProps> = ({
  title,
  description,
  risk,
  status,
  score,
  maxScore = 100,
  bgImage,
  isLoading = false,
  onComplete,
  onViewResults
}) => {
  const isComplete = status === 'Completado';

  const handleAction = () => {
    if (isLoading) return;

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
            <strong>
              {score || 0}/{maxScore || 100}
            </strong>
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
          disabled={isLoading}
          onClick={handleAction}
        >
          {isComplete
            ? 'Ver resultados'
            : isLoading
              ? 'Cargando...'
              : 'Comenzar cuestionario'}
        </button>
      </div>
    </article>
  );
};

export default QuestionnaireCard;
