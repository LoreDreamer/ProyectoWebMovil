import nodemailer from 'nodemailer';

let transporterPromise: Promise<nodemailer.Transporter> | null = null;

const getTransporter = async () => {
  if (transporterPromise) {
    return transporterPromise;
  }

  transporterPromise = (async () => {
    if (process.env.ETHEREAL_USER && process.env.ETHEREAL_PASS) {
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: process.env.ETHEREAL_USER,
          pass: process.env.ETHEREAL_PASS,
        },
      });
    }

    const testAccount = await nodemailer.createTestAccount();

    console.log('Ethereal test account created:');
    console.log('User:', testAccount.user);
    console.log('Pass:', testAccount.pass);
    console.log('Web:', testAccount.web);

    return nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  })();

  return transporterPromise;
};


const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

interface AlertEmailPayload {
  id: string;
  titulo?: string;
  title?: string;
  resumen?: string;
  summary?: string;
  cuerpo?: string;
  body?: string;
  fecha?: string | null;
  date?: string | null;
}

export const sendAlertEmail = async (
  to: string,
  alert: AlertEmailPayload
) => {
  const transporter = await getTransporter();

  const title = alert.titulo || alert.title || 'Nueva alerta de ciberseguridad';
  const summary = alert.resumen || alert.summary || '';
  const body = alert.cuerpo || alert.body || '';
  const date = alert.fecha || alert.date || new Date().toISOString();

  const safeTitle = escapeHtml(title);
  const safeSummary = escapeHtml(summary);
  const safeBody = escapeHtml(body);
  const safeDate = escapeHtml(date);

  const info = await transporter.sendMail({
    from:
      process.env.EMAIL_FROM ||
      '"Ciberseguridad Santo Domingo" <no-reply@santodomingo.test>',
    to,
    subject: `Nueva alerta: ${title}`,
    text: `
        Nueva alerta de ciberseguridad

        Título: ${title}
        Fecha: ${date}

        Resumen:
        ${summary}

        Detalle:
        ${body}
            `.trim(),
            html: `
              <h2>Nueva alerta de ciberseguridad</h2>
              <p><strong>Título:</strong> ${safeTitle}</p>
              <p><strong>Fecha:</strong> ${safeDate}</p>
              <p><strong>Resumen:</strong> ${safeSummary}</p>
              <p>${safeBody}</p>
            `,
    });

  const previewUrl = nodemailer.getTestMessageUrl(info);

  if (previewUrl) {
    console.log(`Preview email para ${to}: ${previewUrl}`);
  }

  return {
    messageId: info.messageId,
    previewUrl,
  };
};