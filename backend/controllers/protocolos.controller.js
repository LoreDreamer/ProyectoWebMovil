let protocolos = [
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
const getProtocolos = (req, res) => {
  res.json(protocolos);
};

// POST
const createProtocolo = (req, res) => {
  const { titulo, descripcion, categoria = "General" } = req.body;

  const nuevo = {
    id: protocolos.length + 1,
    titulo,
    descripcion,
    categoria,
    fecha: new Date().toLocaleDateString()
  };

  protocolos.push(nuevo);

  res.status(201).json(nuevo);
};

module.exports = {
  getProtocolos,
  createProtocolo
};