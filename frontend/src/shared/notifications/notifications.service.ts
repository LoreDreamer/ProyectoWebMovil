export type NotificationKind = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  message: string;
  type?: NotificationKind;
  duration?: number;
}

export interface ConfirmOptions {
  header?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: NotificationKind;
  destructive?: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message?: string;
  type: NotificationKind;
  createdAt: string;
  read: boolean;
}

type ToastListener = (options: Required<ToastOptions>) => void;
type ConfirmHandler = (options: Required<ConfirmOptions>) => Promise<boolean>;
type NotificationListener = (notifications: AppNotification[]) => void;

const NOTIFICATIONS_STORAGE_KEY = 'app_notifications';
const MAX_NOTIFICATIONS = 25;

const toastListeners = new Set<ToastListener>();
const notificationListeners = new Set<NotificationListener>();
let confirmHandler: ConfirmHandler | null = null;

const buildId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const normalizeToast = (options: string | ToastOptions): Required<ToastOptions> => {
  if (typeof options === 'string') {
    return {
      message: options,
      type: 'info',
      duration: 2600
    };
  }

  return {
    message: options.message,
    type: options.type || 'info',
    duration: options.duration || 2600
  };
};

const normalizeConfirm = (options: string | ConfirmOptions): Required<ConfirmOptions> => {
  if (typeof options === 'string') {
    return {
      header: 'Confirmar acción',
      message: options,
      confirmText: 'Aceptar',
      cancelText: 'Cancelar',
      type: 'warning',
      destructive: false
    };
  }

  return {
    header: options.header || 'Confirmar acción',
    message: options.message,
    confirmText: options.confirmText || 'Aceptar',
    cancelText: options.cancelText || 'Cancelar',
    type: options.type || 'warning',
    destructive: Boolean(options.destructive)
  };
};

const readNotifications = (): AppNotification[] => {
  if (typeof window === 'undefined') return [];

  try {
    const rawValue = window.localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    const parsedValue = rawValue ? JSON.parse(rawValue) : [];

    if (!Array.isArray(parsedValue)) return [];

    return parsedValue.filter((item): item is AppNotification => {
      return Boolean(item?.id && item?.title && item?.type && item?.createdAt);
    });
  } catch {
    return [];
  }
};

const writeNotifications = (notifications: AppNotification[]) => {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(
    NOTIFICATIONS_STORAGE_KEY,
    JSON.stringify(notifications.slice(0, MAX_NOTIFICATIONS))
  );

  notificationListeners.forEach((listener) => listener(readNotifications()));
};

const emitToast = (options: Required<ToastOptions>) => {
  if (toastListeners.size === 0) {
    if (typeof window !== 'undefined') {
      window.alert(options.message);
    }
    return;
  }

  toastListeners.forEach((listener) => listener(options));
};

export const notify = {
  subscribeToast(listener: ToastListener) {
    toastListeners.add(listener);
    return () => {
      toastListeners.delete(listener);
    };
  },

  registerConfirmHandler(handler: ConfirmHandler) {
    confirmHandler = handler;

    return () => {
      if (confirmHandler === handler) {
        confirmHandler = null;
      }
    };
  },

  subscribeNotifications(listener: NotificationListener) {
    notificationListeners.add(listener);
    listener(readNotifications());

    return () => {
      notificationListeners.delete(listener);
    };
  },

  toast(options: string | ToastOptions) {
    emitToast(normalizeToast(options));
  },

  success(message: string, duration = 2600) {
    emitToast({ message, type: 'success', duration });
  },

  error(message: string, duration = 3200) {
    emitToast({ message, type: 'error', duration });
  },

  warning(message: string, duration = 3000) {
    emitToast({ message, type: 'warning', duration });
  },

  info(message: string, duration = 2600) {
    emitToast({ message, type: 'info', duration });
  },

  async confirm(options: string | ConfirmOptions) {
    const normalizedOptions = normalizeConfirm(options);

    if (confirmHandler) {
      return confirmHandler(normalizedOptions);
    }

    if (typeof window === 'undefined') return false;

    return window.confirm(normalizedOptions.message);
  },

  add(notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) {
    const newNotification: AppNotification = {
      id: buildId(),
      createdAt: new Date().toISOString(),
      read: false,
      ...notification
    };

    writeNotifications([newNotification, ...readNotifications()].slice(0, MAX_NOTIFICATIONS));

    return newNotification;
  },

  getAll() {
    return readNotifications();
  },

  markAllAsRead() {
    writeNotifications(readNotifications().map((item) => ({ ...item, read: true })));
  },

  clear() {
    writeNotifications([]);
  }
};
