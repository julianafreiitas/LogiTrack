import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

// Formato salvo no banco: scrypt$<salt em hex>$<hash em hex>
export async function hashPassword(senha) {
  const salt = randomBytes(16).toString("hex");
  const derivada = await scrypt(senha, salt, 64);

  return `scrypt$${salt}$${derivada.toString("hex")}`;
}

export async function verifyPassword(senha, hashSalvo) {
  const [algoritmo, salt, hash] = String(hashSalvo).split("$");

  if (algoritmo !== "scrypt" || !salt || !hash) {
    return false;
  }

  const derivada = await scrypt(senha, salt, 64);
  const esperado = Buffer.from(hash, "hex");

  return esperado.length === derivada.length && timingSafeEqual(esperado, derivada);
}