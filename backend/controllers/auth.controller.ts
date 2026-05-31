import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase';
import { JWT_SECRET } from '../config/jwt.config';

const USERS_TABLE = process.env.SUPABASE_USERS_TABLE || 'usuario';

type UserRole = 'admin' | 'user';

const normalizeRole = (role?: string | null): UserRole => {
  const normalizedRole = String(role || '').toLowerCase().trim();

  if (normalizedRole === 'admin') {
    return 'admin';
  }

  return 'user';
};

const normalizeStatus = (estatus?: string | null) => {
  return String(estatus || '').toLowerCase().trim();
};

const normalizeUser = (user: any) => {
  if (!user) return null;

  const role = normalizeRole(user.tipo_usuario || user.role);
  const estatus = normalizeStatus(user.estatus || user.estado || 'activo');

  return {
    id: user.id,
    rut: user.rut || '',
    nombre_completo: user.nombre_completo || '',
    name: user.nombre_completo || '',
    region: user.region || '',
    comuna: user.comuna || '',
    email: user.correo || '',
    estatus,
    estado: estatus,
    role,
    creado_en: user.creado_en || null
  };
};

export const getUsuarioById = async (id: string) => {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;

  return normalizeUser(data);
};

export const getUsuarioByEmail = async (email: string) => {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .select('*')
    .eq('correo', email)
    .single();

  if (error || !data) return null;

  return normalizeUser(data);
};

export const register = async (req: Request, res: Response) => {
  try {
    const {
      rut,
      nombre_completo,
      name,
      usuario,
      region,
      comuna,
      correo,
      email,
      password
    } = req.body;

    const finalCorreo = String(correo || email || '').trim().toLowerCase();
    const finalNombre = String(nombre_completo || name || usuario || '').trim();
    const finalRut = String(rut || '').trim();
    const finalRegion = String(region || '').trim();
    const finalComuna = String(comuna || '').trim();

    if (
      !finalCorreo ||
      !password ||
      !finalNombre ||
      !finalRut ||
      !finalRegion ||
      !finalComuna
    ) {
      return res.status(400).json({
        ok: false,
        message: 'Faltan datos obligatorios para registrar usuario.'
      });
    }

    const { data: existingEmail, error: emailError } = await supabase
      .from(USERS_TABLE)
      .select('id, correo')
      .eq('correo', finalCorreo)
      .maybeSingle();

    if (emailError) {
      console.error('Error verificando correo:', emailError);

      return res.status(500).json({
        ok: false,
        message: 'Error al verificar el correo.',
        error: emailError.message
      });
    }

    if (existingEmail) {
      return res.status(409).json({
        ok: false,
        message: 'Ya existe un usuario registrado con ese correo.'
      });
    }

    const { data: existingRut, error: rutError } = await supabase
      .from(USERS_TABLE)
      .select('id, rut')
      .eq('rut', finalRut)
      .maybeSingle();

    if (rutError) {
      console.error('Error verificando RUT:', rutError);

      return res.status(500).json({
        ok: false,
        message: 'Error al verificar el RUT.',
        error: rutError.message
      });
    }

    if (existingRut) {
      return res.status(409).json({
        ok: false,
        message: 'Ya existe un usuario registrado con ese RUT.'
      });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);

    const payload = {
      rut: finalRut,
      nombre_completo: finalNombre,
      region: finalRegion,
      comuna: finalComuna,
      correo: finalCorreo,
      password: hashedPassword,
      estatus: 'activo',
      tipo_usuario: 'user',
      creado_en: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from(USERS_TABLE)
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      console.error('Error Supabase register:', error);

      return res.status(500).json({
        ok: false,
        message: 'Error al registrar usuario.',
        error: error.message,
        details: error.details,
        hint: error.hint
      });
    }

    const normalizedUser = normalizeUser(data);

    if (!normalizedUser) {
      return res.status(500).json({
        ok: false,
        message: 'No se pudo procesar la información del usuario.'
      });
    }

    const token = jwt.sign(
      {
        id: normalizedUser.id,
        email: normalizedUser.email,
        role: normalizedUser.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      ok: true,
      message: 'Usuario registrado correctamente.',
      token,
      user: normalizedUser
    });
  } catch (error: any) {
    console.error('Error register:', error);

    return res.status(500).json({
      ok: false,
      message: 'Error al registrar usuario.',
      error: error.message || 'Error desconocido'
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { correo, email, password } = req.body;

    const finalCorreo = String(correo || email || '').trim().toLowerCase();

    if (!finalCorreo || !password) {
      return res.status(400).json({
        ok: false,
        message: 'Correo y contraseña son obligatorios.'
      });
    }

    const { data, error } = await supabase
      .from(USERS_TABLE)
      .select('*')
      .eq('correo', finalCorreo)
      .single();

    if (error || !data) {
      return res.status(401).json({
        ok: false,
        message: 'Credenciales incorrectas.'
      });
    }

    const userStatus = normalizeStatus(data.estatus);

    if (userStatus !== 'activo') {
      return res.status(403).json({
        ok: false,
        message: 'Usuario inactivo.'
      });
    }

    let passwordOk = false;
    const storedPassword = String(data.password || '');

    if (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$')) {
      passwordOk = await bcrypt.compare(String(password), storedPassword);
    } else {
      passwordOk = storedPassword === String(password);
    }

    if (!passwordOk) {
      return res.status(401).json({
        ok: false,
        message: 'Credenciales incorrectas.'
      });
    }

    const normalizedUser = normalizeUser(data);

    if (!normalizedUser) {
      return res.status(500).json({
        ok: false,
        message: 'No se pudo procesar la información del usuario.'
      });
    }

    const token = jwt.sign(
      {
        id: normalizedUser.id,
        email: normalizedUser.email,
        role: normalizedUser.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      ok: true,
      message: 'Login correcto.',
      token,
      user: normalizedUser
    });
  } catch (error: any) {
    console.error('Error login:', error);

    return res.status(500).json({
      ok: false,
      message: 'Error interno al iniciar sesión.',
      error: error.message || 'Error desconocido'
    });
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;

    if (!authUser?.id) {
      return res.status(401).json({
        ok: false,
        message: 'No autorizado.'
      });
    }

    const user = await getUsuarioById(authUser.id);

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: 'Usuario no encontrado.'
      });
    }

    return res.json({
      ok: true,
      user
    });
  } catch (error: any) {
    console.error('Error me:', error);

    return res.status(500).json({
      ok: false,
      message: 'Error al obtener usuario actual.',
      error: error.message || 'Error desconocido'
    });
  }
};

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from(USERS_TABLE)
      .select(
        'id, rut, nombre_completo, region, comuna, correo, estatus, creado_en, tipo_usuario'
      )
      .order('creado_en', { ascending: false });

    if (error) {
      console.error('Error getUsers:', error);

      return res.status(500).json({
        ok: false,
        message: 'Error al obtener usuarios.',
        error: error.message
      });
    }

    return res.json({
      ok: true,
      users: (data || []).map(normalizeUser).filter(Boolean)
    });
  } catch (error: any) {
    console.error('Error getUsers:', error);

    return res.status(500).json({
      ok: false,
      message: 'Error interno al obtener usuarios.',
      error: error.message || 'Error desconocido'
    });
  }
};