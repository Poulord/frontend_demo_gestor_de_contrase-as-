const crypto = require("crypto");

const DEFAULT_LENGTH = 16;
const PASSWORD_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=<>?";

function normalizeLength(length = DEFAULT_LENGTH) {
  const parsed = Number.parseInt(length, 10);
  if (Number.isNaN(parsed)) {
    return DEFAULT_LENGTH;
  }

  return Math.min(Math.max(parsed, 12), 64);
}

function generarContrasenaSegura(length = DEFAULT_LENGTH) {
  const finalLength = normalizeLength(length);
  const randomBytes = crypto.randomBytes(finalLength);

  return Array.from(randomBytes, (byte) => PASSWORD_CHARS[byte % PASSWORD_CHARS.length]).join("");
}

function cifrarContrasena(contrasena) {
  return crypto.createHash("sha256").update(String(contrasena)).digest("hex");
}

function generarYCifrarContrasena(length = DEFAULT_LENGTH) {
  const contrasena = generarContrasenaSegura(length);
  const hash = cifrarContrasena(contrasena);
  return { contrasena, hash };
}

module.exports = {
  cifrarContrasena,
  generarContrasenaSegura,
  generarYCifrarContrasena,
};
