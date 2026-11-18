import { pool } from "../config/database.js";
import { pontoDaCidade } from "../utils/cidades.js";

const CATEGORIAS = ["A", "B", "C", "D", "E", "AB", "AC", "AD", "AE"];

const CAMPOS = `
  id_motoristas AS id, nome, cidade_base AS cidade, veiculo, entregas_hoje AS entregas,
  status, situacao, cpf, telefone, cnh, categoria_cnh AS categoria
`;

// Converte a linha do banco para o formato que a tela usa
function paraTela(linha) {
  const inativo = linha.situacao === "Inativo" || linha.status === "Indisponível";
  return {
    id: linha.id,
    nome: linha.nome,
    iniciais: linha.nome.split(/\s+/).map((parte) => parte[0]).join("").slice(0, 2).toUpperCase(),
    cidade: linha.cidade,
    veiculo: linha.veiculo,
    entregas: linha.entregas,
    status: inativo ? "Inativo" : linha.status,
    statusCadastro: inativo ? "Inativo" : "Ativo",
    cpf: linha.cpf ?? "",
    telefone: linha.telefone ?? "",
    cnh: linha.cnh ?? "",
    categoria: linha.categoria ?? "",
  };
}

function formatarCpf(digitos) {
  return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9)}`;
}

// Valida o corpo da requisição e devolve os valores prontos para gravar
function lerCorpo(corpo, { criando }) {
  const nome = String(corpo.nome ?? "").trim();
  if (!nome) return { erro: "Informe o nome do motorista." };

  const digitosCpf = String(corpo.cpf ?? "").replace(/\D/g, "");
  if (criando && digitosCpf.length !== 11) return { erro: "Informe um CPF válido (11 dígitos)." };
  if (digitosCpf && digitosCpf.length !== 11) return { erro: "Informe um CPF válido (11 dígitos)." };

  const cnh = String(corpo.cnh ?? "").replace(/\D/g, "");
  if (cnh.length > 11) return { erro: "A CNH deve ter no máximo 11 dígitos." };

  const categoria = String(corpo.categoria ?? "");
  if (categoria && !CATEGORIAS.includes(categoria)) return { erro: "Categoria da CNH inválida." };

  const entregas = Number(corpo.entregas ?? 0);
  if (!Number.isInteger(entregas) || entregas < 0) return { erro: "Entregas hoje deve ser um número inteiro." };

  // A tela manda "Ativo/Inativo" (cadastro) e "Em rota/Disponível/Inativo" (operacional)
  const inativo = corpo.status === "Inativo" || corpo.statusOperacional === "Inativo";
  const operacional = corpo.statusOperacional === "Em rota" ? "Em rota" : "Disponível";

  return {
    valores: {
      nome,
      cpf: digitosCpf ? formatarCpf(digitosCpf) : null,
      telefone: String(corpo.telefone ?? "").trim() || null,
      cnh: cnh || null,
      categoria: categoria || null,
      cidade: String(corpo.cidade ?? "").trim() || "--",
      veiculo: String(corpo.veiculo ?? "").trim() || "--",
      entregas,
      situacao: inativo ? "Inativo" : "Ativo",
      status: inativo ? "Indisponível" : operacional,
    },
  };
}

async function cpfJaExiste(cpf, ignorarId = 0) {
  if (!cpf) return false;
  const [linhas] = await pool.query(
    "SELECT id_motoristas FROM motoristas WHERE cpf = ? AND id_motoristas <> ?",
    [cpf, ignorarId],
  );
  return linhas.length > 0;
}

const MENSAGEM_CPF = "Já existe um motorista cadastrado com este CPF.";

async function buscarPorId(id) {
  const [linhas] = await pool.query(`SELECT ${CAMPOS} FROM motoristas WHERE id_motoristas = ?`, [id]);
  return linhas[0];
}

export async function listarMotoristas(request, response) {
  const [linhas] = await pool.query(`SELECT ${CAMPOS} FROM motoristas ORDER BY nome`);
  response.json(linhas.map(paraTela));
}

export async function criarMotorista(request, response) {
  const { erro, valores } = lerCorpo(request.body ?? {}, { criando: true });
  if (erro) return response.status(400).json({ erro });
  if (await cpfJaExiste(valores.cpf)) return response.status(409).json({ erro: MENSAGEM_CPF });

  try {
    const [resultado] = await pool.query(
      `INSERT INTO motoristas
         (nome, cpf, telefone, cnh, categoria_cnh, cidade_base, veiculo, entregas_hoje, situacao, status, localizacao_atual)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ST_GeomFromText(?))`,
      [
        valores.nome, valores.cpf, valores.telefone, valores.cnh, valores.categoria,
        valores.cidade, valores.veiculo, valores.entregas, valores.situacao, valores.status,
        pontoDaCidade(valores.cidade),
      ],
    );
    response.status(201).json(paraTela(await buscarPorId(resultado.insertId)));
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") return response.status(409).json({ erro: MENSAGEM_CPF });
    throw error;
  }
}

export async function atualizarMotorista(request, response) {
  const id = Number(request.params.id);
  const atual = Number.isInteger(id) ? await buscarPorId(id) : null;
  if (!atual) return response.status(404).json({ erro: "Motorista não encontrado." });

  const { erro, valores } = lerCorpo(request.body ?? {}, { criando: false });
  if (erro) return response.status(400).json({ erro });
  if (await cpfJaExiste(valores.cpf, id)) return response.status(409).json({ erro: MENSAGEM_CPF });

  // Se a cidade-base mudou, a posição inicial acompanha
  const mudouCidade = valores.cidade !== atual.cidade;

  try {
    await pool.query(
      `UPDATE motoristas SET
         nome = ?, cpf = ?, telefone = ?, cnh = ?, categoria_cnh = ?, cidade_base = ?,
         veiculo = ?, entregas_hoje = ?, situacao = ?, status = ?
         ${mudouCidade ? ", localizacao_atual = ST_GeomFromText(?)" : ""}
       WHERE id_motoristas = ?`,
      [
        valores.nome, valores.cpf, valores.telefone, valores.cnh, valores.categoria,
        valores.cidade, valores.veiculo, valores.entregas, valores.situacao, valores.status,
        ...(mudouCidade ? [pontoDaCidade(valores.cidade)] : []),
        id,
      ],
    );
    response.json(paraTela(await buscarPorId(id)));
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") return response.status(409).json({ erro: MENSAGEM_CPF });
    throw error;
  }
}

export async function excluirMotorista(request, response) {
  const id = Number(request.params.id);
  const [resultado] = await pool.query("DELETE FROM motoristas WHERE id_motoristas = ?", [id]);
  if (resultado.affectedRows === 0) return response.status(404).json({ erro: "Motorista não encontrado." });
  response.status(204).end();
}
