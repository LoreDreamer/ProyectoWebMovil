import { Request, Response } from 'express';

// Definimos la estructura exacta de una Denuncia
interface Denuncia {
  id: number;
  nombre: string;
  correo: string;
  tipoIncidente: string;
  fechaIncidente: string;
  descripcion: string;
  archivoAdjunto: string;
  rutaArchivo: string | null;
  fechaRegistro: string;
}

let listaDenuncias: Denuncia[] = [
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

export const obtenerDenuncias = (req: Request, res: Response) => {
  try {
    return res.status(200).json(listaDenuncias);
  } catch (error) {
    return res.status(500).json({ error: "Error al obtener las denuncias" });
  }
};

export const crearDenuncia = (req: Request, res: Response) => {
  try {
    // Al usar multer, los textos llegan en req.body
    const { nombre, correo, tipoIncidente, fechaIncidente, descripcion } = req.body;

    if (!nombre || !correo || !tipoIncidente || !fechaIncidente || !descripcion) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // Estructura de guardado real y opcional
    const nuevaDenuncia: Denuncia = {
      id: listaDenuncias.length + 1,
      nombre,
      correo,
      tipoIncidente,
      fechaIncidente,
      descripcion,
      // req.file viene tipado gracias a los tipos globales de multer en node
      archivoAdjunto: req.file ? req.file.originalname : "Ninguno",
      rutaArchivo: req.file ? `/uploads/${req.file.filename}` : null,
      fechaRegistro: new Date().toISOString().split('T')[0]
    };

    listaDenuncias.push(nuevaDenuncia);
    console.log("📥 ¡Denuncia con archivo físico guardada con éxito!:", nuevaDenuncia);

    return res.status(201).json(nuevaDenuncia);
  } catch (error) {
    console.error("Error interno en el controlador:", error);
    return res.status(500).json({ error: "Error interno al guardar la denuncia" });
  }
};