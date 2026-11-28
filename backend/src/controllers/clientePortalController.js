import { randomBytes, scryptSync } from "node:crypto";
import pool from "../config/database.js";
import { cidadeDoEndereco, iniciais } from "../utils/endereco.js";

const SITUACOES = {
  "Em Rota": { texto: "Em rota", tipo: "transito" },
  "Saiu para Entrega": { texto: "Saiu para entrega", tipo: "transito" },
  "A Caminho": { texto: "Em trânsito", tipo: "transito" },
  Entregue: { texto: "Entregue", tipo: "entregue" },
  Pendente: { texto: "Pendente", tipo: "pendente" },
  Cancelado: { texto: "Cancelado", tipo: "cancelado" },
};
const situacao = (status) => SITUACOES[status] ?? SITUACOES.Pendente;
const validarId = (valor) => Number.isInteger(Number(valor)) && Number(valor) > 0;

export async function listarClientes(request, response) {
  const [linhas] = await pool.query("SELECT id, nome FROM cadastro ORDER BY id");
  response.json(linhas.map((linha) => ({ id: linha.id, nome: linha.nome, iniciais: iniciais(linha.nome) })));
}

export async function criarPerfil(request, response) {
  const dados = request.body ?? {};
  const nome = String(dados.nome ?? "").trim();
  const email = String(dados.email ?? "").trim();
  const telefone = String(dados.telefone ?? "").trim();
  const nascimento = String(dados.nascimento ?? "").trim() || null;
  if (!nome || nome.length > 100 || !/^\S+@\S+\.\S+$/.test(email) || email.length > 100 || !telefone || telefone.length > 40) {
    return response.status(400).json({ message: "Informe nome, e-mail válido e telefone." });
  }
  if (nascimento && !/^\d{4}-\d{2}-\d{2}$/.test(nascimento)) {
    return response.status(400).json({ message: "Informe uma data de nascimento válida." });
  }

  const opcional = (chave, limite) => String(dados[chave] ?? "").trim().slice(0, limite) || null;
  const salt = randomBytes(16);
  const senhaTemporaria = randomBytes(32);
  const senhaHash = `scrypt$${salt.toString("hex")}$${scryptSync(senhaTemporaria, salt, 64).toString("hex")}`;
  try {
    const [resultado] = await pool.execute(`INSERT INTO cadastro
      (nome, email, senha, telefone, cpf, nascimento, cep, rua, numero, bairro, cidade, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [nome, email, senhaHash, telefone, opcional("cpf", 20), nascimento, opcional("cep", 12), opcional("rua", 150), opcional("numero", 20), opcional("bairro", 100), opcional("cidade", 100), opcional("estado", 50)]);
    const perfil = { ...dados, id: resultado.insertId, nome, email, telefone, nascimento };
    response.status(201).json({ message: "Perfil criado e salvo.", id: resultado.insertId, perfil });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") return response.status(409).json({ message: "Este e-mail ou CPF já está cadastrado." });
    throw error;
  }
}

export async function resumoDoCliente(request, response) {
  const id = Number(request.params.id);
  if (!validarId(id)) return response.status(400).json({ message: "Id de cliente inválido." });
  const [[cliente]] = await pool.query("SELECT id, nome FROM cadastro WHERE id = ?", [id]);
  if (!cliente) return response.status(404).json({ message: "Cliente não encontrado." });
  const [[contagem]] = await pool.query(`SELECT
    COALESCE(SUM(status IN ('Em Rota', 'Saiu para Entrega', 'A Caminho')), 0) AS emTransito,
    COALESCE(SUM(status = 'Entregue'), 0) AS entregues,
    COALESCE(SUM(status = 'Pendente'), 0) AS pendentes,
    COALESCE(SUM(status = 'Cancelado'), 0) AS canceladas
    FROM entregas WHERE id_cliente = ?`, [id]);
  const [pedidos] = await pool.query(`SELECT codigo_rastreio AS codigo, endereco_destino AS endereco, status
    FROM entregas WHERE id_cliente = ? ORDER BY checked_at DESC, id_entregas DESC LIMIT 3`, [id]);
  response.json({
    cliente: { id: cliente.id, nome: cliente.nome, iniciais: iniciais(cliente.nome) },
    emTransito: Number(contagem.emTransito), entregues: Number(contagem.entregues),
    pendentes: Number(contagem.pendentes), canceladas: Number(contagem.canceladas),
    ultimosPedidos: pedidos.map((pedido) => ({ codigo: pedido.codigo, cidade: cidadeDoEndereco(pedido.endereco), status: situacao(pedido.status).texto, tipo: situacao(pedido.status).tipo })),
  });
}

const COLUNAS_PEDIDO = `e.codigo_rastreio AS codigo, e.id_cliente AS clientId,
  COALESCE(e.nome_cliente, c.nome) AS cliente, e.endereco_coleta AS coleta,
  e.endereco_destino AS destino, e.data_coleta AS dataColeta, e.tipo_servico AS servico,
  e.tamanho_pacote AS tamanho, e.peso_kg AS pesoKg, e.urgencia, e.observacoes,
  e.valor_frete AS valorFrete, e.distancia_km AS distanciaKm, e.forma_pagamento AS pagamento,
  (e.id_motorista IS NOT NULL) AS motoristaAtribuido,
  e.status, DATE_FORMAT(e.checked_at, '%Y-%m-%dT%H:%i:%s') AS solicitadoEm,
  DATE_FORMAT(e.previsao, '%Y-%m-%dT%H:%i:%s') AS previsao,
  DATE_FORMAT(e.atualizado_em, '%Y-%m-%dT%H:%i:%s') AS atualizadoEm`;

export async function consultarRastreio(request, response) {
  const codigo = String(request.params.codigo ?? "").trim();
  if (!codigo) return response.status(400).json({ message: "Informe o código de rastreio." });
  const [[entrega]] = await pool.query(`SELECT ${COLUNAS_PEDIDO} FROM entregas e
    LEFT JOIN cadastro c ON c.id = e.id_cliente WHERE e.codigo_rastreio = ?`, [codigo]);
  if (!entrega) return response.status(404).json({ message: "Código de rastreio não encontrado." });
  response.json({ ...entrega, cidade: cidadeDoEndereco(entrega.destino), ...situacao(entrega.status) });
}

export async function listarPedidos(request, response) {
  const id = Number(request.params.id);
  if (!validarId(id)) return response.status(400).json({ message: "Id de cliente inválido." });
  const [pedidos] = await pool.query(`SELECT ${COLUNAS_PEDIDO} FROM entregas e
    LEFT JOIN cadastro c ON c.id = e.id_cliente WHERE e.id_cliente = ?
    ORDER BY e.checked_at DESC, e.id_entregas DESC`, [id]);
  response.json(pedidos.map((pedido) => ({ ...pedido, ...situacao(pedido.status) })));
}

export async function cancelarPedido(request, response) {
  const codigo = String(request.params.codigo ?? "").trim();
  const [resultado] = await pool.query(`UPDATE entregas SET status_antes_cancelamento = status, status = 'Cancelado'
    WHERE codigo_rastreio = ? AND status IN ('Pendente', 'Em Rota', 'Saiu para Entrega', 'A Caminho')`, [codigo]);
  if (!resultado.affectedRows) {
    const [[pedido]] = await pool.query("SELECT status FROM entregas WHERE codigo_rastreio = ?", [codigo]);
    if (!pedido) return response.status(404).json({ message: "Pedido não encontrado." });
    if (pedido.status === "Cancelado") return response.json({ codigo, status: "Cancelado", taxaAplicavel: false });
    return response.status(409).json({ message: "Este pedido não pode mais ser cancelado." });
  }
  const [[pedido]] = await pool.query("SELECT status_antes_cancelamento, id_motorista FROM entregas WHERE codigo_rastreio = ?", [codigo]);
  if (pedido.id_motorista) {
    await pool.query(`UPDATE motoristas SET
      status = CASE WHEN status = 'Indisponível' THEN status
        WHEN EXISTS (SELECT 1 FROM entregas WHERE id_motorista = ? AND status IN ('Em Rota', 'Saiu para Entrega', 'A Caminho')) THEN 'Em rota'
        ELSE 'DisponÃ­vel' END,
      entregas_hoje = (SELECT COUNT(*) FROM entregas WHERE id_motorista = ? AND status <> 'Cancelado'
        AND (status IN ('Pendente', 'Em Rota', 'Saiu para Entrega', 'A Caminho') OR (status = 'Entregue' AND DATE(atualizado_em) = CURDATE())))
      WHERE id_motoristas = ?`, [pedido.id_motorista, pedido.id_motorista, pedido.id_motorista]);
  }
  response.json({ codigo, status: "Cancelado", precisaDevolucao: ["Em Rota", "Saiu para Entrega", "A Caminho"].includes(pedido.status_antes_cancelamento) });
}

export async function obterPerfil(request, response) {
  const id = Number(request.params.id);
  if (!validarId(id)) return response.status(400).json({ message: "Id de cliente inválido." });
  const [[perfil]] = await pool.query(`SELECT id, nome, email, telefone, cpf,
    DATE_FORMAT(nascimento, '%Y-%m-%d') AS nascimento, cep, rua, numero, bairro, cidade, estado
    FROM cadastro WHERE id = ?`, [id]);
  if (!perfil) return response.status(404).json({ message: "Cliente não encontrado." });
  response.json(perfil);
}

export async function salvarPerfil(request, response) {
  const id = Number(request.params.id);
  if (!validarId(id)) return response.status(400).json({ message: "Id de cliente inválido." });
  const dados = request.body ?? {};
  const nome = String(dados.nome ?? "").trim();
  const email = String(dados.email ?? "").trim();
  const telefone = String(dados.telefone ?? "").trim();
  if (!nome || nome.length > 100 || !/^\S+@\S+\.\S+$/.test(email) || email.length > 100 || !telefone || telefone.length > 40) {
    return response.status(400).json({ message: "Informe nome, e-mail válido e telefone." });
  }
  const opcional = (chave, limite) => String(dados[chave] ?? "").trim().slice(0, limite) || null;
  try {
    const [resultado] = await pool.execute(`UPDATE cadastro SET nome = ?, email = ?, telefone = ?, cpf = ?,
      nascimento = ?, cep = ?, rua = ?, numero = ?, bairro = ?, cidade = ?, estado = ? WHERE id = ?`,
    [nome, email, telefone, opcional("cpf", 20), dados.nascimento || null, opcional("cep", 12), opcional("rua", 150), opcional("numero", 20), opcional("bairro", 100), opcional("cidade", 100), opcional("estado", 50), id]);
    if (!resultado.affectedRows) {
      const [[cliente]] = await pool.query("SELECT id FROM cadastro WHERE id = ?", [id]);
      if (!cliente) return response.status(404).json({ message: "Cliente não encontrado." });
    }
    response.json({ message: "Perfil salvo.", perfil: { ...dados, nome, email, telefone } });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") return response.status(409).json({ message: "Este e-mail já está sendo usado por outro cliente." });
    throw error;
  }
}
