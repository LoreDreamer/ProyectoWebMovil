import React from 'react';
import { IonIcon } from '@ionic/react';
import './StatCardAdmin.css';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  label?: string; 
  variant?: 'default' | 'warning' | 'success';
}

export const StatCardAdmin: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  label,
  variant = 'default'
}) => {
  return (
    <div className={`stat-card ${variant}`}>
      
      {label && <div className="stat-label">{label}</div>}

      <div className="stat-content">
        <div className="stat-icon">
          <IonIcon icon={icon} />
        </div>

        <div className="stat-text">
          <div className="stat-title">{title}</div>
          <div className="stat-value">{value}</div>
        </div>
      </div>
    </div>
  );
};

export default  StatCardAdmin;