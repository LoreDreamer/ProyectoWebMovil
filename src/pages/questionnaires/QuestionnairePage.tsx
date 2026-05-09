<<<<<<< HEAD
import { IonContent, IonPage } from '@ionic/react';
import { Navbar } from '../../components';
import './QuestionnairePage.css';

=======
import React from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { Navbar, QuestionnaireCard } from '../../components';
import './QuestionnairePage.css';

// Importa tus imágenes aquí
import img_01 from '../../assets/img_01.jpg';
import ima_2 from '../../assets/ima_2.jpg';
import im001 from '../../assets/im001.png';
import im002 from '../../assets/im002.png';
import im003 from '../../assets/im003.png';

// DATOS PARA REALIZADOS (Cada uno apunta a su propia variable de imagen)
const realizadosData = [
  { id: 1, titulo: "PHISHING Y CORREO", score: 30, riesgo: "Medio", img: ima_2 },
  { id: 2, titulo: "SEGURIDAD DE DATOS", score: 60, riesgo: "Alto", img: img_01 },
  { id: 3, titulo: "CONTRASEÑAS", score: 50, riesgo: "Medio", img: img_01 },
  { id: 4, titulo: "INGENIERÍA SOCIAL", score: 90, riesgo: "Bajo", img: ima_2 } // Puedes repetir si quieres, o usar otra
];

// DATOS PARA DISPONIBLES
const disponiblesData = [
  { id: 5, titulo: "WIFI SEGURA", riesgo: "Medio", img: ima_2 },
  { id: 6, titulo: "DISPOSITIVOS", riesgo: "Bajo", img: img_01 }
];

>>>>>>> cony-branch
export const QuestionnairePage: React.FC = () => {
  return (
    <IonPage>
      <Navbar />
      <IonContent fullscreen className="cuestionarios-content">
        <div className="cuestionarios-shell">
<<<<<<< HEAD
          <header className="cuestionarios-header">
            <div>
              <span className="cuestionarios-badge">Resumen de cuestionarios</span>
              <h1>Evalúa tus conocimientos en ciberseguridad</h1>
              <p>
                Revisa tu progreso, accede a cuestionarios activos y continúa mejorando tus resultados.
              </p>
            </div>
            <div className="cuestionarios-stats">
              <div>
                <strong>46%</strong>
                <span>Promedio general</span>
              </div>
              <div>
                <strong>3</strong>
                <span>Completados</span>
              </div>
              <div>
                <strong>4</strong>
                <span>Áreas a reforzar</span>
=======
          
          <header>
            <h1 className="resumen-title">Resumen de cuestionarios</h1>
            <p className="resumen-subtitle">Evalúa tus conocimientos en distintos ámbitos de la ciberseguridad municipal.</p>
            
            <div className="stats-banner">
              <div className="stat-box">
                <img src={im001} className="stat-icon" alt="icon" />
                <div className="stat-info"><span>Promedio General</span><span className="stat-value">46%</span></div>
              </div>
              <div className="stat-box">
                <img src={im002} className="stat-icon" alt="icon" />
                <div className="stat-info"><span>Completados</span><span className="stat-value">3</span></div>
              </div>
              <div className="stat-box">
                <img src={im003} className="stat-icon" alt="icon" />
                <div className="stat-info"><span>Áreas a Reforzar</span><span className="stat-value">2</span></div>
>>>>>>> cony-branch
              </div>
            </div>
          </header>

<<<<<<< HEAD
          <section className="cuestionarios-section">
            <h2>Cuestionarios realizados</h2>
            <div className="cuestionarios-grid">
              {Array.from({ length: 6 }).map((_, index) => (
                <article key={index} className="cuestionario-card">
                  <div className="card-meta">
                    <span>Riesgo: Medio</span>
                    <span className="card-status">Completado</span>
                  </div>
                  <h3>PHISHING Y CORREO 8</h3>
                  <p>Identifica señales de fraude en correos electrónicos.</p>
                  <div className="card-footer">
                    <div>
                      <span>Puntuaje</span>
                      <strong>{30 + index * 10}/100</strong>
                    </div>
                    <button>Ver resultados</button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="cuestionarios-section">
            <h2>Cuestionarios disponibles</h2>
            <div className="disponibles-list">
              {Array.from({ length: 8 }).map((_, index) => (
                <article key={index} className="cuestionario-list-card">
                  <div className="card-top">
                    <span>Riesgo: Medio</span>
                    <span className="list-status">Pendiente</span>
                  </div>
                  <h3>PHISHING Y CORREO 8</h3>
                  <p>Aprende a reconocer intentos de suplantación en tu bandeja de entrada.</p>
                  <button>Comenzar cuestionario</button>
                </article>
              ))}
            </div>
          </section>
=======
          {/* 2. REALIZADOS */}
          <h2 className="section-title">Cuestionarios realizados</h2>
          <p className="resumen-subtitle">En esta sección se detallan los resultados de las evaluaciones que has finalizado. Puedes revisar el puntaje obtenido en cada categoría, el nivel de riesgo identificado según tus respuestas y volver a consultar la información clave para asegurar que tus datos y dispositivos estén siempre protegidos.</p>
          <div className="cuestionarios-grid">
            {realizadosData.map((item) => (
              <QuestionnaireCard 
                key={item.id}
                title={item.titulo}
                description="Identifica señales de fraude en correos."
                risk={item.riesgo}
                status="Completado"
                score={item.score}
                // CORRECCIÓN: Usamos item.img para que cada una use su propia imagen
                bgImage={item.img} 
              />
            ))}
          </div>

          {/* 3. DISPONIBLES */}
          <h2 className="section-title">Cuestionarios disponibles</h2>
          <p className="resumen-subtitle">Fortalece tu seguridad digital completando los desafíos pendientes. Selecciona un tema para comenzar la evaluación y obtén recomendaciones personalizadas para proteger tu información en el entorno municipal.</p>
          <div className="cuestionarios-grid">
            {disponiblesData.map((item) => (
              <QuestionnaireCard 
                key={item.id}
                title={item.titulo}
                description="Aprende a proteger tu entorno digital."
                risk={item.riesgo}
                status="Pendiente"
                bgImage={item.img} 
              />
            ))}
          </div>

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
