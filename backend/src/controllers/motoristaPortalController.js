import pool from "../config/database.js";
import { iniciais, localidade, ruaNumero } from "../utils/endereco.js";

const STATUS_VALIDOS = ["Pendente", "A Caminho", "Entregue", "Cancelado"];
const TRANSICOES = { Pendente: ["A Caminho"], "A Caminho": ["Entregue"], Entregue: ["A Caminho"] };
const CAMPOS_ENTREGA = `e.id_entregas AS id, e.codigo AS codigo,
  COALESCE(e.nome_cliente, c.nome, 'Cliente') AS cliente, e.endereco_destino AS endereco,
  e.status, DATE_FORMAT(e.previsao, '%H:%i') AS previsaoHora,
  DATE_FORMAT(e.previsao, '%d/%m/%Y') AS previsaoData,
  DATE_FORMAT(e.atualizado_em, '%d/%m/%Y') AS dataEntrega,
  (e.status IN ('Pendente', 'A Caminho') AND e.previsao < NOW()) AS atrasada`;
const ORIGEM_ENTREGAS = "FROM entregas e LEFT JOIN cadastro c ON c.id_cadastro = e.id_cliente";

function paraTela(linha) {
  return { id: linha.id, codigo: linha.codigo, cliente: linha.cliente, endereco: linha.endereco,
    ruaNumero: ruaNumero(linha.endereco), localidade: localidade(linha.endereco), status: linha.status,
    previsaoHora: linha.previsaoHora, previsaoData: linha.previsaoData,
    dataEntrega: linha.dataEntrega, atrasada: Boolean(linha.atrasada) };
}

function inteiro(valor, padrao, minimo, maximo) {
  const numero = Number.parseInt(valor, 10);
  return Number.isFinite(numero) ? Math.min(maximo, Math.max(minimo, numero)) : padrao;
}

export async function exigirMotorista(request, response, next) {
  const id = Number(request.params.id);
  if (!Number.isInteger(id) || id < 1) return response.status(400).json({ message: "Id de motorista inválido." });
  const [[motorista]] = await pool.query(
    `SELECT id_motoristas AS id, nome, cidade_base AS cidade, veiculo, status,
      ST_Y(localizacao_atual) AS lat, ST_X(localizacao_atual) AS lng
     FROM motoristas WHERE id_motoristas = ?`, [id]);
  if (!motorista) return response.status(404).json({ message: "Motorista não encontrado." });
  request.motorista = motorista;
  next();
}

export async function listarMotoristasDoPortal(request, response) {
  const [linhas] = await pool.query("SELECT id_motoristas AS id, nome FROM motoristas WHERE situacao = 'Ativo' ORDER BY id_motoristas");
  response.json(linhas.map((linha) => ({ id: linha.id, nome: linha.nome, iniciais: iniciais(linha.nome) })));
}

export async function resumoDoMotorista(request, response) {
  const { motorista } = request;
  const [[c]] = await pool.query(`SELECT COUNT(*) AS total,
    COALESCE(SUM(status = 'Entregue'), 0) AS entregues,
    COALESCE(SUM(status = 'A Caminho'), 0) AS emAndamento,
    COALESCE(SUM(status = 'Pendente'), 0) AS pendentes,
    COALESCE(SUM(status = 'Entregue' AND DATE(atualizado_em) = CURDATE()), 0) AS concluidasHoje
    FROM entregas WHERE id_motorista = ? AND status <> 'Cancelado'`, [motorista.id]);
  const emAndamento = Number(c.emAndamento), pendentes = Number(c.pendentes), concluidas = Number(c.concluidasHoje);
  response.json({ motorista: { id: motorista.id, nome: motorista.nome, iniciais: iniciais(motorista.nome), cidade: motorista.cidade, veiculo: motorista.veiculo },
    total: Number(c.total), entregues: Number(c.entregues), emAndamento, pendentes,
    hoje: { total: emAndamento + pendentes + concluidas, concluidas, abertas: emAndamento + pendentes } });
}

