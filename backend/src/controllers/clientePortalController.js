import pool from "../config/database.js";
import { cidadeDoEndereco, iniciais } from "../utils/endereco.js";

// Portal do cliente: o "cliente" é um registro da tabela cadastro.
// (Enquanto o login real não existe, o front manda o id escolhido no seletor.)

// status do banco -> texto e classe usados na tela (status-badge.<tipo>)
const SITUACOES = {
  "A Caminho": { texto: "Em trânsito", tipo: "transito" },
  Entregue: { texto: "Entregue", tipo: "entregue" },
  Pendente: { texto: "Pendente", tipo: "pendente" },
  Cancelado: { texto: "Cancelado", tipo: "cancelado" },
};

function situacao(status) {
  return SITUACOES[status] ?? SITUACOES.Pendente;
}

// Lista usada pelo seletor de identificação provisória (nunca devolve senha)
export async function listarClientes(request, response) {
  const [linhas] = await pool.query("SELECT id_cadastro AS id, nome FROM cadastro ORDER BY id_cadastro");
  response.json(linhas.map((linha) => ({ id: linha.id, nome: linha.nome, iniciais: iniciais(linha.nome) })));
}

export async function resumoDoCliente(request, response) {
  const id = Number(request.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return response.status(400).json({ message: "Id de cliente inválido." });
  }

  const [[cliente]] = await pool.query("SELECT id_cadastro AS id, nome FROM cadastro WHERE id_cadastro = ?", [id]);
  if (!cliente) {
    return response.status(404).json({ message: "Cliente não encontrado." });
  }

  const [[contagem]] = await pool.query(
    `SELECT
       COALESCE(SUM(status = 'A Caminho'), 0) AS emTransito,
       COALESCE(SUM(status = 'Entregue'), 0) AS entregues,
       COALESCE(SUM(status = 'Pendente'), 0) AS pendentes
     FROM entregas WHERE id_cliente = ?`,
    [id],
  );

  const [pedidos] = await pool.query(
    `SELECT codigo AS codigo, endereco_destino AS endereco, status
     FROM entregas WHERE id_cliente = ?
     ORDER BY checked_at DESC, id_entregas DESC
     LIMIT 3`,
    [id],
  );

  response.json({
    cliente: { id: cliente.id, nome: cliente.nome, iniciais: iniciais(cliente.nome) },
    emTransito: Number(contagem.emTransito),
    entregues: Number(contagem.entregues),
    pendentes: Number(contagem.pendentes),
    ultimosPedidos: pedidos.map((pedido) => ({
      codigo: pedido.codigo,
      cidade: cidadeDoEndereco(pedido.endereco),
      status: situacao(pedido.status).texto,
      tipo: situacao(pedido.status).tipo,
    })),
  });
}

// Consulta pelo código de rastreio (quem tem o código pode consultar, como em qualquer rastreio)
export async function consultarRastreio(request, response) {
  const codigo = String(request.params.codigo ?? "").trim();
  if (!codigo) {
    return response.status(400).json({ message: "Informe o código de rastreio." });
  }

  const [[entrega]] = await pool.query(
    "SELECT codigo AS codigo, endereco_destino AS endereco, status FROM entregas WHERE codigo = ?",
    [codigo],
  );

  if (!entrega) {
    return response.status(404).json({ message: "Código de rastreio não encontrado." });
  }

  response.json({
    codigo: entrega.codigo,
    cidade: cidadeDoEndereco(entrega.endereco),
    status: situacao(entrega.status).texto,
    tipo: situacao(entrega.status).tipo,
  });
}
