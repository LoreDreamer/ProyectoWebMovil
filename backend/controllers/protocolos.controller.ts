import { Request, Response } from 'express';

// Definimos la estructura exacta de un Protocolo
interface Protocolo {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  categoria: string;
}

let protocolos: Protocolo[] = [
  {
    id: 1,
    titulo: "Protocolo de teletrabajo seguro",
    descripcion: "Lineamientos para el trabajo remoto seguro en sistemas municipales.",
    fecha: "12 mar 2026",
    categoria: "Teletrabajo"
  },
  {
    id: 2,
    titulo: "Protocolo de seguridad informática",
    descripcion: "Buenas prácticas para protección de credenciales y datos institucionales.",
    fecha: "01 abr 2026",
    categoria: "Ciberseguridad"
  },
  {
    id: 3,
    titulo: "Protocolo de atención ciudadana digital",
    descripcion: "Normas para la correcta gestión de solicitudes en plataformas online.",
    fecha: "15 feb 2026",
    categoria: "Atención ciudadana"
  }
];

// GET
export const getProtocolos = (req: Request, res: Response) => {
  return res.json(protocolos);
};

// POST
export const createProtocolo = (req: Request, res: Response) => {
  const { titulo, descripcion, categoria = "General" } = req.body;

  // Validamos campos mínimos obligatorios por seguridad
  if (!titulo || !descripcion) {
    return res.status(400).json({ error: "Título y descripción son obligatorios" });
  }

  const nuevo: Protocolo = {
    id: protocolos.length + 1,
    titulo,
    descripcion,
    categoria,
    fecha: new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }) 
    // Usamos 'es-CL' o un formato manual para mantener el estilo "dd mmm aaaa" que traías
  };

  protocolos.push(nuevo);

  return res.status(201).json(nuevo);
};