import React from 'react';
import { IonIcon, IonText } from '@ionic/react';
import { linkOutline, openOutline } from 'ionicons/icons';
import './ResourceCard.css';

interface ResourceCardProps {
  title: string;
  subtitle: string;
  url?: string;
  onClick?: () => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ title, subtitle, url, onClick }) => {
  const content = (
    <>
      <div className="edu-card-icon-box">
        <IonIcon icon={linkOutline} />
      </div>
      <div className="edu-card-info">
        <h4>{title}</h4>
        <IonText color="medium">{subtitle}</IonText>
      </div>
      <IonIcon icon={openOutline} className="edu-card-external" />
    </>
  );

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="edu-resource-card">
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className="edu-resource-card edu-btn-link">
      {content}
    </button>
  );
};

export default ResourceCard;