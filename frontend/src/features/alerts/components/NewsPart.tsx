import React from 'react';
import { IonIcon, IonSearchbar } from '@ionic/react';
import {
  alertCircleOutline,
  closeCircleOutline,
  imagesOutline,
  notificationsOutline,
  personOutline,
  timeOutline
} from 'ionicons/icons';
import { SubscribeBanner } from './SubscribeBanner';
import { usePublicAlerts } from '@/features/alerts/hooks/usePublicAlerts';
import { ContentState } from '@/shared/components/states/ContentState';
import './NewsPart.css';

export const NewsPart: React.FC = () => {
  const {
    newsItems,
    selectedAlert,
    setSelectedAlert,
    searchTerm,
    setSearchTerm,
    isLoading,
    filteredNewsItems,
    latestAlert,
    errorMessage,
    reloadAlerts
  } = usePublicAlerts();

  return (
    <section className="news-section">
      <div className="alerts-page-heading">
        <div>
          <span className="alerts-kicker">
            Centro de alertas
          </span>

          <h1>Alertas y noticias de ciberseguridad</h1>

          <p>
            Revisa comunicados municipales, advertencias digitales y
            recomendaciones para proteger tu información.
          </p>
        </div>
      </div>

      <section className="alerts-summary-section">
        <article className="alerts-summary-card">
          <div className="alerts-summary-icon">
            <IonIcon icon={notificationsOutline} />
          </div>

          <div>
            <span>Total alertas</span>
            <strong>{newsItems.length}</strong>
          </div>
        </article>

        <article className="alerts-summary-card">
          <div className="alerts-summary-icon">
            <IonIcon icon={timeOutline} />
          </div>

          <div>
            <span>Última publicación</span>
            <strong>{latestAlert ? latestAlert.createdAt : 'Sin datos'}</strong>
          </div>
        </article>

        <article className="alerts-summary-card">
          <div className="alerts-summary-icon">
            <IonIcon icon={imagesOutline} />
          </div>

          <div>
            <span>Imágenes adjuntas</span>
            <strong>
              {newsItems.reduce(
                (total, item) => total + item.images.length,
                0
              )}
            </strong>
          </div>
        </article>
      </section>

      <section className="alerts-list-section">
        <div className="alerts-section-header">
          <div>
            <span className="section-eyebrow">Publicaciones</span>
            <h2>Alertas disponibles</h2>
            <p>
              Busca por título, contenido, autor o persona que redactó la alerta.
            </p>
          </div>

          <IonSearchbar
            value={searchTerm}
            placeholder="Buscar alerta..."
            onIonChange={(e) => setSearchTerm(e.detail.value || '')}
            mode="ios"
            className="alerts-searchbar"
          />
        </div>

        {isLoading ? (
          <ContentState
            variant="loading"
            title="Cargando alertas"
            message="Estamos obteniendo las publicaciones municipales más recientes."
          />
        ) : errorMessage ? (
          <ContentState
            variant="error"
            title="No se pudieron cargar las alertas"
            message={errorMessage}
            actionLabel="Intentar nuevamente"
            onAction={reloadAlerts}
          />
        ) : filteredNewsItems.length === 0 ? (
          <ContentState
            variant="empty"
            title="No hay alertas disponibles"
            message="Prueba con otro término de búsqueda o revisa más tarde."
          />
        ) : (
          <div className="news-grid">
            {filteredNewsItems.map((item) => (
              <article className="news-card" key={item.id}>
                <div className="news-card-image-wrap">
                  <img decoding="async" loading="lazy"
                    src={item.image}
                    alt={item.title}
                    className="news-card-image"
                  />

                  <span className="alert-card-badge">
                    <IonIcon icon={alertCircleOutline} />
                    Alerta
                  </span>
                </div>

                <div className="news-card-body">
                  <div className="news-card-meta">
                    <span>
                      <IonIcon icon={timeOutline} />
                      {item.createdAt}
                    </span>

                    <span>
                      <IonIcon icon={personOutline} />
                      Publicado por: {item.autorNombre}
                    </span>

                    <span>
                      <IonIcon icon={personOutline} />
                      Escrito por: {item.writtenBy}
                    </span>
                  </div>

                  <h2>{item.title}</h2>

                  <p>{item.description}</p>

                  <div className="news-card-footer">
                    <span>{item.images.length} imagen(es)</span>

                    <button
                      className="news-card-button"
                      type="button"
                      onClick={() => setSelectedAlert(item)}
                    >
                      Leer más
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedAlert && (
        <section className="alert-detail-section">
          <div className="alert-detail-header">
            <div>
              <span className="section-eyebrow">Detalle</span>
              <h2>{selectedAlert.title}</h2>
            </div>

            <button
              type="button"
              className="alert-detail-close"
              onClick={() => setSelectedAlert(null)}
            >
              <IonIcon icon={closeCircleOutline} />
              Cerrar
            </button>
          </div>

          <div className="alert-detail-layout">
            <div className="alert-detail-image-wrap">
              <img decoding="async" loading="lazy" src={selectedAlert.image} alt={selectedAlert.title} />
            </div>

            <div className="alert-detail-content">
              <div className="alert-detail-meta">
                <span>{selectedAlert.createdAt}</span>
                <span>Publicado por: {selectedAlert.autorNombre}</span>
                <span>Escrito por: {selectedAlert.writtenBy}</span>
              </div>

              <p>{selectedAlert.description}</p>

              {selectedAlert.images.length > 0 && (
                <div className="alert-detail-gallery">
                  {selectedAlert.images.map((image, index) => (
                    <div key={image.id} className="alert-detail-gallery-item">
                      <img decoding="async" loading="lazy"
                        src={image.previewUrl}
                        alt={`Imagen ${index + 1}`}
                      />
                      <span>{index + 1}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <SubscribeBanner />
    </section>
  );
};

export default NewsPart;
