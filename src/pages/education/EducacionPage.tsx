import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { Navbar } from '../../components/navbar/Navbar';
import { EducationCard } from '../../components/education/EducationCard';
import { Advice } from '../../components/education/Advice';
import img_01 from '../../assets/img_01.jpg';
import ima_2 from '../../assets/ima_2.jpg';
import './EducationPage.css'; 

export const EducationPage: React.FC = () => {
  return (
    <IonPage>
      <Navbar />
      <IonContent className="education-content-page">
        <div className="central-container"> 
          
          <div className="header-section">
            <h1>APRENDE SOBRE CIBERSEGURIDAD</h1>
            <p>Módulos breves y prácticos para fortalecer tu seguridad digital.</p>
          </div>

          <Advice />

          <div className="modules-section">
            <h2>MÓDULOS EDUCATIVOS DISPONIBLES</h2>
          </div>

          <div className="cards-grid">
          {/* Módulo 1 */}
          <EducationCard 
            title="¿Qué es el phishing?" 
            description="Aprende a reconocer correos y mensajes fraudulentos."
            tag="Phishing"
            time="12 minutos"
            level="Básico"
            image={img_01}
          />
          
          {/* Módulo 2 */}
          <EducationCard 
            title="Seguridad en Redes" 
            description="Consejos para navegar de forma segura en redes Wi-Fi públicas."
            tag="Redes"
            time="15 minutos"
            level="Intermedio"
            image={img_01}
          />
          
          {/* Módulo 3 */}
          <EducationCard 
            title="Uso de VPN" 
            description="Protege tu identidad y datos cifrando tu conexión a internet."
            tag="Privacidad"
            time="10 minutos"
            level="Básico"
            image={ima_2}
          />

          {/* Módulo 4 */}
          <EducationCard 
            title="Seguridad en Redes" 
            description="Consejos para navegar de forma segura en redes Wi-Fi públicas."
            tag="Redes"
            time="15 minutos"
            level="Intermedio"
            image={img_01}
          />
        </div>

         
        </div>
      </IonContent>
    </IonPage>

  );
};

