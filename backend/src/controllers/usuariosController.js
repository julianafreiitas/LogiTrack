import { pool } from "../config/database.js";
import { hashPassword } from "../utils/password.js";

const POR_PAGINA_PADRAO = 5;
const POR_PAGINA_MAXIMO = 50;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Última entrega de cada cliente (a mais recente pela data da solicitação).
const ULTIMA_ENTREGA_ID = `(
  SELECT e2.id_entregas
  FROM entregas e2
  WHERE e2.id_cliente = c.id
  ORDER BY e2.checked_at DESC, e2.id_entregas DESC
  LIMIT 1
)`;

function lerPaginacao(query) {
  const pagina = Math.max(1, Number.parseInt(query.pagina, 10) || 1);
  const porPaginaInformado = Number.parseInt(query.porPagina, 10) || POR_PAGINA_PADRAO;
  const porPagina = Math.min(Math.max(1, porPaginaInformado), POR_PAGINA_MAXIMO);

  return { pagina, porPagina, offset: (pagina - 1) * porPagina };
}

function lerBusca(query) {
  return typeof query.busca === "string" ? query.busca.trim().slice(0, 100) : "";
}

// Escapa %, _ e \ para a busca ser literal dentro do LIKE.
function escaparLike(valor) {
  return valor.replace(/[\\%_]/g, "\\$&");
}

function montarResposta(dados, total, { pagina, porPagina }) {
  return {
    dados,
    total,
    pagina,
    porPagina,
    totalPaginas: Math.max(1, Math.ceil(total / porPagina)),
  };
}

function traduzirStatusEntrega(statusEntrega) {
  if (!statusEntrega) return "Sem solicitação";
  if (statusEntrega === "Entregue") return "Concluída";
  if (statusEntrega === "Cancelado") return "Cancelada";
  return "Em andamento";
}

export async function obterResumo(request, response, next) {
  try {
    const [[resumo]] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM cadastro) AS totalClientes,
        (SELECT COUNT(*) FROM usuarios) AS totalFuncionarios,
        (SELECT COUNT(*) FROM usuarios WHERE tipo = 'admin') AS totalAdministradores
    `);

    response.json({
      totalUsuarios: Number(resumo.totalClientes) + Number(resumo.totalFuncionarios),
      totalClientes: Number(resumo.totalClientes),
      totalAdministradores: Number(resumo.totalAdministradores),
    });
  } catch (error) {
    next(error);
  }
}

export async function listarClientes(request, response, next) {
  try {
    const paginacao = lerPaginacao(request.query);
    const busca = lerBusca(request.query);

    const condicoes = [];
    const parametros = [];

    if (busca) {
      const padrao = `%${escaparLike(busca)}%`;
      const digitos = busca.replace(/\D/g, "");

      condicoes.push("c.nome LIKE ?", "c.email LIKE ?");
      parametros.push(padrao, padrao);

      if (digitos.length >= 3) {
        condicoes.push("c.cpf LIKE ?");
        parametros.push(`%${digitos}%`);
      }
    }

    const where = condicoes.length ? `WHERE ${condicoes.join(" OR ")}` : "";

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM cadastro c ${where}`,
      parametros
    );

    const [linhas] = await pool.query(
      `
      SELECT
        c.id AS id,
        c.nome,
        c.email,
        DATE_FORMAT(e.checked_at, '%d/%m/%Y') AS ultimaSolicitacao,
        e.status AS statusEntrega
      FROM cadastro c
      LEFT JOIN entregas e ON e.id_entregas = ${ULTIMA_ENTREGA_ID}
      ${where}
      ORDER BY (e.checked_at IS NULL), e.checked_at DESC, c.nome ASC
      LIMIT ? OFFSET ?
      `,
      [...parametros, paginacao.porPagina, paginacao.offset]
    );

    const dados = linhas.map((linha) => ({
      id: linha.id,
      nome: linha.nome,
      email: linha.email,
      ultimaSolicitacao: linha.ultimaSolicitacao,
      status: traduzirStatusEntrega(linha.statusEntrega),
    }));

    response.json(montarResposta(dados, Number(total), paginacao));
  } catch (error) {
    next(error);
  }
}

