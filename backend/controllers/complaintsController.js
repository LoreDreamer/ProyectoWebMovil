let listaDenuncias = [
  {
    id: 1,
    nombre: "Juan Pérez",
    correo: "juan@correo.com",
    tipoIncidente: "infraestructura",
    fechaIncidente: "2026-05-24",
    descripcion: "Luminaria apagada en la avenida principal.",
    archivoAdjunto: "Ninguno",
    rutaArchivo: null,
    fechaRegistro: "2026-05-25"
  }
];

const obtenerDenuncias = (req, res) => {
  try {
    res.status(200).json(listaDenuncias);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las denuncias" });
  }
};

const crearDenuncia = (req, res) => {
  try {
    // Al usar multer, los textos llegan en req.body
    const { nombre, correo, tipoIncidente, fechaIncidente, descripcion } = req.body;

    if (!nombre || !correo || !tipoIncidente || !fechaIncidente || !descripcion) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // 🌟 Estructura de guardado real y opcional
    const nuevaDenuncia = {
      id: listaDenuncias.length + 1,
      nombre,
      correo,
      tipoIncidente,
      fechaIncidente,
      descripcion,
      // Si el usuario subió un archivo, guardamos su nombre original y su ruta en el servidor
      archivoAdjunto: req.file ? req.file.originalname : "Ninguno",
      rutaArchivo: req.file ? `/uploads/${req.file.filename}` : null,
      fechaRegistro: new Date().toISOString().split('T')[0]
    };

    listaDenuncias.push(nuevaDenuncia);
    console.log("📥 ¡Denuncia con archivo físico guardada con éxito!:", nuevaDenuncia);

    res.status(201).json(nuevaDenuncia);
  } catch (error) {
    console.error("Error interno en el controlador:", error);
    res.status(500).json({ error: "Error interno al guardar la denuncia" });
  }
};

module.exports = {
  obtenerDenuncias,
  crearDenuncia
};