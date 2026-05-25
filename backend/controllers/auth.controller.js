const jwt = require('jsonwebtoken');

const JWT_SECRET = 'mi_llave_secreta_municipal_super_segura';

// Base de datos temporal en memoria
const usuariosTemporales = [
  { email: 'admin@inicio', password: '1234', role: 'admin' },
  { email: 'user@inicio', password: '1234', role: 'user' }
];

// 1. Lógica de Registro
const register = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Todos los campos son obligatorios." });
  }

  const existe = usuariosTemporales.find(u => u.email === email);
  if (existe) {
    return res.status(400).json({ message: "El correo ya está registrado." });
  }

  const nuevoUsuario = { email, password, role: 'user' };
  usuariosTemporales.push(nuevoUsuario);

  console.log(`¡Usuario registrado temporalmente!: ${email}`);
  
  return res.status(201).json({ 
    message: "¡Usuario registrado con éxito en la memoria temporal!" 
  });
};

// 2. Lógica de Login
const login = (req, res) => {
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
      token: token
    });
  }

  return res.status(401).json({ 
    message: "Correo o contraseña incorrectos." 
  });
};

// Exportamos las funciones del controlador
module.exports = {
  register,
  login
};