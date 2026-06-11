import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../../config/supabase';
import { JWT_SECRET } from '../../config/jwt.config';
import { getPaginationOptions, createPaginationMeta } from '../../shared/utils/pagination';

const USERS_TABLE = process.env.SUPABASE_USERS_TABLE || 'usuario';
const USER_PUBLIC_SELECT = 'id, rut, nombre_completo, region, comuna, correo, estatus, creado_en, tipo_usuario';
const USER_AUTH_SELECT = `${USER_PUBLIC_SELECT}, password`;
const QUESTIONNAIRES_TABLE =
  process.env.SUPABASE_QUESTIONNAIRES_TABLE || 'cuestionario';
const CUESTIONARIO_USUARIO_TABLE = 'cuestionario_usuario';

type UserRole = 'admin' | 'user';
type UserStatus = 'activo' | 'inactivo';

interface RiskInfo {
  cuestionariosRespondidos: number;
  totalCuestionarios: number;
  riesgo: 'ALTO' | 'MEDIO' | 'BAJO';
  colorRiesgo: string;
}

const normalizeRole = (role?: string | null): UserRole => {
  const normalizedRole = String(role || '').toLowerCase().trim();

  if (normalizedRole === 'admin') {
    return 'admin';
  }

  return 'user';
};

const normalizeStatus = (estatus?: string | null): UserStatus => {
  const normalizedStatus = String(estatus || '')
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (normalizedStatus === 'inactivo' || normalizedStatus === 'inactive') {
    return 'inactivo';
  }

  return 'activo';
};

const normalizeUser = (user: any, riskInfo?: Partial<RiskInfo>) => {
  if (!user) return null;

  const role = normalizeRole(user.tipo_usuario || user.role);
  const estatus = normalizeStatus(user.estatus || user.estado || 'activo');
  const riesgo = riskInfo?.riesgo || 'ALTO';
  const colorRiesgo = riskInfo?.colorRiesgo || '#ef4444';
  const cuestionariosRespondidos = riskInfo?.cuestionariosRespondidos || 0;
  const totalCuestionarios = riskInfo?.totalCuestionarios || 0;

  return {
    id: user.id,
    rut: user.rut || '',
    nombre_completo: user.nombre_completo || '',
    name: user.nombre_completo || '',
    region: user.region || '',
    comuna: user.comuna || '',
    email: user.correo || user.email || '',
    correo: user.correo || user.email || '',
    estatus,
    estado: estatus,
    role,
    tipo_usuario: role,
    creado_en: user.creado_en || null,
    cuestionariosRespondidos,
    cuestionarios_respondidos: cuestionariosRespondidos,
    totalCuestionarios,
    total_cuestionarios: totalCuestionarios,
    riesgo,
    colorRiesgo,
    color_riesgo: colorRiesgo
  };
};

const getRiskByProgress = (answered: number, total: number): RiskInfo => {
  const safeAnswered = Math.max(0, Number(answered) || 0);
  const safeTotal = Math.max(0, Number(total) || 0);

  const highRisk: RiskInfo = {
    cuestionariosRespondidos: safeAnswered,
    totalCuestionarios: safeTotal,
    riesgo: 'ALTO',
    colorRiesgo: '#ef4444'
  };

  if (safeTotal <= 0) {
    return highRisk;
  }

  const mediumThreshold = Math.ceil(safeTotal / 3);
  const lowThreshold = Math.ceil((safeTotal * 2) / 3);

  if (safeAnswered >= lowThreshold) {
    return {
      cuestionariosRespondidos: safeAnswered,
      totalCuestionarios: safeTotal,
      riesgo: 'BAJO',
      colorRiesgo: '#16a34a'
    };
  }

  if (safeAnswered >= mediumThreshold) {
    return {
      cuestionariosRespondidos: safeAnswered,
      totalCuestionarios: safeTotal,
      riesgo: 'MEDIO',
      colorRiesgo: '#f59e0b'
    };
  }

  return highRisk;
};

const getQuestionnaireRiskByUser = async () => {
  const [questionnairesResult, progressResult] = await Promise.all([
    supabase.from(QUESTIONNAIRES_TABLE).select('id'),
    supabase
      .from(CUESTIONARIO_USUARIO_TABLE)
      .select('usuario_id, cuestionario_id, estatus')
  ]);

  if (questionnairesResult.error) {
    console.error(
      'Error obteniendo total de cuestionarios:',
      questionnairesResult.error
    );
  }

  if (progressResult.error) {
    console.error(
      'Error obteniendo progreso de cuestionarios:',
      progressResult.error
    );
  }

  const totalCuestionarios = questionnairesResult.error
    ? 0
    : questionnairesResult.data?.length || 0;

  const answeredByUser = new Map<string, Set<string>>();

  if (!progressResult.error) {
    (progressResult.data || []).forEach((item: any) => {
      const usuarioId = String(item.usuario_id || '').trim();
      const cuestionarioId = String(item.cuestionario_id || '').trim();
      const estatus = String(item.estatus || '').toLowerCase().trim();

      if (!usuarioId || !cuestionarioId) return;

      const isAnswered =
        !estatus ||
        estatus === 'completado' ||
        estatus === 'respondido' ||
        estatus === 'completed';

      if (!isAnswered) return;

      if (!answeredByUser.has(usuarioId)) {
        answeredByUser.set(usuarioId, new Set<string>());
      }

      answeredByUser.get(usuarioId)?.add(cuestionarioId);
    });
  }

  return {
    totalCuestionarios,
    getRiskForUser: (userId: string) => {
      const answered = answeredByUser.get(String(userId))?.size || 0;
      return getRiskByProgress(answered, totalCuestionarios);
    }
  };
};

