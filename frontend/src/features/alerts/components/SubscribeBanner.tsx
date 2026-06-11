import React, { useState } from 'react';
import './SubscribeBanner.css';
import { API_URL } from '@/shared/api/apiClient';
import { notify } from '@/shared/notifications';

export const SubscribeBanner: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | ''>('');

  const resetFeedback = () => {
    setFeedbackMessage('');
    setFeedbackType('');
  };

  const openModal = () => {
    resetFeedback();
    setIsOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;

    setIsOpen(false);
    setEmail('');
    resetFeedback();
  };

  const isValidEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      setFeedbackType('error');
      setFeedbackMessage('Ingresa un correo válido.');
      notify.warning('Ingresa un correo válido.');
      return;
    }

    try {
      setIsSubmitting(true);
      resetFeedback();

      const response = await fetch(`${API_URL}/api/alerts/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: normalizedEmail })
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || 'No se pudo registrar la suscripción.');
      }

      setFeedbackType('success');
      setFeedbackMessage('Suscripción registrada correctamente.');
      notify.success('Suscripción registrada correctamente.');
      notify.add({
        type: 'success',
        title: 'Suscripción a alertas',
        message: 'Recibirás avisos cuando se publiquen nuevas alertas.'
      });
      setEmail('');

      setTimeout(() => {
        setIsOpen(false);
        resetFeedback();
      }, 1100);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al registrar la suscripción.';

      setFeedbackType('error');
      setFeedbackMessage(message);
      notify.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section className="subscribe-banner" aria-label="Suscripción a alertas">
        <div className="subscribe-banner-glow" aria-hidden="true" />

        <div className="subscribe-icon-card" aria-hidden="true">
          <span>🔔</span>
        </div>

        <div className="subscribe-text">
          <span className="subscribe-eyebrow">Alertas municipales</span>
          <h2>Recibe noticias y alertas de ciberseguridad</h2>
          <p>
            Suscríbete para recibir recomendaciones, comunicados importantes y
            nuevas alertas directamente en tu correo electrónico.
          </p>

          <div className="subscribe-benefits" aria-label="Beneficios de la suscripción">
            <span>Sin spam</span>
            <span>Gratis</span>
            <span>Información municipal</span>
          </div>
        </div>

        <button
          type="button"
          className="subscribe-button"
          onClick={openModal}
        >
          Suscribirme
        </button>
      </section>

      {isOpen && (
        <div
          className="subscribe-modal-backdrop"
          onClick={closeModal}
          role="presentation"
        >
          <form
            className="subscribe-modal"
            onSubmit={handleSubscribe}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="subscribe-modal-title"
          >
            <button
              type="button"
              className="subscribe-modal-close"
              onClick={closeModal}
              aria-label="Cerrar ventana de suscripción"
              disabled={isSubmitting}
            >
              ×
            </button>

            <div className="subscribe-modal-icon" aria-hidden="true">
              ✉️
            </div>

            <span className="subscribe-modal-eyebrow">Mantente informado</span>

            <h3 id="subscribe-modal-title">Suscribirse a alertas</h3>

            <p>
              Ingresa tu correo para recibir noticias, recomendaciones y avisos
              de ciberseguridad de la Municipalidad de Santo Domingo.
            </p>

            <label className="subscribe-field-label" htmlFor="subscribe-email">
              Correo electrónico
            </label>

            <input
              id="subscribe-email"
              className="subscribe-input"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                resetFeedback();
              }}
              placeholder="correo@dominio.com"
              autoComplete="email"
              required
              disabled={isSubmitting}
            />

            {feedbackMessage && (
              <p className={`subscribe-feedback subscribe-feedback-${feedbackType}`}>
                {feedbackMessage}
              </p>
            )}

            <div className="subscribe-modal-actions">
              <button
                type="button"
                className="subscribe-cancel-button"
                onClick={closeModal}
                disabled={isSubmitting}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="subscribe-confirm-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enviando...' : 'Confirmar suscripción'}
              </button>
            </div>

            <small className="subscribe-privacy-note">
              Usaremos tu correo solo para enviar información relacionada con
              alertas y noticias de ciberseguridad.
            </small>
          </form>
        </div>
      )}
    </>
  );
};

export default SubscribeBanner;
