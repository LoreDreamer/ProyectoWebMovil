import { IonContent, IonPage } from '@ionic/react';
import { Navbar } from '../../components';
import './QuestionnairePage.css';

export const QuestionnairePage: React.FC = () => {
  return (
    <IonPage>
      <Navbar />
      <IonContent fullscreen className="cuestionarios-content">
        <div className="cuestionarios-shell">
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
              </div>
            </div>
          </header>

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
        </div>
      </IonContent>
    </IonPage>
  );
};
