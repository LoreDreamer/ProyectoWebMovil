import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
// Asegúrate de cambiar también tu config a .ts después, o impórtalo directo si ya exporta por default
import { JWT_SECRET } from '../config/jwt.config';

// Definimos la estructura de un usuario para que TypeScript sepa qué tiene
interface Usuario {
  email: string;
  password?: string; // Opcional por si en algún método no lo necesitas, pero obligatorio en el arreglo
  role: string;
}

const usuariosTemporales: Usuario[] = [
  { email: 'admin@inicio', password: '1234', role: 'admin' },
  { email: 'user@inicio', password: '1234', role: 'user' }
];

export const register = (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Todos los campos son obligatorios." });
  }

  const existe = usuariosTemporales.find(u => u.email === email);
  if (existe) {
    return res.status(400).json({ message: "El correo ya está registrado." });
  }

  const nuevoUsuario: Usuario = { email, password, role: 'user' };
  usuariosTemporales.push(nuevoUsuario);

  console.log(`¡Usuario registrado temporalmente!: ${email}`);

  return res.status(201).json({
    message: "¡Usuario registrado con éxito en la memoria temporal!"
  });
};

export const login = (req: Request, res: Response) => {
  const { email, password } = req.body;

  const usuarioEncontrado = usuariosTemporales.find(
    u => u.email === email && u.password === password
  );

  if (usuarioEncontrado) {
    const token = jwt.sign(
      { email: usuarioEncontrado.email, role: usuarioEncontrado.role },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    return res.json({
      message: "¡Inicio de sesión exitoso!",
      token: token,
      role: usuarioEncontrado.role
    });
  }

  return res.status(401).json({
    message: "Correo o contraseña incorrectos."
  });
};

export const me = (req: Request, res: Response) => {
  // Usamos (req as any) de forma temporal para que no chille por la propiedad .user que añade el middleware de autenticación
  const user = usuariosTemporales.find(u => u.email === (req as any).user?.email);
  if (!user) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }

  return res.json({
    email: user.email,
    role: user.role
  });
};