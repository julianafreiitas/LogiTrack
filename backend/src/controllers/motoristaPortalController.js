import pool from "../config/database.js";
import { iniciais, localidade, ruaNumero } from "../utils/endereco.js";

// Portal do motorista: tudo aqui é filtrado pelo id do motorista da URL.
// (Enquanto o login real não existe, o front manda o id escolhido no seletor.)

const STATUS_VALIDOS = ["Pendente", "Em Rota", "Saiu para Entrega", "A Caminho", "Entregue", "Cancelado"];

// Mudanças de status que o motorista pode fazer. "Entregue → A Caminho" desfaz uma confirmação.
const TRANSICOES = {
  Pendente: ["Em Rota"],
  "Em Rota": ["Saiu para Entrega"],
  "Saiu para Entrega": ["Entregue"],
};

const CAMPOS_ENTREGA = `
  e.id_entregas AS id,
  e.codigo_rastreio AS codigo,
  COALESCE(e.nome_cliente, c.nome, 'Cliente') AS cliente,
  e.endereco_destino AS endereco,
  e.endereco_coleta AS coleta,
  e.tipo_servico AS servico,
  e.tamanho_pacote AS tamanho,
  e.peso_kg AS pesoKg,
  e.valor_frete AS valorFrete,
  e.forma_pagamento AS pagamento,
  e.urgencia,
  e.observacoes,
  (e.status = 'Cancelado' AND e.status_antes_cancelamento IN ('Em Rota', 'Saiu para Entrega', 'A Caminho')) AS precisaDevolucao,
  e.status,
  DATE_FORMAT(e.previsao, '%H:%i') AS previsaoHora,
  DATE_FORMAT(e.previsao, '%d/%m/%Y') AS previsaoData,
  DATE_FORMAT(e.atualizado_em, '%d/%m/%Y') AS dataEntrega,
  (e.status IN ('Pendente', 'Em Rota', 'Saiu para Entrega', 'A Caminho') AND e.previsao < NOW()) AS atrasada
`;

const ORIGEM_ENTREGAS = "FROM entregas e LEFT JOIN cadastro c ON c.id = e.id_cliente";

function paraTela(linha) {
  return {
    id: linha.id,
    codigo: linha.codigo,
    cliente: linha.cliente,
    endereco: linha.endereco,
    coleta: linha.coleta,
    servico: linha.servico,
    tamanho: linha.tamanho,
    pesoKg: linha.pesoKg,
    valorFrete: linha.valorFrete,
    pagamento: linha.pagamento,
    urgencia: linha.urgencia,
    observacoes: linha.observacoes,
    precisaDevolucao: Boolean(linha.precisaDevolucao),
    ruaNumero: ruaNumero(linha.endereco),
    localidade: localidade(linha.endereco),
    status: linha.status,
    previsaoHora: linha.previsaoHora,
    previsaoData: linha.previsaoData,
    dataEntrega: linha.dataEntrega,
    atrasada: Boolean(linha.atrasada),
  };
}

function inteiro(valor, padrao, minimo, maximo) {
  const numero = Number.parseInt(valor, 10);
  if (!Number.isFinite(numero)) return padrao;
  return Math.min(maximo, Math.max(minimo, numero));
}

// Confere o id da URL e carrega o motorista em request.motorista
export async function exigirMotorista(request, response, next) {
  const id = Number(request.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return response.status(400).json({ message: "Id de motorista inválido." });
  }

  // POINT é gravado como (x = longitude, y = latitude)
  const [[motorista]] = await pool.query(
    `SELECT id_motoristas AS id, nome, cidade_base AS cidade, veiculo, status,
            ST_Y(localizacao_atual) AS lat, ST_X(localizacao_atual) AS lng
     FROM motoristas WHERE id_motoristas = ?`,
    [id],
  );

  if (!motorista) {
    return response.status(404).json({ message: "Motorista não encontrado." });
  }

  request.motorista = motorista;
  next();
}

// Lista usada pelo seletor de identificação provisória
export async function listarMotoristasDoPortal(request, response) {
  const [linhas] = await pool.query(
    `SELECT id_motoristas AS id, nome FROM motoristas WHERE situacao = 'Ativo' ORDER BY id_motoristas`,
  );
  response.json(linhas.map((linha) => ({ id: linha.id, nome: linha.nome, iniciais: iniciais(linha.nome) })));
}

export async function resumoDoMotorista(request, response) {
  const { motorista } = request;

  // "Hoje" = tudo que ainda está aberto + o que foi concluído hoje
  const [[contagem]] = await pool.query(
    `SELECT
       COALESCE(SUM(status <> 'Cancelado'), 0) AS total,
       COALESCE(SUM(status = 'Entregue'), 0) AS entregues,
       COALESCE(SUM(status IN ('Em Rota', 'Saiu para Entrega', 'A Caminho')), 0) AS emAndamento,
       COALESCE(SUM(status = 'Pendente'), 0) AS pendentes,
       COALESCE(SUM(status = 'Cancelado'), 0) AS canceladas,
       COALESCE(SUM(status = 'Entregue' AND DATE(atualizado_em) = CURDATE()), 0) AS concluidasHoje
     FROM entregas
     WHERE id_motorista = ?`,
    [motorista.id],
  );

  const emAndamento = Number(contagem.emAndamento);
  const pendentes = Number(contagem.pendentes);
  const concluidasHoje = Number(contagem.concluidasHoje);

  response.json({
    motorista: {
      id: motorista.id,
      nome: motorista.nome,
      iniciais: iniciais(motorista.nome),
      cidade: motorista.cidade,
      veiculo: motorista.veiculo,
    },
    total: Number(contagem.total),
    entregues: Number(contagem.entregues),
    emAndamento,
    pendentes,
    canceladas: Number(contagem.canceladas),
    hoje: {
      total: emAndamento + pendentes + concluidasHoje,
      concluidas: concluidasHoje,
      // ainda não concluídas (pendentes + em andamento)
      abertas: emAndamento + pendentes,
    },
  });
}

