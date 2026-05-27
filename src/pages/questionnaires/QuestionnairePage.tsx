import React, { useEffect, useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import {
  Navbar,
  QuestionnaireCard,
  Footer,
  QuestionnairesPanel
} from '../../components';
import { useAuth } from '../../context/AuthContext';
import './QuestionnairePage.css';

import im001 from '../../assets/logos/im001.png';
import im002 from '../../assets/logos/im002.png';
import im003 from '../../assets/logos/im003.png';

import inge from '../../assets/questions/inge.png';
import contrasena from '../../assets/questions/contrasena.webp';
import dispositivos from '../../assets/questions/dispositivos.png';
import wifi from '../../assets/questions/wifi.png';
import phishing from '../../assets/questions/phishing.png';
import datos from '../../assets/questions/datos.png';

interface QuestionnaireModule {
  id: string;
  titulo: string;
  description: string;
  riesgo: string;
  score?: number;
  img: string;
}

interface BackendQuestionnaire {
  id: string;

  title?: string;
  titulo?: string;

  description?: string;
  resumen?: string;

  risk?: string;
  riesgo?: string;
  difficulty?: string;

  coverUrl?: string;
  cover_img?: string;

  category?: string;

  questionsCount?: number;
  questions_count?: number;
  puntajeMaximo?: number;
  puntaje_maximo?: number;
}

const API_URL = 'http://localhost:3000';

const realizadosData: QuestionnaireModule[] = [
  {
    id: 'realizado-1',
    titulo: 'PHISHING Y CORREO',
    description: 'Identifica señales de fraude en correos.',
    score: 30,
    riesgo: 'Medio',
    img: phishing
  },
  {
    id: 'realizado-2',
    titulo: 'SEGURIDAD DE DATOS',
    description: 'Identifica riesgos asociados al manejo de información personal.',
    score: 60,
    riesgo: 'Alto',
    img: datos
  },
  {
    id: 'realizado-3',
    titulo: 'CONTRASEÑAS',
    description: 'Evalúa tus hábitos de creación y protección de contraseñas.',
    score: 50,
    riesgo: 'Medio',
    img: contrasena
  },
  {
    id: 'realizado-4',
    titulo: 'INGENIERÍA SOCIAL',
    description: 'Reconoce intentos de manipulación y suplantación.',
    score: 90,
    riesgo: 'Bajo',
    img: inge
  }
];

const disponiblesFallback: QuestionnaireModule[] = [
  {
    id: 'disponible-1',
    titulo: 'WIFI SEGURA',
    description: 'Aprende a proteger tu entorno digital.',
    riesgo: 'Medio',
    img: wifi
  },
  {
    id: 'disponible-2',
    titulo: 'DISPOSITIVOS',
    description: 'Aprende a proteger tus dispositivos personales.',
    riesgo: 'Bajo',
    img: dispositivos
  }
];

export const QuestionnairePage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [disponiblesData, setDisponiblesData] = useState<
    QuestionnaireModule[]
  >(disponiblesFallback);

  const buildFileUrl = (url?: string) => {
    if (!url) return '';

    if (
      url.startsWith('http') ||
      url.startsWith('blob:') ||
      url.startsWith('data:')
    ) {
      return url;
    }

    if (url.startsWith('/')) return `${API_URL}${url}`;

    return `${API_URL}/${url}`;
  };

  const normalizeRisk = (risk?: string) => {
    const normalized = String(risk || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    if (normalized === 'alto') return 'Alto';
    if (normalized === 'bajo') return 'Bajo';

    return 'Medio';
  };

  const getFallbackImage = (item: BackendQuestionnaire) => {
    const text = `${item.title || item.titulo || ''} ${
      item.category || ''
    }`.toLowerCase();

    if (text.includes('phishing')) return phishing;
    if (text.includes('dato')) return datos;
    if (text.includes('contraseña') || text.includes('password')) {
      return contrasena;
    }
    if (text.includes('wifi') || text.includes('wi-fi')) return wifi;
    if (text.includes('dispositivo')) return dispositivos;
    if (text.includes('ingeniería')) return inge;

    return phishing;
  };

  const loadQuestionnaires = async () => {
    try {
      const response = await fetch(`${API_URL}/api/questionnaires`);

      if (!response.ok) {
        throw new Error('No se pudieron cargar los cuestionarios');
      }

      const data: BackendQuestionnaire[] = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        setDisponiblesData(disponiblesFallback);
        return;
      }

      const backendQuestionnaires: QuestionnaireModule[] = data.map((item) => {
        const title = item.title || item.titulo || 'Cuestionario';
        const description =
          item.description ||
          item.resumen ||
          'Aprende a proteger tu entorno digital.';

        const coverUrl = item.coverUrl || item.cover_img || '';

        return {
          id: String(item.id),
          titulo: title,
          description,
          riesgo: normalizeRisk(item.risk || item.riesgo || item.difficulty),
          img: coverUrl ? buildFileUrl(coverUrl) : getFallbackImage(item)
        };
      });

      setDisponiblesData(backendQuestionnaires);
    } catch (error) {
      console.error('Error al cargar cuestionarios:', error);
      setDisponiblesData(disponiblesFallback);
    }
  };

  useEffect(() => {
    loadQuestionnaires();

    const handler = () => loadQuestionnaires();
    window.addEventListener('questionnaires-updated', handler);

    return () => {
      window.removeEventListener('questionnaires-updated', handler);
    };
  }, []);

  return (
    <IonPage>
      <Navbar />

      <IonContent fullscreen className="cuestionarios-content">
        <div className="cuestionarios-shell">
          {isAdmin && (
            <section style={{ marginBottom: 24 }}>
              <QuestionnairesPanel />
            </section>
          )}

          <header>
            <h1 className="resumen-title">Resumen de cuestionarios</h1>

            <p className="resumen-subtitle">
              Evalúa tus conocimientos en distintos ámbitos de la
              ciberseguridad municipal.
            </p>

            <div className="stats-banner">
              <div className="stat-box">
                <img src={im001} className="stat-icon" alt="icon" />

                <div className="stat-info">
                  <span>Promedio General</span>
                  <span className="stat-value">46%</span>
                </div>
              </div>

              <div className="stat-box">
                <img src={im002} className="stat-icon" alt="icon" />

                <div className="stat-info">
                  <span>Completados</span>
                  <span className="stat-value">3</span>
                </div>
              </div>

              <div className="stat-box">
                <img src={im003} className="stat-icon" alt="icon" />

                <div className="stat-info">
                  <span>Áreas a Reforzar</span>
                  <span className="stat-value">2</span>
                </div>
              </div>
            </div>
          </header>

          <h2 className="section-title">Cuestionarios realizados</h2>

          <p className="resumen-subtitle">
            En esta sección se detallan los resultados de las evaluaciones que
            has finalizado. Puedes revisar el puntaje obtenido en cada
            categoría, el nivel de riesgo identificado según tus respuestas y
            volver a consultar la información clave para asegurar que tus datos
            y dispositivos estén siempre protegidos.
          </p>

          <div className="cuestionarios-grid">
            {realizadosData.map((item) => (
              <QuestionnaireCard
                key={item.id}
                title={item.titulo}
                description={item.description}
                risk={item.riesgo}
                status="Completado"
                score={item.score}
                bgImage={item.img}
              />
            ))}
          </div>

          <h2 className="section-title">Cuestionarios disponibles</h2>

          <p className="resumen-subtitle">
            Fortalece tu seguridad digital completando los desafíos pendientes.
            Selecciona un tema para comenzar la evaluación y obtén
            recomendaciones personalizadas para proteger tu información en el
            entorno municipal.
          </p>

          <div className="cuestionarios-grid">
            {disponiblesData.map((item) => (
              <QuestionnaireCard
                key={item.id}
                title={item.titulo}
                description={item.description}
                risk={item.riesgo}
                status="Pendiente"
                bgImage={item.img}
              />
            ))}
          </div>
        </div>

        <Footer />
      </IonContent>
    </IonPage>
  );
};

export default QuestionnairePage;