import React, { useMemo, useState } from 'react';
import { IonIcon } from '@ionic/react';
import {
  alertCircleOutline,
  checkmarkCircleOutline,
  linkOutline,
  refreshOutline,
  shieldCheckmarkOutline,
  warningOutline
} from 'ionicons/icons';
import { apiJson } from '@/shared/api/apiClient';
import { notify } from '@/shared/notifications';
import './UrlThreatChecker.css';

type UrlRiskLevel = 'bajo' | 'medio' | 'alto' | 'desconocido';
type UrlAnalysisStatus = 'safe' | 'dangerous' | 'unconfigured' | 'error';

interface UrlThreatMatch {
  threatType: string;
  platformType?: string;
  threatEntryType?: string;
  cacheDuration?: string;
}

interface UrlAnalysisData {
  url: string;
  normalizedUrl: string;
  status: UrlAnalysisStatus;
  riskLevel: UrlRiskLevel;
  checkedWith: string;
  externalServiceUsed: boolean;
  matches: UrlThreatMatch[];
  heuristicWarnings: string[];
  recommendations: string[];
  message: string;
}

interface UrlCheckResponse {
  ok: boolean;
  message: string;
  data: UrlAnalysisData;
}

const riskLabelByLevel: Record<UrlRiskLevel, string> = {
  bajo: 'Riesgo bajo',
  medio: 'Riesgo medio',
  alto: 'Riesgo alto',
  desconocido: 'No concluyente'
};

const statusCopy: Record<UrlAnalysisStatus, string> = {
  safe: 'No se detectaron amenazas conocidas.',
  dangerous: 'La URL aparece en listas de amenazas conocidas.',
  unconfigured: 'Servicio externo no configurado.',
  error: 'No se pudo completar la consulta externa.'
};

const getStatusIcon = (status: UrlAnalysisStatus) => {
  if (status === 'dangerous') return warningOutline;
  if (status === 'safe') return checkmarkCircleOutline;
  if (status === 'unconfigured') return alertCircleOutline;
  return refreshOutline;
};

export const UrlThreatChecker: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<UrlAnalysisData | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const canSubmit = useMemo(() => url.trim().length > 3 && !isChecking, [url, isChecking]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!url.trim()) {
      notify.warning('Ingresa una URL para analizar.');
      return;
    }

    try {
      setIsChecking(true);
      setErrorMessage('');
      setResult(null);

      const response = await apiJson<UrlCheckResponse>('/api/security/url-check', {
        method: 'POST',
        body: JSON.stringify({ url: url.trim() })
      });

      setResult(response.data);

      if (response.data.status === 'dangerous') {
        notify.error('URL marcada como peligrosa. Evita abrirla.');
      } else if (response.data.status === 'safe') {
        notify.success('URL analizada sin coincidencias conocidas.');
      } else if (response.data.status === 'unconfigured') {
        notify.warning('Google Safe Browsing no está configurado. Se usó revisión local.');
      } else {
        notify.warning('No se pudo completar la consulta externa.');
      }
    } catch (error: any) {
      const message = error?.message || 'No se pudo analizar la URL.';
      setErrorMessage(message);
      notify.error(message);
    } finally {
      setIsChecking(false);
    }
  };

  const handleExample = () => {
    setUrl('https://example.com');
    setResult(null);
    setErrorMessage('');
  };

  return (
    <section className="url-checker-card" aria-labelledby="url-checker-title">
      <div className="url-checker-header">
        <div className="url-checker-icon">
          <IonIcon icon={shieldCheckmarkOutline} />
        </div>

        <div>
          <span className="security-eyebrow">Análisis preventivo</span>
          <h2 id="url-checker-title">Revisar enlace sospechoso</h2>
          <p>
            Pega un enlace para verificar si aparece en listas de amenazas conocidas y recibir recomendaciones de seguridad.
          </p>
        </div>
      </div>

      <form className="url-checker-form" onSubmit={handleSubmit}>
        <label htmlFor="security-url-input">URL a analizar</label>

        <div className="url-checker-input-wrap">
          <IonIcon icon={linkOutline} />
          <input
            id="security-url-input"
            type="url"
            value={url}
            placeholder="https://sitio-ejemplo.cl"
            autoComplete="off"
            spellCheck={false}
            onChange={(event) => setUrl(event.target.value)}
          />
        </div>

        <div className="url-checker-actions">
          <button type="submit" className="url-checker-primary" disabled={!canSubmit}>
            {isChecking ? 'Analizando...' : 'Analizar URL'}
          </button>

          <button type="button" className="url-checker-secondary" onClick={handleExample} disabled={isChecking}>
            Usar ejemplo seguro
          </button>
        </div>
      </form>

      {errorMessage && (
        <div className="url-checker-error" role="alert">
          <IonIcon icon={alertCircleOutline} />
          <span>{errorMessage}</span>
        </div>
      )}

      {result && (
        <article className={`url-checker-result url-checker-result-${result.status}`}>
          <div className="url-checker-result-top">
            <div className="url-checker-result-icon">
              <IonIcon icon={getStatusIcon(result.status)} />
            </div>

            <div>
              <span className={`url-risk-badge url-risk-${result.riskLevel}`}>
                {riskLabelByLevel[result.riskLevel]}
              </span>

              <h3>{statusCopy[result.status]}</h3>
              <p>{result.message}</p>
            </div>
          </div>

          <dl className="url-checker-details">
            <div>
              <dt>URL normalizada</dt>
              <dd>{result.normalizedUrl}</dd>
            </div>

            <div>
              <dt>Servicio utilizado</dt>
              <dd>{result.checkedWith}</dd>
            </div>

            <div>
              <dt>Consulta externa</dt>
              <dd>{result.externalServiceUsed ? 'Sí' : 'No'}</dd>
            </div>
          </dl>

          {result.matches.length > 0 && (
            <div className="url-checker-block">
              <h4>Coincidencias detectadas</h4>
              <ul>
                {result.matches.map((match, index) => (
                  <li key={`${match.threatType}-${index}`}>
                    {match.threatType}
                    {match.platformType ? ` · ${match.platformType}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.heuristicWarnings.length > 0 && (
            <div className="url-checker-block url-checker-warnings">
              <h4>Advertencias locales</h4>
              <ul>
                {result.heuristicWarnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="url-checker-block">
            <h4>Recomendaciones</h4>
            <ul>
              {result.recommendations.map((recommendation) => (
                <li key={recommendation}>{recommendation}</li>
              ))}
            </ul>
          </div>
        </article>
      )}
    </section>
  );
};
