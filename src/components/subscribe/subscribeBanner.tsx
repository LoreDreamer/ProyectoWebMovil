import React, { useState } from 'react';
import './subscribeBanner.css';

export const SubscribeBanner: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Email suscrito:', email);
    setIsOpen(false);
    setEmail('');
  };

  return (
    <>
      <div className="subscribe-banner">
        <div className="subscribe-text">
          <h2>¡Subscríbete para revisar noticias!</h2>
          <p>Te enviaremos estas noticias todos los días a tu correo electrónico.</p>
        </div>

        <button
          className="subscribe-button"
          type="button"
          onClick={() => setIsOpen(true)}
        >
          Subscribirse
        </button>
      </div>

      {isOpen && (
        <div className="subscribe-modal-backdrop">
          <form className="subscribe-modal" onSubmit={handleSubscribe}>
            <h3>Subscribirse</h3>

            <p>Ingresa tu correo para recibir noticias de ciberseguridad.</p>

            <input
              className="subscribe-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@dominio.com"
              required
            />

            <div className="subscribe-modal-actions">
              <button
                type="button"
                className="subscribe-cancel-button"
                onClick={() => setIsOpen(false)}
              >
                Cancelar
              </button>

              <button type="submit" className="subscribe-confirm-button">
                Confirmar
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default SubscribeBanner;