export async function obterSolicitacaoCliente(request, response, next) {
  try {
    const idCliente = Number.parseInt(request.params.id, 10);

    if (!Number.isInteger(idCliente) || idCliente <= 0) {
      return response.status(400).json({ message: "Identificador de cliente inválido." });
    }

    const [linhas] = await pool.query(
      `
      SELECT
        c.id AS id,
        c.nome,
        c.email,
        c.telefone,
        e.codigo_rastreio AS codigo,
        e.endereco_coleta AS origem,
        e.endereco_destino AS destino,
        e.tipo_servico AS servico,
        e.observacoes,
        e.status AS statusEntrega,
        DATE_FORMAT(e.checked_at, '%d/%m/%Y') AS solicitacao,
        m.nome AS motorista,
        m.veiculo,
        m.status AS motoristaStatus
      FROM cadastro c
      LEFT JOIN entregas e ON e.id_entregas = ${ULTIMA_ENTREGA_ID}
      LEFT JOIN motoristas m ON m.id_motoristas = e.id_motorista
      WHERE c.id = ?
      LIMIT 1
      `,
      [idCliente]
    );

    if (linhas.length === 0) {
      return response.status(404).json({ message: "Cliente não encontrado." });
    }

    const linha = linhas[0];
    const status = traduzirStatusEntrega(linha.statusEntrega);

    let detalhe = "Este cliente ainda não possui solicitações de entrega.";

    if (linha.codigo) {
      detalhe =
        linha.observacoes ||
        `Solicitação ${linha.codigo} criada em ${linha.solicitacao}. Situação atual: ${status}.`;
    }

    response.json({
      id: linha.id,
      nome: linha.nome,
      email: linha.email,
      telefone: linha.telefone,
      status,
      codigo: linha.codigo,
      origem: linha.origem,
      destino: linha.destino,
      servico: linha.servico,
      solicitacao: linha.solicitacao,
      motorista: linha.motorista,
      veiculo: linha.veiculo,
      motoristaStatus: linha.motoristaStatus,
      detalhe,
    });
  } catch (error) {
    next(error);
  }
}

export async function listarAdministradores(request, response, next) {
  try {
    const paginacao = lerPaginacao(request.query);
    const busca = lerBusca(request.query);

    const parametros = [];
    let filtroBusca = "";

    if (busca) {
      const padrao = `%${escaparLike(busca)}%`;

      filtroBusca = "AND (nome LIKE ? OR email LIKE ?)";
      parametros.push(padrao, padrao);
    }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM usuarios WHERE tipo = 'admin' ${filtroBusca}`,
      parametros
    );

    const [linhas] = await pool.query(
      `
      SELECT
        id_usuarios AS id,
        nome,
        email,
        DATE_FORMAT(COALESCE(ultimo_acesso, criado_em), '%d/%m/%Y') AS ultimoAcesso
      FROM usuarios
      WHERE tipo = 'admin' ${filtroBusca}
      ORDER BY COALESCE(ultimo_acesso, criado_em) DESC, nome ASC
      LIMIT ? OFFSET ?
      `,
      [...parametros, paginacao.porPagina, paginacao.offset]
    );

    response.json(montarResposta(linhas, Number(total), paginacao));
  } catch (error) {
    next(error);
  }
}

export async function criarAdministrador(request, response, next) {
  try {
    const nome = String(request.body?.nome ?? "").trim();
    const email = String(request.body?.email ?? "").trim().toLowerCase();
    const senha = String(request.body?.senha ?? "");
    const telefone = String(request.body?.telefone ?? "").trim() || null;

    if (!nome || nome.length > 100) {
      return response.status(400).json({ message: "Informe o nome do administrador (até 100 caracteres)." });
    }

    if (!EMAIL_REGEX.test(email) || email.length > 150) {
      return response.status(400).json({ message: "Informe um e-mail válido." });
    }

    if (senha.length < 8 || senha.length > 128) {
      return response.status(400).json({ message: "A senha deve ter entre 8 e 128 caracteres." });
    }

    if (telefone && telefone.length > 40) {
      return response.status(400).json({ message: "Telefone inválido." });
    }

    const [existentes] = await pool.query("SELECT id_usuarios FROM usuarios WHERE email = ? LIMIT 1", [email]);

    if (existentes.length > 0) {
      return response.status(409).json({ message: "Já existe um administrador cadastrado com este e-mail." });
    }

    const senhaHash = await hashPassword(senha);

    const [resultado] = await pool.query(
      "INSERT INTO usuarios (nome, email, senha, telefone, tipo) VALUES (?, ?, ?, ?, 'admin')",
      [nome, email, senhaHash, telefone]
    );

    const [[criado]] = await pool.query(
      `
      SELECT
        id_usuarios AS id,
        nome,
        email,
        DATE_FORMAT(COALESCE(ultimo_acesso, criado_em), '%d/%m/%Y') AS ultimoAcesso
      FROM usuarios
      WHERE id_usuarios = ?
      `,
      [resultado.insertId]
    );

    response.status(201).json(criado);
  } catch (error) {
    // Dois cadastros simultâneos com o mesmo e-mail passam pela checagem acima; a chave UNIQUE barra o segundo.
    if (error.code === "ER_DUP_ENTRY") {
      return response.status(409).json({ message: "Já existe um administrador cadastrado com este e-mail." });
    }

    next(error);
  }
}