import React from 'react';
import { IonContent, IonIcon, IonPage } from '@ionic/react';
import {
  linkOutline,
  lockClosedOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';
import { Navbar, Footer } from '@/components';
import { UrlThreatChecker } from '../components/UrlThreatChecker';
import './SecurityToolsPage.css';

export const SecurityToolsPage: React.FC = () => {
  return (
    <IonPage>
      <Navbar />

      <IonContent className="security-tools-content">
        <main className="security-tools-shell">
          <section className="security-tools-hero">
            <h1>Herramientas de seguridad digital</h1>
            <p>
              Utiliza herramientas preventivas conectadas a servicios externos de ciberseguridad para revisar enlaces sospechosos y reforzar hábitos seguros.
            </p>

            <div className="security-tools-badges" aria-label="Características de la herramienta">
              <span>
                <IonIcon icon={linkOutline} />
                Análisis de URLs
              </span>
              <span>
                <IonIcon icon={shieldCheckmarkOutline} />
                Google Safe Browsing
              </span>
              <span>
                <IonIcon icon={lockClosedOutline} />
                No se abren enlaces
              </span>
            </div>
          </section>

          <UrlThreatChecker />

          <section className="security-tools-info-grid">
            <article>
              <h2>¿Qué revisa?</h2>
              <p>
                El backend consulta Google Safe Browsing para verificar si una URL aparece asociada a malware, ingeniería social, software no deseado o aplicaciones potencialmente dañinas.
              </p>
            </article>

            <article>
              <h2>¿Por qué es seguro?</h2>
              <p>
                La plataforma no abre el enlace ingresado. Solo envía la URL al servicio externo desde el backend y devuelve una recomendación preventiva al usuario.
              </p>
            </article>

            <article>
              <h2>Uso educativo</h2>
              <p>
                Esta herramienta ayuda a la comunidad a reconocer enlaces sospechosos antes de ingresar credenciales, descargar archivos o entregar información personal.
              </p>
            </article>
          </section>
        </main>

        <Footer />
      </IonContent>
    </IonPage>
  );
};