export async function listarEntregasDoMotorista(request, response) {
  const { motorista } = request;
  const { status, busca, dias } = request.query;
  const limite = inteiro(request.query.limite, 5, 1, 50), pagina = inteiro(request.query.pagina, 1, 1, 100000);
  const condicoes = ["e.id_motorista = ?"], parametros = [motorista.id];
  if (STATUS_VALIDOS.includes(status)) { condicoes.push("e.status = ?"); parametros.push(status); }
  const termo = String(busca ?? "").trim();
  if (termo) { condicoes.push("(e.codigo LIKE ? OR COALESCE(e.nome_cliente, c.nome) LIKE ? OR e.endereco_destino LIKE ?)"); parametros.push(`%${termo}%`, `%${termo}%`, `%${termo}%`); }
  if (dias !== undefined) { condicoes.push("e.atualizado_em >= DATE_SUB(CURDATE(), INTERVAL ? DAY)"); parametros.push(inteiro(dias, 30, 1, 365) - 1); }
  const where = condicoes.join(" AND "), ordem = status === "Entregue" ? "e.atualizado_em DESC" : "e.previsao ASC";
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total ${ORIGEM_ENTREGAS} WHERE ${where}`, parametros);
  const [linhas] = await pool.query(`SELECT ${CAMPOS_ENTREGA} ${ORIGEM_ENTREGAS} WHERE ${where} ORDER BY ${ordem}, e.id_entregas DESC LIMIT ? OFFSET ?`, [...parametros, limite, (pagina - 1) * limite]);
  response.json({ itens: linhas.map(paraTela), total: Number(total), pagina, limite, totalPaginas: Math.max(1, Math.ceil(Number(total) / limite)) });
}

export async function mapaDoMotorista(request, response) {
  const { motorista } = request;
  const params = [motorista.id];
  const [linhas] = await pool.query(`SELECT ${CAMPOS_ENTREGA}, ST_Y(e.coordenadas_destino) AS lat, ST_X(e.coordenadas_destino) AS lng
    ${ORIGEM_ENTREGAS} WHERE e.id_motorista = ? AND e.status IN ('Pendente', 'A Caminho')
    ORDER BY e.previsao, e.id_entregas`, params);
  response.json({ origem: { nome: motorista.nome, lat: Number(motorista.lat), lng: Number(motorista.lng) },
    entregas: linhas.map((linha) => ({ ...paraTela(linha), lat: Number(linha.lat), lng: Number(linha.lng) })) });
}

export async function atualizarStatusDaEntrega(request, response) {
  const { motorista } = request, codigo = String(request.params.codigo ?? "").trim(), novoStatus = request.body?.status;
  if (!STATUS_VALIDOS.includes(novoStatus)) return response.status(400).json({ message: "Status inválido." });
  const conexao = await pool.getConnection();
  try {
    await conexao.beginTransaction();
    const [linhas] = await conexao.query("SELECT id_entregas AS id, status FROM entregas WHERE codigo = ? AND id_motorista = ? FOR UPDATE", [codigo, motorista.id]);
    const entrega = linhas[0];
    if (!entrega) { await conexao.rollback(); return response.status(404).json({ message: "Entrega não encontrada para este motorista." }); }
    if (!(TRANSICOES[entrega.status] ?? []).includes(novoStatus)) { await conexao.rollback(); return response.status(409).json({ message: `Não é possível mudar de \"${entrega.status}\" para \"${novoStatus}\".` }); }
    await conexao.query("UPDATE entregas SET status = ? WHERE id_entregas = ?", [novoStatus, entrega.id]);
    await conexao.query(`UPDATE motoristas SET
      status = CASE WHEN status = 'Indisponível' THEN status WHEN EXISTS (SELECT 1 FROM entregas WHERE id_motorista = ? AND status = 'A Caminho') THEN 'Em rota' ELSE 'Disponível' END,
      entregas_hoje = (SELECT COUNT(*) FROM entregas WHERE id_motorista = ? AND status <> 'Cancelado' AND (status IN ('Pendente', 'A Caminho') OR (status = 'Entregue' AND DATE(atualizado_em) = CURDATE())))
      WHERE id_motoristas = ?`, [motorista.id, motorista.id, motorista.id]);
    await conexao.commit();
    response.json({ codigo, status: novoStatus });
  } catch (error) { await conexao.rollback(); throw error; } finally { conexao.release(); }
}

