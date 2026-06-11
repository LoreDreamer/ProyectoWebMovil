import React, { useEffect, useMemo, useRef, useState } from 'react';
import { IonAlert, IonToast } from '@ionic/react';
import { notify, type ConfirmOptions, type ToastOptions } from './notifications.service';

const toastColorByType: Record<NonNullable<ToastOptions['type']>, string> = {
  success: 'success',
  error: 'danger',
  warning: 'warning',
  info: 'primary'
};

const confirmIconByType: Record<NonNullable<ConfirmOptions['type']>, string> = {
  success: '✓',
  error: '!',
  warning: '!',
  info: 'i'
};

const isLogoutConfirm = (options: Pick<ConfirmOptions, 'header' | 'confirmText'>) => {
  const header = options.header?.toLowerCase() || '';
  const confirmText = options.confirmText?.toLowerCase() || '';

  return header.includes('cerrar sesión') || confirmText.includes('cerrar sesión');
};

export const NotificationProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [toastState, setToastState] = useState<Required<ToastOptions> & { isOpen: boolean }>({
    isOpen: false,
    message: '',
    type: 'info',
    duration: 2600
  });

  const [confirmState, setConfirmState] = useState<Required<ConfirmOptions> & { isOpen: boolean }>({
    isOpen: false,
    header: '',
    message: '',
    confirmText: 'Aceptar',
    cancelText: 'Cancelar',
    type: 'warning',
    destructive: false
  });

  const confirmResolverRef = useRef<((value: boolean) => void) | null>(null);

  useEffect(() => {
    const unsubscribeToast = notify.subscribeToast((options) => {
      setToastState({
        isOpen: true,
        ...options
      });
    });

    const unregisterConfirm = notify.registerConfirmHandler((options) => {
      return new Promise<boolean>((resolve) => {
        confirmResolverRef.current = resolve;
        setConfirmState({
          isOpen: true,
          ...options
        });
      });
    });

    return () => {
      unsubscribeToast();
      unregisterConfirm();
    };
  }, []);

  const resolveConfirm = (value: boolean) => {
    confirmResolverRef.current?.(value);
    confirmResolverRef.current = null;
    setConfirmState((current) => ({ ...current, isOpen: false }));
  };

  const isLogout = isLogoutConfirm(confirmState);
  const visualType = isLogout ? 'error' : confirmState.type;
  const isDangerAction = confirmState.destructive || isLogout;

  const confirmCssClass = useMemo(() => {
    const classes = ['app-confirm', `app-confirm-${visualType}`];

    if (isDangerAction) {
      classes.push('app-confirm-danger');
    }

    if (isLogout) {
      classes.push('app-confirm-logout');
    }

    return classes.join(' ');
  }, [isDangerAction, isLogout, visualType]);

  const confirmHeader = confirmState.header || 'Confirmar acción';
  const confirmIcon = isLogout ? '×' : confirmIconByType[visualType] || confirmIconByType.warning;

  return (
    <>
      {children}

      <IonToast
        isOpen={toastState.isOpen}
        message={toastState.message}
        duration={toastState.duration}
        color={toastColorByType[toastState.type]}
        position="top"
        onDidDismiss={() => setToastState((current) => ({ ...current, isOpen: false }))}
      />

      <IonAlert
        isOpen={confirmState.isOpen}
        header={`${confirmIcon}  ${confirmHeader}`}
        message={confirmState.message}
        backdropDismiss={false}
        cssClass={confirmCssClass}
        buttons={[
          {
            text: confirmState.cancelText,
            role: 'cancel',
            handler: () => resolveConfirm(false)
          },
          {
            text: confirmState.confirmText,
            role: 'confirm',
            cssClass: isDangerAction ? 'app-confirm-button-danger' : 'app-confirm-button-primary',
            handler: () => resolveConfirm(true)
          }
        ]}
        onDidDismiss={(event) => {
          if (event.detail.role !== 'confirm' && confirmResolverRef.current) {
            resolveConfirm(false);
          }
        }}
      />
    </>
  );
};
