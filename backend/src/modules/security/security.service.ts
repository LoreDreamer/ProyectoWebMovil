import crypto from 'crypto';
import { env } from '../../config/env';

export type UrlRiskLevel = 'bajo' | 'medio' | 'alto' | 'desconocido';
export type UrlAnalysisStatus = 'safe' | 'dangerous' | 'unconfigured' | 'error';

export interface UrlThreatMatch {
  threatType: string;
  platformType?: string;
  threatEntryType?: string;
  cacheDuration?: string;
}

export interface UrlAnalysisResult {
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

const SAFE_BROWSING_ENDPOINT = 'https://safebrowsing.googleapis.com/v4/threatMatches:find';
const SAFE_BROWSING_THREAT_TYPES = [
  'MALWARE',
  'SOCIAL_ENGINEERING',
  'UNWANTED_SOFTWARE',
  'POTENTIALLY_HARMFUL_APPLICATION'
];

const normalizeUrl = (rawUrl: string) => {
  const trimmed = String(rawUrl || '').trim();

  if (!trimmed) {
    throw new Error('Debes ingresar una URL para analizar.');
  }

  const candidate = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(candidate);
  } catch {
    throw new Error('La URL ingresada no tiene un formato válido.');
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('Solo se pueden analizar URLs con protocolo http o https.');
  }

  parsedUrl.hash = '';

  return parsedUrl.toString();
};

const getHostname = (url: string) => {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return '';
  }
};

const isIpAddress = (hostname: string) => /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);

const hasSuspiciousCharacters = (url: string) => {
  return /[@\\]/.test(url) || /%[0-9a-f]{2}/i.test(url);
};

const analyzeLocalHeuristics = (normalizedUrl: string) => {
  const warnings: string[] = [];
  const hostname = getHostname(normalizedUrl);

  if (!normalizedUrl.startsWith('https://')) {
    warnings.push('La URL no utiliza HTTPS.');
  }

  if (isIpAddress(hostname)) {
    warnings.push('La URL usa una dirección IP en lugar de un dominio reconocible.');
  }

  if (hostname.split('.').length >= 4) {
    warnings.push('El dominio contiene varios subdominios, revisa que sea legítimo.');
  }

  if (hasSuspiciousCharacters(normalizedUrl)) {
    warnings.push('La URL contiene caracteres que suelen usarse para ocultar destinos.');
  }

  if (normalizedUrl.length > 120) {
    warnings.push('La URL es demasiado larga, revisa que no oculte parámetros sospechosos.');
  }

  const suspiciousWords = ['login', 'verify', 'seguridad', 'cuenta', 'password', 'banco', 'premio', 'free', 'update'];
  const lowerUrl = normalizedUrl.toLowerCase();

  if (suspiciousWords.some((word) => lowerUrl.includes(word))) {
    warnings.push('La URL contiene palabras frecuentemente usadas en campañas de phishing.');
  }

  return warnings;
};

const buildRecommendations = (status: UrlAnalysisStatus, warnings: string[]) => {
  if (status === 'dangerous') {
    return [
      'No abras el enlace ni ingreses credenciales.',
      'Si recibiste el enlace por correo o mensaje, repórtalo como sospechoso.',
      'Verifica el sitio escribiendo la dirección oficial manualmente en el navegador.'
    ];
  }

  if (status === 'unconfigured') {
    return [
      'Configura GOOGLE_SAFE_BROWSING_API_KEY para activar la revisión con Google Safe Browsing.',
      'Mientras tanto, usa las advertencias locales solo como apoyo preventivo.',
      'Nunca ingreses contraseñas en sitios que no reconozcas o que no usen HTTPS.'
    ];
  }

  if (warnings.length > 0) {
    return [
      'Aunque el servicio externo no reportó la URL como peligrosa, revisa las advertencias locales.',
      'Confirma que el dominio sea el oficial antes de ingresar datos personales.',
      'Evita descargar archivos desde enlaces inesperados.'
    ];
  }

  return [
    'No se detectaron amenazas conocidas en el servicio externo.',
    'Aun así, revisa siempre el dominio antes de ingresar datos personales.',
    'Mantén actualizado el navegador y evita abrir enlaces de remitentes desconocidos.'
  ];
};

