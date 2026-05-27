import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.config';

export type UserRole = 'admin' | 'user';

export interface Usuario {
  id: string;
  email: string;
  password?: string;
  role: UserRole;
  nombre_completo: string;
  rut: string;
  region: string;
  comuna: string;
  estado: 'ACTIVO' | 'INACTIVO';
  created_at: string;
}

export const usuariosTemporales: Usuario[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    email: 'admin@inicio',
    password: '1234',
    role: 'admin',
    nombre_completo: 'Camila Rojas Fernández',
    rut: '18.456.789-2',
    region: 'Región de Valparaíso',
    comuna: 'Santo Domingo',
    estado: 'ACTIVO',
    created_at: '2026-03-12T09:30:00.000Z'
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    email: 'user@inicio',
    password: '1234',
    role: 'user',
    nombre_completo: 'Martín Herrera Soto',
    rut: '20.345.678-5',
    region: 'Región Metropolitana',
    comuna: 'Puente Alto',
    estado: 'ACTIVO',
    created_at: '2026-04-02T11:20:00.000Z'
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    email: 'isidora.munoz@santodomingo.cl',
    password: '1234',
    role: 'admin',
    nombre_completo: 'Isidora Muñoz Tapia',
    rut: '17.987.654-1',
    region: 'Región de Valparaíso',
    comuna: 'San Antonio',
    estado: 'ACTIVO',
    created_at: '2026-02-18T15:45:00.000Z'
  },
  {
    id: '44444444-4444-4444-8444-444444444444',
    email: 'benjamin.valdes@santodomingo.cl',
    password: '1234',
    role: 'user',
    nombre_completo: 'Benjamín Valdés Araya',
    rut: '21.234.567-8',
    region: 'Región de O’Higgins',
    comuna: 'Rancagua',
    estado: 'INACTIVO',
    created_at: '2026-01-21T10:10:00.000Z'
  },
  {
    id: '55555555-5555-4555-8555-555555555555',
    email: 'fernanda.silva@santodomingo.cl',
    password: '1234',
    role: 'user',
    nombre_completo: 'Fernanda Silva Morales',
    rut: '19.876.543-4',
    region: 'Región del Biobío',
    comuna: 'Concepción',
    estado: 'ACTIVO',
    created_at: '2026-05-03T08:15:00.000Z'
  }
];

const generarIdTemporal = () => {
  return `${Date.now()}-${Math.round(Math.random() * 1000000)}`;
};

export const getUsuarioById = (id?: string) => {
  if (!id) return undefined;
  return usuariosTemporales.find((usuario) => usuario.id === id);
};

export const getUsuarioByEmail = (email?: string) => {
  if (!email) return undefined;
  return usuariosTemporales.find((usuario) => usuario.email === email);
};

const publicUserResponse = (usuario: Usuario) => ({
  id: usuario.id,
  email: usuario.email,
  role: usuario.role,
  nombre_completo: usuario.nombre_completo,
  rut: usuario.rut,
  region: usuario.region,
  comuna: usuario.comuna,
  estado: usuario.estado,
  created_at: usuario.created_at
});

export const register = (req: Request, res: Response) => {
  const {
    email,
    password,
    nombre_completo,
    nombreCompleto,
    usuario,
    name,
    rut,
    region,
    comuna
  } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: 'Correo y contraseña son obligatorios.'
    });
  }

  const existe = usuariosTemporales.find((u) => u.email === email);

  if (existe) {
    return res.status(400).json({
      message: 'El correo ya está registrado.'
    });
  }

  const nombreFinal =
    nombre_completo ||
    nombreCompleto ||
    usuario ||
    name ||
    'Usuario Registrado';

  const nuevoUsuario: Usuario = {
    id: generarIdTemporal(),
    email,
    password,
    role: 'user',
    nombre_completo: nombreFinal,
    rut: rut || '12.345.678-9',
    region: region || 'Región de Valparaíso',
    comuna: comuna || 'Santo Domingo',
    estado: 'ACTIVO',
    created_at: new Date().toISOString()
  };

  usuariosTemporales.push(nuevoUsuario);

  console.log(`Usuario registrado temporalmente: ${email}`);

  return res.status(201).json({
    message: 'Usuario registrado con éxito.',
    user: publicUserResponse(nuevoUsuario)
  });
};

export const login = (req: Request, res: Response) => {
  const { email, password } = req.body;

  const usuarioEncontrado = usuariosTemporales.find(
    (u) => u.email === email && u.password === password
  );

  if (!usuarioEncontrado) {
    return res.status(401).json({
      message: 'Correo o contraseña incorrectos.'
    });
  }

  const token = jwt.sign(
    {
      id: usuarioEncontrado.id,
      email: usuarioEncontrado.email,
      role: usuarioEncontrado.role
    },
    JWT_SECRET,
    { expiresIn: '2h' }
  );

  return res.json({
    message: 'Inicio de sesión exitoso.',
    token,
    user: publicUserResponse(usuarioEncontrado)
  });
};

export const me = (req: Request, res: Response) => {
  const tokenUser = (req as any).user;

  const usuarioEncontrado =
    getUsuarioById(tokenUser?.id) ||
    getUsuarioByEmail(tokenUser?.email);

  if (!usuarioEncontrado) {
    return res.status(404).json({
      message: 'Usuario no encontrado.'
    });
  }

  return res.json(publicUserResponse(usuarioEncontrado));
};

export const getUsers = (req: Request, res: Response) => {
  return res.json(usuariosTemporales.map(publicUserResponse));
};