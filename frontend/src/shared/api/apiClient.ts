export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:3000';

// Alias para mantener compatibilidad con los archivos existentes mientras se refactorizan.
export const API_URL = API_BASE_URL;

export const buildApiUrl = (path: string) => {
  if (!path) return API_BASE_URL;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/')) return `${API_BASE_URL}${path}`;
  return `${API_BASE_URL}/${path}`;
};

export const buildResourceUrl = (url?: string | null) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  if (url.startsWith('/')) return `${API_BASE_URL}${url}`;
  return `${API_BASE_URL}/${url}`;
};

export const getAuthToken = () => localStorage.getItem('auth_token');

export const getAuthHeaders = (extraHeaders: Record<string, string> = {}) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...extraHeaders
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export const apiFetch = (path: string, options: RequestInit = {}) => {
  const isFormData = options.body instanceof FormData;

  const headers = new Headers(options.headers);

  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getAuthToken();

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(buildApiUrl(path), {
    ...options,
    headers
  });
};

export const apiJson = async <T>(path: string, options: RequestInit = {}) => {
  const response = await apiFetch(path, options);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Error en la solicitud.');
  }

  return data as T;
};
