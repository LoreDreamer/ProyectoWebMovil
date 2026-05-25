import type { CSSProperties } from 'react';
import { IonContent, IonPage, IonIcon } from '@ionic/react';
import { Navbar, Footer } from '../../components';
import { useEffect, useState } from 'react';
import { folderOutline, calendarOutline, clipboardOutline } from 'ionicons/icons';
import './ProtocolsPage.css';

type Protocolo = {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  categoria: string;
};

export const ProtocolsPage: React.FC = () => {

  const [protocolos, setProtocolos] = useState<Protocolo[]>([]);

  const cargarProtocolos = () => {
    fetch('http://localhost:3000/api/protocolos')
      .then(res => res.json())
      .then(data => setProtocolos(data))
      .catch(err => console.log(err));
  };

  // cargar al entrar
  useEffect(() => {
    cargarProtocolos();
  }, []);

  // actualizar cuando se crea uno nuevo
  useEffect(() => {
    const handler = () => {
      cargarProtocolos();
    };

    window.addEventListener('protocolos-updated', handler);

    return () => {
      window.removeEventListener('protocolos-updated', handler);
    };
  }, []);

  return (
    <IonPage>
      <Navbar />

      <IonContent fullscreen className="protocolos-content">
        <div className="protocolos-shell">

          <header className="protocolos-header">
            <div>
              <h1>Protocolos institucionales</h1>
              <p>Documentación oficial publicada por el equipo TIC.</p>
            </div>
          </header>

          <section className="protocolos-grid">

            {protocolos.map((p) => (
              <article key={p.id} className="protocolo-card">

                {/* Encabezado de la card: Portapapeles + Badge PDF */}
                <div className="protocolo-card-header">
                  <div className="icon-clipboard-wrapper">
                    <IonIcon icon={clipboardOutline} />
                  </div>
                  <span className="badge-pdf">PDF</span>
                </div>

                {/* Meta datos dinámicos: Categoría e Icono Carpeta, Fecha e Icono Calendario */}
                <div className="protocolo-card-meta">
                  <div className="meta-item">
                    <IonIcon icon={folderOutline} />
                    <span>{p.categoria}</span>
                  </div>
                  <div className="meta-item">
                    <IonIcon icon={calendarOutline} />
                    <span>{p.fecha}</span>
                  </div>
                </div>

                {/* Contenido dinámico */}
                <div className="protocolo-card-body">
                  <h2>{p.titulo}</h2>
                  <p>{p.descripcion}</p>
                </div>

                {/* Botones inferiores corregidos */}
                <div className="protocolo-card-actions">
                  <button type="button" className="btn-view-pdf">Ver PDF</button>
                  <button type="button" className="btn-download">Descargar</button>
                </div>

              </article>
            ))}

          </section>

          <section className="protocolos-cta">
            <div className="cta-icon">📋</div>
            <div>
              <strong>¿Necesitas un documento adicional?</strong>
              <p>Contacta al equipo TIC.</p>
            </div>
            <button className="cta-button">Solicitar</button>
          </section>

        </div>

        <Footer />
      </IonContent>
    </IonPage>
  );
};

export default ProtocolsPage;