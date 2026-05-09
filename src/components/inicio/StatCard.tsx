import { IonIcon } from '@ionic/react';
import './StatCard.css';

interface StatProps { icon: string; label: string; value: string; }

export const StatCard: React.FC<StatProps> = ({ icon, label, value }) => (
  <div className="stat-card">
    <div className="stat-header">
      <div className="stat-icon-box">
        <IonIcon icon={icon} />
      </div>
      <span className="stat-label">{label}</span>
    </div>
    <div className="stat-value">{value}</div>
  </div>
);

export default StatCard;