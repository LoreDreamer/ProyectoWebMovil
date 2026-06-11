import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { IonIcon } from '@ionic/react';
import { notificationsOutline, closeOutline, trashOutline } from 'ionicons/icons';
import { notify, type AppNotification } from './notifications.service';
import './notifications.css';

const formatRelativeTime = (dateValue: string) => {
  const date = new Date(dateValue);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) return 'Ahora';
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Hace ${diffHours} h`;

  const diffDays = Math.floor(diffHours / 24);
  return `Hace ${diffDays} d`;
};

export const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    return notify.subscribeNotifications(setNotifications);
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const togglePanel = () => {
    setIsOpen((current) => {
      const nextValue = !current;

      if (nextValue) {
        notify.markAllAsRead();
      }

      return nextValue;
    });
  };

  const notificationPanel = isOpen ? (
    <div className="notification-panel" role="dialog" aria-label="Centro de notificaciones">
      <div className="notification-panel-header">
        <div>
          <span>Centro de notificaciones</span>
          <strong>{notifications.length} aviso(s)</strong>
        </div>

        <button type="button" onClick={() => setIsOpen(false)} aria-label="Cerrar notificaciones">
          <IonIcon icon={closeOutline} />
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="notification-empty">No hay notificaciones internas todavía.</div>
      ) : (
        <div className="notification-list">
          {notifications.map((notification) => (
            <article
              key={notification.id}
              className={`notification-item notification-item-${notification.type}`}
            >
              <div>
                <strong>{notification.title}</strong>
                {notification.message && <p>{notification.message}</p>}
                <span>{formatRelativeTime(notification.createdAt)}</span>
              </div>
            </article>
          ))}
        </div>
      )}

      {notifications.length > 0 && (
        <button type="button" className="notification-clear-button" onClick={() => notify.clear()}>
          <IonIcon icon={trashOutline} />
          Limpiar notificaciones
        </button>
      )}
    </div>
  ) : null;

  return (
    <>
      <div className="notification-bell-wrapper">
        <button
          type="button"
          className="notification-bell-button"
          aria-label="Ver notificaciones"
          aria-expanded={isOpen}
          onClick={togglePanel}
        >
          <IonIcon icon={notificationsOutline} />
          {unreadCount > 0 && <span className="notification-bell-badge">{unreadCount}</span>}
        </button>
      </div>

      {notificationPanel && createPortal(notificationPanel, document.body)}
    </>
  );
};
