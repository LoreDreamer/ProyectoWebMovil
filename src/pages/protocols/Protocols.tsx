import type { CSSProperties } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { Navbar } from '../../components';
import './ProtocolsPage.css';

export const ProtocolsPage: React.FC = () => {
  const accentColors = ['#2f80ed', '#00b7d9', '#7f715a'];

  return (
    <IonPage>
      <Navbar />
      <IonContent fullscreen className="protocolos-content">
        <div className="protocolos-shell">
          <header className="protocolos-header">
            <div>
              <h1>Protocolos institucionales</h1>
              <p>Documentación oficial publicada por el equipo TIC de la Municipalidad de Santo Domingo.</p>
            </div>
          </header>

          <section className="protocolos-grid">
            {accentColors.map((accent, index) => (
              <article
                key={index}
                className="protocolo-card"
                style={{ '--accent': accent } as CSSProperties}
              >
                <div className="card-top">
                  <div className="card-icon">📄</div>
                  <span className="card-label">PDF</span>
                </div>
                <div className="card-meta">
                  <span>Teletrabajo</span>
                  <span>12 mar 2026</span>
                </div>
                <h2>Protocolo de teletrabajo seguro</h2>
                <p>Documento oficial con lineamientos para su correcta aplicación.</p>
                <div className="card-actions">
                  <button className="btn-primary">Ver PDF</button>
                  <button className="btn-secondary">Descargar</button>
                </div>
              </article>
            ))}
          </section>

          <section className="protocolos-cta">
            <div className="cta-icon">📋</div>
            <div>
              <strong>¿Necesitas un documento adicional?</strong>
              <p>Contacta al equipo TIC para solicitar protocolos específicos o adaptaciones.</p>
            </div>
            <button className="cta-button">Solicitar</button>
          </section>
        </div>
      </IonContent>
    </IonPage>
  );
};
