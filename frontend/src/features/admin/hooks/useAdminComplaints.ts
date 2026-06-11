import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/shared/api/apiClient';
import { notify } from '@/shared/notifications';

interface ComplaintFileApi {
  id?: string;
  name?: string;
  originalName?: string;
  url?: string | null;
  path?: string | null;
  type?: string;
  size?: number | null;
  order?: number;
}

interface ComplaintApiResponse {
  id: string;
  nombre?: string;
  nombreCompleto?: string;
  nombre_completo?: string;
  correo?: string;
  tipoIncidente?: string;
  tipo_incidente?: string;
  fechaIncidente?: string;
  fecha?: string;
  descripcion?: string;
  archivoAdjunto?: string;
  archivo_adjunto?: string;
  rutaArchivo?: string | null;
  adjunto_url?: string | null;
  archivos?: ComplaintFileApi[];
  fechaRegistro?: string;
  creado_en?: string;
}

interface DeleteComplaintApiResponse {
  ok?: boolean;
  deletedId?: string;
  message?: string;
  error?: string;
}

export interface ComplaintAttachmentRow {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number | null;
}

export interface ComplaintRow {
  id: string;
  nombreCompleto: string;
  correo: string;
  tipoIncidente: string;
  fechaIncidente: string;
  descripcion: string;
  archivoAdjunto: string;
  rutaArchivo: string;
  archivos: ComplaintAttachmentRow[];
  fechaRegistro: string;
}

const formatIncidentType = (value?: string) => {
  const rawValue = String(value || '').trim();

  if (!rawValue) return 'No especificado';

  return rawValue
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
};

const formatDate = (value?: string) => {
  if (!value) return 'Sin fecha';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

const normalizeComplaintFiles = (
  files: ComplaintFileApi[] | undefined,
  fallbackName: string,
  fallbackUrl: string
): ComplaintAttachmentRow[] => {
  const normalizedFiles = Array.isArray(files)
    ? files
        .map((fileItem, index): ComplaintAttachmentRow => {
          const url = String(fileItem.url || fileItem.path || '').trim();
          const name = String(
            fileItem.name ||
              fileItem.originalName ||
              fallbackName ||
              `Archivo ${index + 1}`
          ).trim();

          return {
            id: String(fileItem.id || `${index + 1}-${url || name}`),
            name: name || `Archivo ${index + 1}`,
            url,
            type: String(fileItem.type || ''),
            size:
              typeof fileItem.size === 'number' && Number.isFinite(fileItem.size)
                ? fileItem.size
                : null
          };
        })
        .filter((fileItem) => fileItem.url)
    : [];

  if (normalizedFiles.length > 0 || !fallbackUrl) {
    return normalizedFiles;
  }

  return [
    {
      id: fallbackUrl,
      name: fallbackName || 'Archivo adjunto',
      url: fallbackUrl,
      type: '',
      size: null
    }
  ];
};

const mapComplaintToRow = (complaint: ComplaintApiResponse): ComplaintRow => {
  const archivoAdjunto = String(
    complaint.archivoAdjunto || complaint.archivo_adjunto || ''
  ).trim();

  const rutaArchivo = String(
    complaint.rutaArchivo || complaint.adjunto_url || ''
  ).trim();

  return {
    id: String(complaint.id),
    nombreCompleto:
      complaint.nombreCompleto ||
      complaint.nombre_completo ||
      complaint.nombre ||
      'Persona no identificada',
    correo: complaint.correo || 'Sin correo',
    tipoIncidente: formatIncidentType(
      complaint.tipoIncidente || complaint.tipo_incidente
    ),
    fechaIncidente: formatDate(complaint.fechaIncidente || complaint.fecha),
    descripcion: complaint.descripcion || 'Sin descripción',
    archivoAdjunto: archivoAdjunto || 'Ninguno',
    rutaArchivo,
    archivos: normalizeComplaintFiles(complaint.archivos, archivoAdjunto, rutaArchivo),
    fechaRegistro: formatDate(complaint.fechaRegistro || complaint.creado_en)
  };
};

export const useAdminComplaints = () => {
  const { token } = useAuth();

  const [complaints, setComplaints] = useState<ComplaintRow[]>([]);
  const [isLoadingComplaints, setIsLoadingComplaints] = useState(false);
  const [isDeletingComplaint, setIsDeletingComplaint] = useState(false);
  const [complaintsError, setComplaintsError] = useState('');
  const [complaintsSuccess, setComplaintsSuccess] = useState('');

  const getAuthHeaders = useCallback((): Record<string, string> => {
    const headers: Record<string, string> = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }, [token]);

  const loadComplaints = useCallback(async () => {
    if (!token) {
      setComplaints([]);
      return;
    }

    try {
      setIsLoadingComplaints(true);
      setComplaintsError('');

      const response = await fetch(`${API_URL}/api/denuncias`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      const data = await response.json().catch(() => []);

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || 'No se pudieron cargar las denuncias.'
        );
      }

      const complaintsFromApi = Array.isArray(data)
        ? data
        : Array.isArray(data?.denuncias)
          ? data.denuncias
          : Array.isArray(data?.complaints)
            ? data.complaints
            : [];

      setComplaints(complaintsFromApi.map(mapComplaintToRow));
    } catch (error: any) {
      console.error('Error al cargar denuncias:', error);
      setComplaints([]);
      setComplaintsError(error.message || 'Error al cargar denuncias.');
      notify.error(error.message || 'Error al cargar denuncias.');
    } finally {
      setIsLoadingComplaints(false);
    }
  }, [getAuthHeaders, token]);

  const deleteComplaint = useCallback(
    async (id: string) => {
      if (!token) {
        throw new Error('Sesión no válida. Inicia sesión nuevamente.');
      }

      try {
        setIsDeletingComplaint(true);
        setComplaintsError('');
        setComplaintsSuccess('');

        const response = await fetch(`${API_URL}/api/denuncias/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });

        const data: DeleteComplaintApiResponse = await response
          .json()
          .catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.message || data.error || 'No se pudo eliminar la denuncia.'
          );
        }

        setComplaints((currentComplaints) =>
          currentComplaints.filter((complaint) => complaint.id !== id)
        );

        setComplaintsSuccess('Denuncia eliminada correctamente.');
        notify.success('Denuncia eliminada correctamente.');
        notify.add({
          type: 'success',
          title: 'Denuncia eliminada',
          message: 'El registro fue eliminado del panel de administración.'
        });
        window.dispatchEvent(new Event('complaints-updated'));
      } catch (error: any) {
        console.error('Error al eliminar denuncia:', error);
        setComplaintsError(error.message || 'Error al eliminar denuncia.');
        notify.error(error.message || 'Error al eliminar denuncia.');
        throw error;
      } finally {
        setIsDeletingComplaint(false);
      }
    },
    [getAuthHeaders, token]
  );

  useEffect(() => {
    loadComplaints();

    const refreshComplaints = () => loadComplaints();

    window.addEventListener('complaints-updated', refreshComplaints);

    return () => {
      window.removeEventListener('complaints-updated', refreshComplaints);
    };
  }, [loadComplaints]);

  return {
    complaints,
    complaintsError,
    complaintsSuccess,
    isLoadingComplaints,
    isDeletingComplaint,
    loadComplaints,
    deleteComplaint
  };
};
