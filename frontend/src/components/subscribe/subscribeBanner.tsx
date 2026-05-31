import React, { useState } from 'react';
import './subscribeBanner.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
      return;
    }

    try {
      setIsSubmitting(true);
      resetFeedback();

      const response = await fetch(`${API_URL}/api/alerts/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || 'No se pudo registrar la suscripción.');
      }

      setFeedbackType('success');
      setFeedbackMessage('Suscripción registrada correctamente.');
      setEmail('');

      setTimeout(() => {
        setIsOpen(false);
        resetFeedback();
      }, 900);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al registrar la suscripción.';

      setFeedbackType('error');
      setFeedbackMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section className="subscribe-banner">
        <div className="subscribe-text">
          <h2>¡Suscríbete para revisar noticias!</h2>
          <p>Te enviaremos estas noticias todos los días a tu correo electrónico.</p>
        </div>

        <button
          type="button"
          className="subscribe-button"
          onClick={openModal}
        >
          Suscribirse
        </button>
      </section>

      {isOpen && (
        <div className="subscribe-modal-backdrop" onClick={closeModal}>
          <form
            className="subscribe-modal"
            onSubmit={handleSubscribe}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Suscribirse</h3>

            <p>Ingresa tu correo para recibir noticias de ciberseguridad.</p>

            <input
              className="subscribe-input"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                resetFeedback();
              }}
              placeholder="correo@dominio.com"
              required
              disabled={isSubmitting}
            />

            {feedbackMessage && (
              <p
                style={{
                  marginTop: '10px',
                  marginBottom: '0',
                  color: feedbackType === 'success' ? '#16794c' : '#c62828',
                  fontWeight: 700,
                }}
              >
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
                {isSubmitting ? 'Enviando...' : 'Confirmar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default SubscribeBanner;