function perfil(linha) {
  const inic = iniciais(linha.nome);
  return { id: linha.id_motoristas, nome: linha.nome, iniciais: inic, email: linha.email, telefone: linha.telefone,
    cpf: linha.cpf, dataNascimento: linha.data_nascimento, endereco: linha.endereco, contatoEmergencia: linha.contato_emergencia,
    matricula: linha.matricula, cidadeBase: linha.cidade_base, veiculo: linha.veiculo, cnh: linha.cnh,
    categoriaCnh: linha.categoria_cnh, validadeCnh: linha.validade_cnh, situacao: linha.situacao, status: linha.status };
}

const SELECT_PERFIL = `SELECT id_motoristas, nome, email, telefone, cpf, DATE_FORMAT(data_nascimento, '%Y-%m-%d') AS data_nascimento,
  endereco, contato_emergencia, matricula, cidade_base, veiculo, cnh, categoria_cnh,
  DATE_FORMAT(validade_cnh, '%Y-%m-%d') AS validade_cnh, situacao, status FROM motoristas WHERE id_motoristas = ?`;

export async function obterPerfilDoMotorista(request, response) {
  const [[linha]] = await pool.query(SELECT_PERFIL, [request.motorista.id]);
  response.json(perfil(linha));
}

export async function atualizarPerfilDoMotorista(request, response) {
  const b = request.body ?? {}, nome = String(b.nome ?? "").trim(), email = String(b.email ?? "").trim();
  const telefone = String(b.telefone ?? "").trim(), cpf = String(b.cpf ?? "").replace(/\D/g, "");
  const cnh = String(b.cnh ?? "").replace(/\D/g, ""), nascimento = String(b.dataNascimento ?? "").trim();
  const validade = String(b.validadeCnh ?? "").trim(), categoria = String(b.categoriaCnh ?? "").trim().toUpperCase();
  const endereco = String(b.endereco ?? "").trim(), emergencia = String(b.contatoEmergencia ?? "").trim();
  const dataValida = (v) => !v || (/^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`)) && new Date(`${v}T00:00:00Z`).toISOString().slice(0, 10) === v);
  if (!nome || nome.length > 100) return response.status(400).json({ message: "Informe um nome entre 1 e 100 caracteres." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 150) return response.status(400).json({ message: "Informe um e-mail válido de até 150 caracteres." });
  if (telefone.length > 40 || endereco.length > 255 || emergencia.length > 40) return response.status(400).json({ message: "Telefone, endereço ou contato de emergência excede o limite permitido." });
  if (cpf.length !== 11 || cnh.length !== 11) return response.status(400).json({ message: "CPF e CNH devem conter 11 dígitos." });
  if (!dataValida(nascimento) || (nascimento && nascimento > new Date().toISOString().slice(0, 10))) return response.status(400).json({ message: "Data de nascimento inválida." });
  if (!dataValida(validade)) return response.status(400).json({ message: "Validade da CNH inválida." });
  if (!['A', 'B', 'C', 'D', 'E', 'AB', 'AC', 'AD', 'AE'].includes(categoria)) return response.status(400).json({ message: "Categoria da CNH inválida." });
  try {
    await pool.query(`UPDATE motoristas SET nome = ?, email = ?, telefone = ?, cpf = ?, data_nascimento = ?, endereco = ?,
      contato_emergencia = ?, cnh = ?, categoria_cnh = ?, validade_cnh = ? WHERE id_motoristas = ?`,
    [nome, email, telefone || null, cpf, nascimento || null, endereco || null, emergencia || null, cnh, categoria, validade || null, request.motorista.id]);
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") return response.status(409).json({ message: "Já existe um motorista cadastrado com este CPF." });
    throw error;
  }
  const [[linha]] = await pool.query(SELECT_PERFIL, [request.motorista.id]);
  response.json(perfil(linha));
}
