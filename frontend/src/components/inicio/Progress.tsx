import React, { useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Progress.css';

interface CuestionarioApi {
  id: string;
  title?: string;
  titulo?: string;
  description?: string;
  resumen?: string;
  risk?: string;
  riesgo?: string;
  puntajeMaximo?: number;
  puntaje_maximo?: number;
  questionsCount?: number;
  questions_count?: number;
}

interface ProgresoCuestionarioApi {
  id?: string;
  cuestionario_id?: string;
  cuestionarioId?: string;
  questionnaireId?: string;
  puntaje_obtenido?: number;
  puntajeObtenido?: number;
  score?: number;
  estatus?: string;
  status?: string;
}

interface ProgresoApiResponse {
  ok?: boolean;
  progreso?: ProgresoCuestionarioApi[];
  progress?: ProgresoCuestionarioApi[];
  completados?: string[];
  completedIds?: string[];
  message?: string;
  error?: string;
}

interface ResultadoCategoria {
  nombre: string;
  puntajeObtenido: number;
  puntajeMaximo: number;
  porcentaje: number;
  completados: number;
}

const API_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

const CATEGORIAS_BASE = [
  'Phishing',
  'Contraseñas seguras',
  'Protección de datos',
  'Redes WiFi',
  'Seguridad general'
];

const normalizarTexto = (valor?: string | null) => {
  return String(valor || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

const limitarPorcentaje = (valor: number) => {
  if (!Number.isFinite(valor)) return 0;

  return Math.max(0, Math.min(100, Math.round(valor)));
};

const obtenerIdCuestionarioProgreso = (item: ProgresoCuestionarioApi) => {
  return String(
    item.cuestionario_id ||
      item.cuestionarioId ||
      item.questionnaireId ||
      ''
  );
};

const obtenerPuntajeObtenido = (item?: ProgresoCuestionarioApi) => {
  if (!item) return 0;

  const puntaje =
    item.puntaje_obtenido ?? item.puntajeObtenido ?? item.score ?? 0;

  return Number(puntaje || 0);
};

const obtenerPuntajeMaximo = (cuestionario?: CuestionarioApi) => {
  if (!cuestionario) return 100;

  const puntaje =
    cuestionario.puntajeMaximo ??
    cuestionario.puntaje_maximo ??
    cuestionario.questionsCount ??
    cuestionario.questions_count ??
    100;

  const numero = Number(puntaje || 100);

  return Number.isFinite(numero) && numero > 0 ? numero : 100;
};

const estaCompletado = (item: ProgresoCuestionarioApi) => {
  const estado = normalizarTexto(item.estatus || item.status);

  return estado === 'completado' || estado === 'completo';
};

const obtenerItemsProgreso = (
  respuesta: ProgresoApiResponse | null
): ProgresoCuestionarioApi[] => {
  if (!respuesta) return [];

  if (Array.isArray(respuesta.progreso)) return respuesta.progreso;
  if (Array.isArray(respuesta.progress)) return respuesta.progress;

  return [];
};

const obtenerCategoria = (cuestionario?: CuestionarioApi) => {
  const texto = normalizarTexto(
    `${cuestionario?.title || cuestionario?.titulo || ''} ${
      cuestionario?.description || cuestionario?.resumen || ''
    } ${cuestionario?.risk || cuestionario?.riesgo || ''}`
  );

  if (
    texto.includes('phishing') ||
    texto.includes('correo') ||
    texto.includes('fraude') ||
    texto.includes('suplantacion') ||
    texto.includes('ingenieria social')
  ) {
    return 'Phishing';
  }

  if (
    texto.includes('contrasena') ||
    texto.includes('password') ||
    texto.includes('clave') ||
    texto.includes('autenticacion') ||
    texto.includes('mfa') ||
    texto.includes('2fa')
  ) {
    return 'Contraseñas seguras';
  }

  if (
    texto.includes('dato') ||
    texto.includes('datos') ||
    texto.includes('privacidad') ||
    texto.includes('informacion') ||
    texto.includes('proteccion')
  ) {
    return 'Protección de datos';
  }

  if (
    texto.includes('wifi') ||
    texto.includes('wi-fi') ||
    texto.includes('red') ||
    texto.includes('redes') ||
    texto.includes('vpn')
  ) {
    return 'Redes WiFi';
  }

  return 'Seguridad general';
};

export const Progress: React.FC = () => {
  const history = useHistory();
  const { token } = useAuth();

  const [cuestionarios, setCuestionarios] = useState<CuestionarioApi[]>([]);
  const [progreso, setProgreso] = useState<ProgresoCuestionarioApi[]>([]);
  const [estaCargando, setEstaCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState('');

  const obtenerCabeceras = (): Record<string, string> => {
    const cabeceras: Record<string, string> = {};

    if (token) {
      cabeceras.Authorization = `Bearer ${token}`;
    }

    return cabeceras;
  };

  const cargarProgreso = async () => {
    if (!token) {
      setCuestionarios([]);
      setProgreso([]);
      setMensajeError('');
      return;
    }

    try {
      setEstaCargando(true);
      setMensajeError('');

      const [respuestaCuestionarios, respuestaProgreso] = await Promise.all([
        fetch(`${API_URL}/api/questionnaires`),
        fetch(`${API_URL}/api/questionnaires/progress/me`, {
          headers: obtenerCabeceras()
        })
      ]);

      const datosCuestionarios = await respuestaCuestionarios
        .json()
        .catch(() => null);

      const datosProgreso: ProgresoApiResponse | null = await respuestaProgreso
        .json()
        .catch(() => null);

      if (!respuestaCuestionarios.ok) {
        throw new Error(
          datosCuestionarios?.message ||
            datosCuestionarios?.error ||
            'No se pudieron cargar los cuestionarios.'
        );
      }

      if (!respuestaProgreso.ok) {
        throw new Error(
          datosProgreso?.message ||
            datosProgreso?.error ||
            'No se pudo cargar tu progreso.'
        );
      }

      setCuestionarios(
        Array.isArray(datosCuestionarios) ? datosCuestionarios : []
      );

      setProgreso(obtenerItemsProgreso(datosProgreso));
    } catch (error: any) {
      console.error('Error al cargar progreso de ciberseguridad:', error);
      setMensajeError(error.message || 'Error al cargar progreso.');
      setCuestionarios([]);
      setProgreso([]);
    } finally {
      setEstaCargando(false);
    }
  };

  useEffect(() => {
    cargarProgreso();

    const actualizarProgreso = () => cargarProgreso();

    window.addEventListener('questionnaires-updated', actualizarProgreso);

    return () => {
      window.removeEventListener('questionnaires-updated', actualizarProgreso);
    };
  }, [token]);

  const resumen = useMemo(() => {
    const cuestionariosPorId = new Map<string, CuestionarioApi>();

    cuestionarios.forEach((cuestionario) => {
      cuestionariosPorId.set(String(cuestionario.id), cuestionario);
    });

    const resultadosCompletados = progreso.filter((item) => {
      const idCuestionario = obtenerIdCuestionarioProgreso(item);

      return Boolean(idCuestionario) && estaCompletado(item);
    });

    const categoriasMap = new Map<string, ResultadoCategoria>();

    CATEGORIAS_BASE.forEach((nombre) => {
      categoriasMap.set(nombre, {
        nombre,
        puntajeObtenido: 0,
        puntajeMaximo: 0,
        porcentaje: 0,
        completados: 0
      });
    });

    let puntajeTotalObtenido = 0;
    let puntajeTotalMaximo = 0;

    resultadosCompletados.forEach((resultado) => {
      const idCuestionario = obtenerIdCuestionarioProgreso(resultado);
      const cuestionario = cuestionariosPorId.get(idCuestionario);

      const categoria = obtenerCategoria(cuestionario);
      const puntajeObtenido = obtenerPuntajeObtenido(resultado);
      const puntajeMaximo = obtenerPuntajeMaximo(cuestionario);

      puntajeTotalObtenido += puntajeObtenido;
      puntajeTotalMaximo += puntajeMaximo;

      const actual =
        categoriasMap.get(categoria) ||
        ({
          nombre: categoria,
          puntajeObtenido: 0,
          puntajeMaximo: 0,
          porcentaje: 0,
          completados: 0
        } as ResultadoCategoria);

      actual.puntajeObtenido += puntajeObtenido;
      actual.puntajeMaximo += puntajeMaximo;
      actual.completados += 1;

      categoriasMap.set(categoria, actual);
    });

    const categorias = Array.from(categoriasMap.values())
      .map((categoria) => ({
        ...categoria,
        porcentaje:
          categoria.puntajeMaximo > 0
            ? limitarPorcentaje(
                (categoria.puntajeObtenido / categoria.puntajeMaximo) * 100
              )
            : 0
      }))
      .filter((categoria) => categoria.completados > 0)
      .sort((a, b) => b.porcentaje - a.porcentaje);

    return {
      completados: resultadosCompletados.length,
      disponibles: cuestionarios.length,
      puntajeTotalObtenido,
      puntajeTotalMaximo,
      porcentajeGlobal:
        puntajeTotalMaximo > 0
          ? limitarPorcentaje((puntajeTotalObtenido / puntajeTotalMaximo) * 100)
          : 0,
      categorias
    };
  }, [cuestionarios, progreso]);

  const categoriaMasBaja = resumen.categorias.length
    ? resumen.categorias.reduce((menor, actual) =>
        actual.porcentaje < menor.porcentaje ? actual : menor
      )
    : null;

  return (
    <div className="progress-container">
      <div className="progress-title-row">
        <div>
          <h3>CONOCIMIENTO EN CIBERSEGURIDAD</h3>
          <p>Tu progreso global a través de los módulos y diagnósticos.</p>
        </div>

        {resumen.completados > 0 && (
          <div className="progress-global-score">
            <strong>{resumen.porcentajeGlobal}%</strong>
            <span>global</span>
          </div>
        )}
      </div>

      {estaCargando ? (
        <div className="progress-empty-state">
          Cargando resultados de diagnósticos...
        </div>
      ) : mensajeError ? (
        <div className="progress-empty-state progress-error-state">
          {mensajeError}
        </div>
      ) : resumen.completados === 0 ? (
        <div className="progress-empty-state">
          Aún no hay resultados de diagnósticos disponibles para calcular tu
          progreso.
          <button
            type="button"
            className="btn-reforzar btn-progress-empty"
            onClick={() => history.push('/cuestionarios')}
          >
            Responder cuestionario
          </button>
        </div>
      ) : (
        <>
          <div className="progress-summary-row">
            <div>
              <span>Cuestionarios completados</span>
              <strong>
                {resumen.completados}/{resumen.disponibles || resumen.completados}
              </strong>
            </div>

            <div>
              <span>Puntaje acumulado</span>
              <strong>
                {resumen.puntajeTotalObtenido}/{resumen.puntajeTotalMaximo}
              </strong>
            </div>
          </div>

          {resumen.categorias.map((categoria) => (
            <div key={categoria.nombre} className="progress-row">
              <span className="skill-name">{categoria.nombre}</span>

              <div className="bar-wrapper">
                <div className="bar-bg">
                  <div
                    className="bar-fill"
                    style={{ width: `${categoria.porcentaje}%` }}
                  />
                </div>

                <span className="skill-perc">{categoria.porcentaje}%</span>
              </div>
            </div>
          ))}

          {categoriaMasBaja && (
            <div className="progress-recommendation">
              <strong>Área a reforzar:</strong> {categoriaMasBaja.nombre}
            </div>
          )}

          <button
            type="button"
            className="btn-reforzar"
            onClick={() => history.push('/educacion')}
          >
            Reforzar
          </button>
        </>
      )}
    </div>
  );
};

export default Progress;
