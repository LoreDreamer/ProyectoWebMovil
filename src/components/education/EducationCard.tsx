import './EducationCard.css';
import { timeOutline, starOutline } from 'ionicons/icons';
import { IonIcon, IonButton } from '@ionic/react';

interface CardProps {
  title: string;
  description: string;
  tag: string;
  time: string;
  level: string;
  image: string;
  status?: 'Completado' | 'Pendiente';
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
  onComplete
}) => {
  const isCompleted = status === 'Completado';

  return (
    <div className="edu-card">
      <div className="card-image-container">
        <span className="card-tag">{tag}</span>
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
          fill={isCompleted ? 'solid' : 'outline'}
          className="card-button"
          color={isCompleted ? 'success' : undefined}
          disabled={isCompleted}
          onClick={onComplete}
        >
          {isCompleted ? 'Completado ✓' : 'Ver módulo →'}
        </IonButton>
      </div>
    </div>
  );
};

export default EducationCard;