// GET ?status=&busca=&dias=&pagina=&limite=
export async function listarEntregasDoMotorista(request, response) {
  const { motorista } = request;
  const { status, busca, dias } = request.query;
  const limite = inteiro(request.query.limite, 5, 1, 50);
  const pagina = inteiro(request.query.pagina, 1, 1, 100000);

  const condicoes = ["e.id_motorista = ?"];
  const parametros = [motorista.id];

  if (status === "Em Andamento") {
    condicoes.push("e.status IN ('Em Rota', 'Saiu para Entrega', 'A Caminho')");
  } else if (STATUS_VALIDOS.includes(status)) {
    condicoes.push("e.status = ?");
    parametros.push(status);
  }

  const termo = String(busca ?? "").trim();
  if (termo) {
    condicoes.push("(e.codigo_rastreio LIKE ? OR COALESCE(e.nome_cliente, c.nome) LIKE ? OR e.endereco_destino LIKE ?)");
    parametros.push(`%${termo}%`, `%${termo}%`, `%${termo}%`);
  }

  // dias=1 é "hoje"; dias=30 são hoje e os 29 anteriores (mesma regra do dashboard do admin)
  if (dias !== undefined) {
    condicoes.push("e.atualizado_em >= DATE_SUB(CURDATE(), INTERVAL ? DAY)");
    parametros.push(inteiro(dias, 30, 1, 365) - 1);
  }

  const where = condicoes.join(" AND ");
  const ordem = status === "Entregue" ? "e.atualizado_em DESC" : "e.previsao ASC";

  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total ${ORIGEM_ENTREGAS} WHERE ${where}`, parametros);

  const [linhas] = await pool.query(
    `SELECT ${CAMPOS_ENTREGA} ${ORIGEM_ENTREGAS} WHERE ${where} ORDER BY ${ordem}, e.id_entregas DESC LIMIT ? OFFSET ?`,
    [...parametros, limite, (pagina - 1) * limite],
  );

  response.json({
    itens: linhas.map(paraTela),
    total: Number(total),
    pagina,
    limite,
    totalPaginas: Math.max(1, Math.ceil(Number(total) / limite)),
  });
}

// Dados do mapa: posição do motorista + entregas abertas e as concluídas hoje
export async function mapaDoMotorista(request, response) {
  const { motorista } = request;

  const codigo = String(request.query.codigo ?? "").trim();
  const condicoes = [
    "e.id_motorista = ?",
    "(e.status IN ('Pendente', 'Em Rota', 'Saiu para Entrega', 'A Caminho') OR (e.status = 'Entregue' AND DATE(e.atualizado_em) = CURDATE()))",
  ];
  const parametros = [motorista.id];
  if (codigo) {
    condicoes.push("e.codigo_rastreio = ?");
    parametros.push(codigo);
  }

  const [linhas] = await pool.query(
    `SELECT ${CAMPOS_ENTREGA},
            ST_Y(e.coordenadas_destino) AS lat, ST_X(e.coordenadas_destino) AS lng
     ${ORIGEM_ENTREGAS}
     WHERE ${condicoes.join(" AND ")}
     ORDER BY e.previsao ASC, e.id_entregas`,
    parametros,
  );

  response.json({
    origem: { nome: motorista.nome, lat: Number(motorista.lat), lng: Number(motorista.lng) },
    entregas: linhas.map((linha) => ({
      ...paraTela(linha),
      lat: Number(linha.lat),
      lng: Number(linha.lng),
    })),
  });
}

// PATCH { status }  — usado por "Iniciar entrega", "Confirmar entrega" e "Cancelar entrega" (desfazer)
export async function atualizarStatusDaEntrega(request, response) {
  const { motorista } = request;
  const codigo = String(request.params.codigo ?? "").trim();
  const novoStatus = request.body?.status;

  if (!STATUS_VALIDOS.includes(novoStatus)) {
    return response.status(400).json({ message: "Status inválido." });
  }

  const [[entrega]] = await pool.query(
    "SELECT id_entregas AS id, status FROM entregas WHERE codigo_rastreio = ? AND id_motorista = ?",
    [codigo, motorista.id],
  );

  if (!entrega) {
    return response.status(404).json({ message: "Entrega não encontrada para este motorista." });
  }

  if (!(TRANSICOES[entrega.status] ?? []).includes(novoStatus)) {
    return response.status(409).json({ message: `Não é possível mudar de "${entrega.status}" para "${novoStatus}".` });
  }

  await pool.query("UPDATE entregas SET status = ? WHERE id_entregas = ?", [novoStatus, entrega.id]);
  if (["Em Rota", "Saiu para Entrega"].includes(novoStatus)) {
    await pool.query("UPDATE motoristas SET status = 'Em rota' WHERE id_motoristas = ? AND situacao = 'Ativo' AND status <> 'Indisponível'", [motorista.id]);
  } else if (novoStatus === "Entregue") {
    await pool.query(`UPDATE motoristas SET status = CASE
      WHEN status = 'Indisponível' THEN status
      WHEN EXISTS (SELECT 1 FROM entregas WHERE id_motorista = ? AND status IN ('Pendente', 'Em Rota', 'Saiu para Entrega')) THEN 'Em rota'
      ELSE 'Disponível' END WHERE id_motoristas = ?`, [motorista.id, motorista.id]);
  }
  response.json({ codigo, status: novoStatus });
}
