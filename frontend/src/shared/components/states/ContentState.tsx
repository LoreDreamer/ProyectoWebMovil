import React from 'react';
import { IonIcon } from '@ionic/react';
import {
  alertCircleOutline,
  informationCircleOutline,
  refreshOutline
} from 'ionicons/icons';
import './ContentState.css';

type ContentStateVariant = 'loading' | 'empty' | 'error' | 'info';

interface ContentStateProps {
  variant?: ContentStateVariant;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const getIcon = (variant: ContentStateVariant) => {
  if (variant === 'error') return alertCircleOutline;
  if (variant === 'loading') return refreshOutline;
  return informationCircleOutline;
};

export const ContentState: React.FC<ContentStateProps> = ({
  variant = 'info',
  title,
  message,
  actionLabel,
  onAction
}) => {
  return (
    <div className={`content-state content-state-${variant}`} role="status" aria-live="polite">
      <div className="content-state-icon">
        <IonIcon icon={getIcon(variant)} />
      </div>

      <div className="content-state-copy">
        <h3>{title}</h3>
        {message && <p>{message}</p>}
      </div>

      {actionLabel && onAction && (
        <button type="button" className="content-state-action" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default ContentState;
