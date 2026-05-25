const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt.config');

const usuariosTemporales = [
  { email: 'admin@inicio', password: '1234', role: 'admin' },
  { email: 'user@inicio', password: '1234', role: 'user' }
];

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
      token: token,
      role: usuarioEncontrado.role
    });
  }

  return res.status(401).json({
    message: "Correo o contraseña incorrectos."
  });
};

const me = (req, res) => {
  const user = usuariosTemporales.find(u => u.email === req.user.email);
  if (!user) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }

  res.json({
    email: user.email,
    role: user.role
  });
};

module.exports = {
  register,
  login,
  me
};