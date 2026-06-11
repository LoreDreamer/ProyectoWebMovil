import React, { useState } from 'react';
import { IonPage, IonContent, IonButton, IonIcon, IonGrid, IonRow, IonCol } from '@ionic/react';
import { arrowBackOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import { Navbar, EducacionHeader, EducacionSlider, ResourceCard } from '@/components';
import { useAuth } from '@/context/AuthContext';
import { EducationModule } from './EducacionPage';

import './EducationModulePage.css';
import { API_URL } from '@/shared/api/apiClient';
import { notify } from '@/shared/notifications';

interface LocationState {
  module: EducationModule;
}


export const EducationModulePage: React.FC = () => {
  const history = useHistory();
  const location = useLocation<LocationState>();
  const { token } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const rawModule = location.state?.module;

  const targetModule = {
    id: String(rawModule?.id || ''),
    titulo: String(rawModule?.title || rawModule?.titulo || 'Módulo Informativo'),
    resumen: String(rawModule?.description || rawModule?.resumen || ''),
    cuerpo: String(rawModule?.body || rawModule?.cuerpo || 'Contenido no disponible.'),
    tipo_educacion: String(rawModule?.category || rawModule?.tipo_educacion || 'Seguridad'),
    cover_img: String(rawModule?.image || rawModule?.cover_img || ''),
    imagenes: Array.isArray(rawModule?.images) ? rawModule.images : Array.isArray(rawModule?.imagenes) ? rawModule.imagenes : [],
    status: rawModule?.status || 'Pendiente',
    
    // Adjuntos multimedia vinculados dinámicamente desde la BDD
    archivoUrl: rawModule?.fileUrl || rawModule?.archivo_url || null,
    archivoNombre: rawModule?.fileName || rawModule?.archivo_nombre || 'Documento Adjunto',
    archivoTipo: rawModule?.fileType || rawModule?.archivo_tipo || 'Archivo complementario'
  };

  // ==========================================
  // CAMBIO AQUÍ: INCLUIR LA PORTADA EN LOS SLIDES
  // ==========================================
  // 1. Inicializamos el arreglo con la portada si es que existe
  const slidesArray = targetModule.cover_img 
    ? [{ id: 'cover', url: targetModule.cover_img }] 
    : [];

  // 2. Mapeamos las imágenes de la BDD y se las sumamos al arreglo
  const backendSlides = targetModule.imagenes.map((img: any, idx: number) => ({
    id: String(img?.id || `img-${idx}`),
    url: String(img?.url || targetModule.cover_img)
  }));

  // Combinamos ambos: La portada irá en la primera posición del carrusel
  const sliderSlides = [...slidesArray, ...backendSlides];

  const obtenerCabeceras = (): Record<string, string> => {
    const cabeceras: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) {
      cabeceras.Authorization = `Bearer ${token}`;
    }
    return cabeceras;
  };

  // ==========================================
  // BOTÓN INFERIOR: ACCIÓN DE MARCAR Y VOLVER
  // ==========================================
  const handleBackToPanel = async () => {
    if (targetModule.status === 'Completado') {
      history.push('/educacion');
      return;
    }

    if (!targetModule.id || !token) return;

    try {
      setIsSubmitting(true);

      const response = await fetch(`${API_URL}/api/education/${targetModule.id}/complete`, {
        method: 'POST',
        headers: obtenerCabeceras()
      });

      if (!response.ok) {
        throw new Error('No se pudo guardar el progreso en el servidor');
      }

      notify.success('¡Módulo marcado como visto!');
      notify.add({
        type: 'success',
        title: 'Módulo educativo completado',
        message: targetModule.titulo
      });

      if (location.state?.module) {
        location.state.module.status = 'Completado';
      }
      
      window.dispatchEvent(new CustomEvent('education-updated'));

      setTimeout(() => {
        setIsSubmitting(false);
        history.push('/educacion');
      }, 1200);

    } catch (error) {
      console.error('Error al asentar marca de lectura manual:', error);
      notify.error('Error al guardar el progreso');
      setIsSubmitting(false);
    }
  };

  return (
    <IonPage className="edu-mod-page">
      <Navbar />
      <IonContent fullscreen className="edu-mod-content">
        <div className="edu-container">
          
          <div className="edu-back-nav">
            <button className="edu-back-link" onClick={() => history.push('/educacion')}>
              <IonIcon icon={arrowBackOutline} /> Volver a Educación
            </button>
          </div>

          <EducacionHeader 
            category={targetModule.tipo_educacion} 
            title={targetModule.titulo} 
          />

          {sliderSlides.length > 0 && <EducacionSlider slides={sliderSlides} />}

          <article className="edu-body-text">
            <div 
              className="edu-lead-paragraph" 
              dangerouslySetInnerHTML={{ __html: targetModule.cuerpo }} 
            />
          </article>

          {/* MATERIAL COMPLEMENTARIO TOTALMENTE DINÁMICO */}
          {targetModule.archivoUrl && (
            <section className="edu-resources-section">
              <h3 className="edu-resources-title">Material Complementario</h3>
              <IonGrid fixed className="ion-no-padding">
                <IonRow className="edu-resources-row">
                  <IonCol size="12" sizeMd="6" sizeLg="6">
                    <ResourceCard 
                      title={targetModule.archivoNombre} 
                      subtitle={targetModule.archivoTipo} 
                      url={targetModule.archivoUrl} 
                    />
                  </IonCol>
                </IonRow>
              </IonGrid>
            </section>
          )}

          <footer className="edu-footer-action">
            <p>
              {targetModule.status === 'Completado' 
                ? 'Ya has finalizado este contenido instructivo' 
                : '¿Terminaste de leer el módulo?'}
            </p>
            <IonButton 
              expand="block" 
              className="edu-submit-btn"
              onClick={handleBackToPanel}
              disabled={isSubmitting}
            >
              <IonIcon slot="start" icon={checkmarkCircleOutline} />
              {targetModule.status === 'Completado' ? 'Módulo Visto' : 'Módulo Completado'}
            </IonButton>
          </footer>

        </div>

      </IonContent>
    </IonPage>
  );
};

export default EducationModulePage;