export const getUsuarioById = async (id: string) => {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .select(USER_PUBLIC_SELECT)
    .eq('id', id)
    .single();

  if (error || !data) return null;

  return normalizeUser(data);
};

export const getUsuarioByEmail = async (email: string) => {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .select(USER_PUBLIC_SELECT)
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
      .select(USER_PUBLIC_SELECT)
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
      .select(USER_AUTH_SELECT)
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

export const getUsers = async (req: Request, res: Response) => {
  try {
    const pagination = getPaginationOptions(req, 10, 50);

    let query = pagination.enabled
      ? supabase.from(USERS_TABLE).select(USER_PUBLIC_SELECT, { count: 'exact' })
      : supabase.from(USERS_TABLE).select(USER_PUBLIC_SELECT);

    query = query.order('creado_en', { ascending: false });

    if (pagination.enabled) {
      query = query.range(pagination.from, pagination.to);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error getUsers:', error);

      return res.status(500).json({
        ok: false,
        message: 'Error al obtener usuarios.',
        error: error.message
      });
    }

    const riskByUser = await getQuestionnaireRiskByUser();
    const users = (data || [])
      .map((user) => normalizeUser(user, riskByUser.getRiskForUser(user.id)))
      .filter(Boolean);

    return res.json({
      ok: true,
      totalCuestionarios: riskByUser.totalCuestionarios,
      users,
      ...(pagination.enabled
        ? { pagination: createPaginationMeta(pagination, count ?? users.length) }
        : {})
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

export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = String(req.params.id || '').trim();

    if (!userId) {
      return res.status(400).json({
        ok: false,
        message: 'ID de usuario no proporcionado.'
      });
    }

    const {
      nombre_completo,
      name,
      correo,
      email,
      region,
      comuna,
      estatus,
      estado,
      tipo_usuario,
      role
    } = req.body || {};

    const finalNombre = String(nombre_completo || name || '').trim();
    const finalCorreo = String(correo || email || '').trim().toLowerCase();
    const finalRegion = String(region || '').trim();
    const finalComuna = String(comuna || '').trim();
    const finalStatus = normalizeStatus(estatus || estado || 'activo');
    const finalRole = normalizeRole(tipo_usuario || role || 'user');

    if (!finalNombre || !finalCorreo || !finalRegion || !finalComuna) {
      return res.status(400).json({
        ok: false,
        message:
          'Nombre, correo, región y comuna son obligatorios para editar el usuario.'
      });
    }

    const { data: existingUser, error: existingError } = await supabase
      .from(USERS_TABLE)
      .select('id, correo')
      .eq('id', userId)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (!existingUser) {
      return res.status(404).json({
        ok: false,
        message: 'Usuario no encontrado.'
      });
    }

    if (String(existingUser.correo || '').toLowerCase() !== finalCorreo) {
      const { data: duplicatedEmail, error: duplicatedError } = await supabase
        .from(USERS_TABLE)
        .select('id, correo')
        .eq('correo', finalCorreo)
        .neq('id', userId)
        .maybeSingle();

      if (duplicatedError) {
        throw duplicatedError;
      }

      if (duplicatedEmail) {
        return res.status(409).json({
          ok: false,
          message: 'Ya existe otro usuario registrado con ese correo.'
        });
      }
    }

    const payload = {
      nombre_completo: finalNombre,
      correo: finalCorreo,
      region: finalRegion,
      comuna: finalComuna,
      estatus: finalStatus,
      tipo_usuario: finalRole
    };

    const { data, error } = await supabase
      .from(USERS_TABLE)
      .update(payload)
      .eq('id', userId)
      .select(USER_PUBLIC_SELECT)
      .single();

    if (error) {
      throw error;
    }

    const riskByUser = await getQuestionnaireRiskByUser();

    return res.json({
      ok: true,
      message: 'Usuario actualizado correctamente.',
      user: normalizeUser(data, riskByUser.getRiskForUser(userId))
    });
  } catch (error: any) {
    console.error('Error updateUser:', error);

    return res.status(500).json({
      ok: false,
      message: 'Error interno al actualizar usuario.',
      error: error.message || 'Error desconocido'
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    const userId = String(req.params.id || '').trim();

    if (!userId) {
      return res.status(400).json({
        ok: false,
        message: 'ID de usuario no proporcionado.'
      });
    }

    if (authUser?.id && String(authUser.id) === userId) {
      return res.status(400).json({
        ok: false,
        message: 'No puedes eliminar tu propia cuenta desde el panel.'
      });
    }

    const { data: existingUser, error: existingError } = await supabase
      .from(USERS_TABLE)
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (!existingUser) {
      return res.status(404).json({
        ok: false,
        message: 'Usuario no encontrado.'
      });
    }

    const { error: progressError } = await supabase
      .from(CUESTIONARIO_USUARIO_TABLE)
      .delete()
      .eq('usuario_id', userId);

    if (progressError) {
      console.error(
        'No se pudo eliminar progreso asociado al usuario:',
        progressError
      );
    }

    const { error } = await supabase
      .from(USERS_TABLE)
      .delete()
      .eq('id', userId);

    if (error) {
      throw error;
    }

    return res.json({
      ok: true,
      message: 'Usuario eliminado correctamente.',
      deletedId: userId
    });
  } catch (error: any) {
    console.error('Error deleteUser:', error);

    return res.status(500).json({
      ok: false,
      message: 'Error interno al eliminar usuario.',
      error: error.message || 'Error desconocido'
    });
  }
};
