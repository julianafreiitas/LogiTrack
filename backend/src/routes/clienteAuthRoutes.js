import { createHash } from "node:crypto";
import { Router } from "express";
import jwt from "jsonwebtoken";
import pool from "../config/database.js";
import { obterSegredoJwt } from "../config/jwtSecret.js";
import { hashPassword, verifyPassword } from "../utils/password.js";

const router = Router();

function gerarToken(cliente) {
  const secret = obterSegredoJwt();
  return jwt.sign(
    { id: cliente.id, email: cliente.email, tipo: "cliente" },
    secret,
    { expiresIn: "2h" },
  );
}

const soDigitos = (valor) => String(valor ?? "").replace(/\D/g, "");

// Assinatura da senha atual: o token de redefinição deixa de valer assim que a senha muda.
const assinaturaSenha = (hash) => createHash("sha256").update(String(hash)).digest("hex").slice(0, 16);

const SESSAO_EXPIRADA = "Sessão de recuperação expirada. Digite o CPF novamente.";

router.post("/cadastro", async (request, response, next) => {
  try {
    const nome = String(request.body?.nome ?? "").trim();
    const email = String(request.body?.email ?? "").trim().toLowerCase();
    const telefone = String(request.body?.telefone ?? "").trim();
    const cpf = soDigitos(request.body?.cpf);
    const senha = String(request.body?.senha ?? "");

    if (!nome || nome.length > 100 || !/^\S+@\S+\.\S+$/.test(email) || email.length > 100 || !telefone || telefone.length > 40 || cpf.length !== 11) {
      return response.status(400).json({ message: "Informe nome, e-mail válido e telefone." });
    }
    if (senha.length < 6) {
      return response.status(400).json({ message: "A senha deve ter pelo menos 6 caracteres." });
    }

    const [[cpfExistente]] = await pool.execute(
      "SELECT id FROM cadastro WHERE REPLACE(REPLACE(REPLACE(cpf, '.', ''), '-', ''), ' ', '') = ? LIMIT 1",
      [cpf],
    );
    if (cpfExistente) {
      return response.status(409).json({ message: "Este CPF já está vinculado a uma conta." });
    }

    const senhaHash = await hashPassword(senha);
    const [resultado] = await pool.execute(
      "INSERT INTO cadastro (nome, email, senha, telefone, cpf) VALUES (?, ?, ?, ?, ?)",
      [nome, email, senhaHash, telefone, cpf],
    );
    return response.status(201).json({
      message: "Cadastro criado. Entre com seu e-mail e senha.",
      cliente: { id: resultado.insertId, nome, email, telefone },
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return response.status(409).json({ message: "Este e-mail já possui uma conta." });
    }
    return next(error);
  }
});

router.post("/login", async (request, response, next) => {
  try {
    const email = String(request.body?.email ?? "").trim().toLowerCase();
    const senha = String(request.body?.senha ?? "");
    if (!email || !senha) {
      return response.status(400).json({ message: "Informe e-mail e senha." });
    }

    const [[cliente]] = await pool.execute(
      "SELECT id, nome, email, telefone, senha FROM cadastro WHERE email = ?",
      [email],
    );
    if (!cliente || !(await verifyPassword(senha, cliente.senha))) {
      return response.status(401).json({ message: "E-mail ou senha incorretos." });
    }

    const dadosCliente = {
      id: cliente.id,
      nome: cliente.nome,
      email: cliente.email,
      telefone: cliente.telefone,
    };
    return response.json({ token: gerarToken(dadosCliente), cliente: dadosCliente });
  } catch (error) {
    return next(error);
  }
});

// Esqueceu a senha, etapa 1: confere o CPF no banco e libera a troca de senha.
router.post("/recuperar/verificar", async (request, response, next) => {
  try {
    const cpf = soDigitos(request.body?.cpf);
    if (cpf.length !== 11) {
      return response.status(400).json({ message: "Informe um CPF com 11 dígitos." });
    }

    // O CPF pode estar salvo com ou sem máscara; compara só os dígitos.
    const [contas] = await pool.execute(
      "SELECT id, senha FROM cadastro WHERE REPLACE(REPLACE(REPLACE(cpf, '.', ''), '-', ''), ' ', '') = ? LIMIT 2",
      [cpf],
    );
    if (contas.length === 0) {
      return response.status(404).json({ message: "CPF não encontrado." });
    }
    if (contas.length > 1) {
      return response.status(409).json({ message: "Este CPF está ligado a mais de uma conta. Procure o suporte." });
    }

    const secret = obterSegredoJwt();
    const token = jwt.sign(
      { id: contas[0].id, tipo: "reset", v: assinaturaSenha(contas[0].senha) },
      secret,
      { expiresIn: "10m" },
    );
    return response.json({ token });
  } catch (error) {
    return next(error);
  }
});

// Esqueceu a senha, etapa 2: grava a nova senha usando o token da etapa 1.
router.post("/recuperar/redefinir", async (request, response, next) => {
  try {
    const token = String(request.body?.token ?? "");
    const senha = String(request.body?.senha ?? "");
    if (senha.length < 6) {
      return response.status(400).json({ message: "A senha deve ter pelo menos 6 caracteres." });
    }

    let dados;
    try {
      dados = jwt.verify(token, obterSegredoJwt());
    } catch {
      return response.status(401).json({ message: SESSAO_EXPIRADA });
    }
    if (dados.tipo !== "reset") {
      return response.status(401).json({ message: SESSAO_EXPIRADA });
    }

    const [[conta]] = await pool.execute("SELECT senha FROM cadastro WHERE id = ?", [dados.id]);
    if (!conta || assinaturaSenha(conta.senha) !== dados.v) {
      return response.status(401).json({ message: SESSAO_EXPIRADA });
    }

    await pool.execute("UPDATE cadastro SET senha = ? WHERE id = ?", [await hashPassword(senha), dados.id]);
    return response.json({ message: "Senha atualizada." });
  } catch (error) {
    return next(error);
  }
});

export default router;
