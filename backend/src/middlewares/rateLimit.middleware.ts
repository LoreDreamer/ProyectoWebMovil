import rateLimit from 'express-rate-limit';

const defaultMessage = 'Demasiadas solicitudes. Intenta nuevamente en unos minutos.';

export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 450,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    message: defaultMessage
  }
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    message: 'Demasiados intentos de autenticación. Intenta nuevamente en 15 minutos.'
  }
});

export const formRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    message: 'Demasiados envíos de formularios. Intenta nuevamente en unos minutos.'
  }
});

export const subscriptionRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    message: 'Demasiadas solicitudes de suscripción. Intenta nuevamente en unos minutos.'
  }
});
