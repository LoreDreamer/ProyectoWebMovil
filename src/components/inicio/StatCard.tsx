import { IonIcon } from '@ionic/react';
import './StatCard.css';

interface StatProps {
  icon: string;
  label: string;
  value: string;
}

export const StatCard: React.FC<StatProps> = ({ icon, label, value }) => {
  return (
    <div className="dashboard-stat-card">
      <div className="dashboard-stat-top">
        <div className="dashboard-stat-icon">
          <IonIcon icon={icon} />
        </div>

        <span className="dashboard-stat-label">{label}</span>
      </div>

      <strong className="dashboard-stat-number">{value}</strong>
    </div>
  );
};

export default StatCard;