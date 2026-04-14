const fs = require("fs");
const path = require("path");

const { cifrarContrasena } = require("./sha");

const dataDir = path.resolve(__dirname, "../../data");
const usuariosPath = path.join(dataDir, "usuarios.json");

function ensureStorage() {
  fs.mkdirSync(dataDir, { recursive: true });

  if (!fs.existsSync(usuariosPath)) {
    fs.writeFileSync(usuariosPath, JSON.stringify({ usuarios: [] }, null, 2), "utf8");
  }
}

function readUsuarios() {
  ensureStorage();
  return JSON.parse(fs.readFileSync(usuariosPath, "utf8"));
}

function writeUsuarios(content) {
  fs.writeFileSync(usuariosPath, JSON.stringify(content, null, 2), "utf8");
}

function registerUser(usuario, contrasenaMaestra) {
  const normalizedUser = String(usuario || "").trim();
  const masterPassword = String(contrasenaMaestra || "");

  if (!normalizedUser || !masterPassword) {
    throw new Error("El usuario y la contrasena maestra son obligatorios.");
  }

  const data = readUsuarios();
  const existingUser = data.usuarios.find((item) => item.usuario === normalizedUser);

  if (existingUser) {
    throw new Error("El usuario ya existe.");
  }

  const newUser = {
    usuario: normalizedUser,
    contrasenaMaestra: cifrarContrasena(masterPassword),
  };

  data.usuarios.push(newUser);
  writeUsuarios(data);
  return newUser;
}

function loginUser(usuario, contrasenaMaestra) {
  const normalizedUser = String(usuario || "").trim();
  const masterPassword = String(contrasenaMaestra || "");
  const data = readUsuarios();
  const user = data.usuarios.find((item) => item.usuario === normalizedUser);

  if (!user) {
    throw new Error("El usuario no existe.");
  }

  if (user.contrasenaMaestra !== cifrarContrasena(masterPassword)) {
    throw new Error("La contrasena maestra es incorrecta.");
  }

  return { usuario: user.usuario };
}

module.exports = {
  loginUser,
  registerUser,
  usuariosPath,
};
