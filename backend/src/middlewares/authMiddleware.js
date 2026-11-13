import jwt from "jsonwebtoken";

// Protege rotas: exige o header "Authorization: Bearer <token>"
export function autenticar(request, response, next) {
  const cabecalho = request.headers.authorization || "";
  const [tipo, token] = cabecalho.split(" ");

  if (tipo !== "Bearer" || !token) {
    return response.status(401).json({ erro: "Token não informado." });
  }

  try {
    request.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    response.status(401).json({ erro: "Token inválido ou expirado." });
  }
}
