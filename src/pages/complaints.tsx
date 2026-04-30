import { IonContent, IonPage } from '@ionic/react';
import { Navbar } from '../components/Navbar';  
import { ComplaintForm } from '../components/complaints/ComplaintForm';
import { ComplaintTips } from '../components/complaints/ComplaintTips';
import './complaints.css';

export const Complaints: React.FC = () => {
  return (
    <IonPage>
      <Navbar />
        <IonContent className="complaints-content">
        <div className="complaints-container">
            <ComplaintForm />
        </div>
        </IonContent>
    </IonPage>
  );
};

export default Complaints;