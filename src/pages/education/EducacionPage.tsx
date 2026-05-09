<<<<<<< HEAD
import { IonContent, IonPage } from '@ionic/react';
import { Navbar } from '../../components';
import './EducationPage.css';
=======
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { Navbar, EducationCard, Advice } from '../../components';
import img_01 from '../../assets/img_01.jpg';
import ima_2 from '../../assets/ima_2.jpg';
import './EducationPage.css'; 
>>>>>>> cony-branch

export const EducationPage: React.FC = () => {
  return (
    <IonPage>
      <Navbar />
<<<<<<< HEAD
      <IonContent fullscreen className="placeholder-content">
        <div className="tab-shell">
          <div className="tab-card">
            <span>Educación</span>
            <h1>Contenidos pedagógicos municipales</h1>
            <p>
              Explora cursos, guías y herramientas diseñadas para mejorar la
              cultura digital de empleados, vecinos y servidores públicos.
            </p>
          </div>
=======
      <IonContent className="education-content-page">
        <div className="central-container"> 
          
          <header className="header-section">
            <h1>APRENDE SOBRE CIBERSEGURIDAD</h1>
            <p>Módulos breves y prácticos para fortalecer tu seguridad digital.</p>
          </header>

          <Advice />

          <section className="modules-section">
            <h2>MÓDULOS EDUCATIVOS DISPONIBLES</h2>
            
            <div className="cards-grid">
              <EducationCard 
                title="¿Qué es el phishing?" 
                description="Aprende a reconocer correos y mensajes fraudulentos."
                tag="Phishing"
                time="12 min"
                level="Básico"
                image={img_01}
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
                image={ima_2}
              />

              <EducationCard 
                title="Seguridad en Redes" 
                description="Consejos para navegar de forma segura en redes Wi-Fi públicas."
                tag="Redes"
                time="15 min"
                level="Intermedio"
                image={img_01}
              />
            </div>
          </section>

>>>>>>> cony-branch
        </div>
      </IonContent>
    </IonPage>
  );
<<<<<<< HEAD
};
=======
};
>>>>>>> cony-branch
