const SEGREDO_DESENVOLVIMENTO = "logitrack-dev-only-secret-configure-JWT_SECRET-for-production";

export function obterSegredoJwt() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET precisa estar configurado em producao.");
  }
  return SEGREDO_DESENVOLVIMENTO;
}
