export function errorHandler(error, request, response, next) {
  console.error(error);

  response.status(error.status || 500).json({
    erro: error.status ? "Requisição inválida" : "Erro interno no servidor",
  });
}
