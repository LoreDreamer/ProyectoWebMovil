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
    <article className={`admin-stat-card admin-stat-card-${variant}`}>
      <div className="admin-stat-card-top">
        <div className="admin-stat-icon">
          <IonIcon icon={icon} />
        </div>

        {label && <span className="admin-stat-label">{label}</span>}
      </div>

      <div className="admin-stat-content">
        <span>{title}</span>
        <strong>{value}</strong>
      </div>
    </article>
  );
};

export default StatCardAdmin;