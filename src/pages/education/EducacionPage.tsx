import { IonContent, IonPage } from '@ionic/react';
import { Navbar, EducationCard, Advice, Footer, EducationPanel } from '../../components';
import { useAuth } from '../../context/AuthContext';
import img_01 from '../../assets/questions/img_01.jpg';
import vpn from '../../assets/education/vpn.jpg';
import pishing from '../../assets/education/pishing.png';
import huella from '../../assets/education/huella.png';
import './EducationPage.css';

export const EducationPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <IonPage>
      <Navbar />
      <IonContent className="education-content-page">
        <div className="central-container"> 
          
          <header className="header-section">
            <h1>APRENDE SOBRE CIBERSEGURIDAD</h1>
            <p>Módulos breves y prácticos para fortalecer tu seguridad digital.</p>
          </header>

          <Advice />

          {isAdmin && (
            <section className="admin-section" style={{ marginBottom: 24 }}>
              <EducationPanel />
            </section>
          )}

          <section className="modules-section">
            <h2>MÓDULOS EDUCATIVOS DISPONIBLES</h2>
            
            <div className="cards-grid">
              <EducationCard 
                title="¿Qué es el phishing?" 
                description="Aprende a reconocer correos y mensajes fraudulentos."
                tag="Phishing"
                time="12 min"
                level="Básico"
                image={pishing}
              />
              
              <EducationCard 
                title="Seguridad en Redes" 
                description="Consejos para navegar de forma segura en redes Wi-Fi públicas."
                tag="Redes"
                time="15 min"
                level="Intermedio"
                image={img_01}
              />
              
              <EducationCard 
                title="Uso de VPN" 
                description="Protege tu identidad y datos cifrando tu conexión a internet."
                tag="Privacidad"
                time="10 min"
                level="Básico"
                image={vpn}
              />

              <EducationCard 
                title="Huella Digital y Privacidad" 
                description="Aprende a gestionar tu huella digital y a configurar la privacidad de tus redes para evitar que rastreen tus datos."
                tag="Redes"
                time="15 min"
                level="Intermedio"
                image={huella}
              />
            </div>
          </section>
        </div>
        <Footer />
      </IonContent>
    </IonPage>
  );
};
