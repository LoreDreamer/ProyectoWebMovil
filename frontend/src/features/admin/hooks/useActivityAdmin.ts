import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/shared/api/apiClient';
import { notify } from '@/shared/notifications';

export interface Activity {
  id: string;
  title: string;
  titulo?: string;
  description: string;
  descripcion?: string;
  date: string;
  fecha?: string;
  createdAt?: string | null;
  publicado_por?: string | null;
  host?: string | null;
}

export const formatDateForInput = (date?: string | null) => {
  if (!date) return '';

  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }

  return parsedDate.toISOString().split('T')[0];
};

export const formatDateForView = (date?: string | null) => {
  if (!date) return 'Sin fecha';

  const inputDate = formatDateForInput(date);

  if (!inputDate) return 'Sin fecha';

  const [year, month, day] = inputDate.split('-');

  return `${day}-${month}-${year}`;
};

export const useActivityAdmin = () => {
  const { user, token } = useAuth();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');

  const isAdmin = user?.role === 'admin';

  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };
  };

  const normalizeActivityFromApi = (activity: Activity): Activity => {
    const normalizedTitle = activity.title || activity.titulo || '';
    const normalizedDescription = activity.description || activity.descripcion || '';
    const normalizedDate = activity.date || activity.fecha || '';

    return {
      ...activity,
      id: String(activity.id),
      title: normalizedTitle,
      titulo: normalizedTitle,
      description: normalizedDescription,
      descripcion: normalizedDescription,
      date: formatDateForInput(normalizedDate),
      fecha: activity.fecha || normalizedDate,
      publicado_por: activity.publicado_por || activity.host || null
    };
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDate('');
    setEditingActivity(null);
  };

  const loadActivities = async () => {
    try {
      const response = await fetch(`${API_URL}/api/activities`);

      if (!response.ok) {
        throw new Error('No se pudieron cargar las actividades');
      }

      const data = await response.json();

      setActivities(
        Array.isArray(data)
          ? data.map((activity) => normalizeActivityFromApi(activity))
          : []
      );
    } catch (error) {
      console.error('Error al cargar actividades:', error);
      setActivities([]);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;

    loadActivities();

    const handler = () => loadActivities();
    window.addEventListener('activities-updated', handler);

    return () => {
      window.removeEventListener('activities-updated', handler);
    };
  }, [isAdmin, token]);

  const filteredActivities = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();

    return activities.filter((activity) => {
      return (
        activity.title.toLowerCase().includes(normalizedSearch) ||
        activity.description.toLowerCase().includes(normalizedSearch) ||
        activity.date.toLowerCase().includes(normalizedSearch) ||
        formatDateForView(activity.date).toLowerCase().includes(normalizedSearch)
      );
    });
  }, [activities, searchTerm]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !date.trim()) {
      notify.warning('Completa título, descripción y fecha.');
      return;
    }

    if (!token) {
      notify.warning('Debes iniciar sesión como administrador.');
      return;
    }

    const payload = {
      title: title.trim(),
      titulo: title.trim(),
      description: description.trim(),
      descripcion: description.trim(),
      date,
      fecha: date
    };

    try {
      let response: Response;

      if (editingActivity) {
        response = await fetch(`${API_URL}/api/activities/${editingActivity.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch(`${API_URL}/api/activities`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message || errorData?.error || 'Error al guardar actividad'
        );
      }

      resetForm();
      await loadActivities();
      window.dispatchEvent(new Event('activities-updated'));

      notify.success(
        editingActivity
          ? 'Actividad actualizada correctamente.'
          : 'Actividad creada correctamente.'
      );
    } catch (error: any) {
      console.error('Error al guardar actividad:', error);
      notify.error(error.message || 'Error al guardar actividad.');
    }
  };

  const handleEdit = (activity: Activity) => {
    const normalizedActivity = normalizeActivityFromApi(activity);

    setEditingActivity(normalizedActivity);
    setTitle(normalizedActivity.title);
    setDescription(normalizedActivity.description);
    setDate(normalizedActivity.date);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await notify.confirm({
      header: 'Eliminar actividad',
      message: '¿Eliminar esta actividad? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      destructive: true
    });

    if (!confirmed) return;

    if (!token) {
      notify.warning('Debes iniciar sesión como administrador.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/activities/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message || errorData?.error || 'Error al eliminar actividad'
        );
      }

      await loadActivities();
      window.dispatchEvent(new Event('activities-updated'));

      if (editingActivity?.id === id) {
        resetForm();
      }

      notify.success('Actividad eliminada correctamente.');
    } catch (error: any) {
      console.error('Error al eliminar actividad:', error);
      notify.error(error.message || 'Error al eliminar actividad.');
    }
  };

  return {
    activities,
    filteredActivities,
    searchTerm,
    setSearchTerm,
    editingActivity,
    title,
    setTitle,
    description,
    setDescription,
    date,
    setDate,
    isAdmin,
    resetForm,
    handleSubmit,
    handleEdit,
    handleDelete
  };
};
