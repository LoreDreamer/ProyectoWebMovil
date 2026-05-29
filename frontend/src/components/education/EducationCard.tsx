import React from 'react';
import './EducationCard.css';
import { timeOutline, starOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { IonIcon, IonButton } from '@ionic/react';

interface CardProps {
  title: string;
  description: string;
  tag: string;
  time: string;
  level: string;
  image: string;
  status?: 'Completado' | 'Pendiente';
  isLoading?: boolean;
  onComplete?: () => void;
}

export const EducationCard: React.FC<CardProps> = ({
  title,
  description,
  tag,
  time,
  level,
  image,
  status = 'Pendiente',
  isLoading = false,
  onComplete
}) => {
  const isComplete = status === 'Completado';

  return (
    <div className={`edu-card ${isComplete ? 'edu-card-completed' : ''}`}>
      <div className="card-image-container">
        <span className="card-tag">{tag}</span>

        {isComplete && (
          <span className="card-status-pill">
            <IonIcon icon={checkmarkCircleOutline} />
            Completado
          </span>
        )}

        <img src={image} className="card-top-img" alt={title} />
      </div>

      <div className="card-info">
        <div className="card-meta">
          <span>
            <IonIcon icon={timeOutline} /> {time}
          </span>

          <span>
            <IonIcon icon={starOutline} /> {level}
          </span>
        </div>

        <h4>{title}</h4>
        <p>{description}</p>

        <IonButton
          fill="outline"
          className={`card-button ${isComplete ? 'card-button-completed' : ''}`}
          disabled={isComplete || isLoading}
          onClick={onComplete}
        >
          {isComplete
            ? 'Módulo completado'
            : isLoading
              ? 'Guardando...'
              : 'Ver módulo'}
        </IonButton>
      </div>
    </div>
  );
};

export default EducationCard;