const mapMatches = (matches: any[] = []): UrlThreatMatch[] => {
  return matches.map((match) => ({
    threatType: String(match?.threatType || 'DESCONOCIDO'),
    platformType: match?.platformType ? String(match.platformType) : undefined,
    threatEntryType: match?.threatEntryType ? String(match.threatEntryType) : undefined,
    cacheDuration: match?.cacheDuration ? String(match.cacheDuration) : undefined
  }));
};

const getRiskFromResult = (status: UrlAnalysisStatus, warnings: string[]): UrlRiskLevel => {
  if (status === 'dangerous') return 'alto';
  if (status === 'unconfigured' || status === 'error') return 'desconocido';
  if (warnings.length >= 2) return 'medio';
  return 'bajo';
};

export const analyzeUrl = async (rawUrl: string): Promise<UrlAnalysisResult> => {
  const normalizedUrl = normalizeUrl(rawUrl);
  const heuristicWarnings = analyzeLocalHeuristics(normalizedUrl);
  const apiKey = env.googleSafeBrowsingApiKey;

  if (!apiKey) {
    const status: UrlAnalysisStatus = 'unconfigured';

    return {
      url: rawUrl,
      normalizedUrl,
      status,
      riskLevel: getRiskFromResult(status, heuristicWarnings),
      checkedWith: 'Validación local preventiva',
      externalServiceUsed: false,
      matches: [],
      heuristicWarnings,
      recommendations: buildRecommendations(status, heuristicWarnings),
      message: 'El analizador local se ejecutó correctamente, pero Google Safe Browsing no está configurado.'
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${SAFE_BROWSING_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client: {
          clientId: env.googleSafeBrowsingClientId,
          clientVersion: env.googleSafeBrowsingClientVersion
        },
        threatInfo: {
          threatTypes: SAFE_BROWSING_THREAT_TYPES,
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [{ url: normalizedUrl }]
        }
      }),
      signal: controller.signal
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage = data?.error?.message || 'Google Safe Browsing no pudo analizar la URL.';
      throw new Error(errorMessage);
    }

    const matches = mapMatches(data?.matches || []);
    const status: UrlAnalysisStatus = matches.length > 0 ? 'dangerous' : 'safe';
    const requestId = crypto
      .createHash('sha256')
      .update(`${normalizedUrl}-${Date.now()}`)
      .digest('hex')
      .slice(0, 12);

    return {
      url: rawUrl,
      normalizedUrl,
      status,
      riskLevel: getRiskFromResult(status, heuristicWarnings),
      checkedWith: 'Google Safe Browsing',
      externalServiceUsed: true,
      matches,
      heuristicWarnings,
      recommendations: buildRecommendations(status, heuristicWarnings),
      message:
        status === 'dangerous'
          ? 'La URL coincide con listas de amenazas conocidas.'
          : 'No se encontraron coincidencias en las listas de amenazas consultadas.',
      // Campo interno útil para depuración sin exponer datos sensibles.
      // Se mantiene dentro del objeto para trazabilidad en pruebas de EF5.
      ...(requestId ? { requestId } : {})
    } as UrlAnalysisResult;
  } catch (error: any) {
    const status: UrlAnalysisStatus = 'error';

    return {
      url: rawUrl,
      normalizedUrl,
      status,
      riskLevel: getRiskFromResult(status, heuristicWarnings),
      checkedWith: 'Google Safe Browsing',
      externalServiceUsed: true,
      matches: [],
      heuristicWarnings,
      recommendations: [
        'No se pudo completar la consulta externa. Intenta nuevamente más tarde.',
        'No ingreses datos personales hasta verificar el enlace por otros medios.',
        'Confirma el dominio oficial escribiéndolo manualmente en el navegador.'
      ],
      message:
        error?.name === 'AbortError'
          ? 'La consulta al servicio externo excedió el tiempo de espera.'
          : error?.message || 'No se pudo analizar la URL con el servicio externo.'
    };
  } finally {
    clearTimeout(timeoutId);
  }
};
