import { Router } from "express";
import jwt from "jsonwebtoken";
import pool from "../config/database.js";
import { hashPassword, verifyPassword } from "../utils/password.js";

const router = Router();

function normalizarCpf(valor) {
  return String(valor ?? "").replace(/\D/g, "");
}

function cpfValido(cpf) {
  if (!/^\d{11}$/.test(cpf) || /^([\d])\1{10}$/.test(cpf)) return false;
  const digito = (base, peso) => {
    const soma = [...base].reduce((total, numero, indice) => total + Number(numero) * (peso - indice), 0);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return digito(cpf.slice(0, 9), 10) === Number(cpf[9])
    && digito(cpf.slice(0, 10), 11) === Number(cpf[10]);
}

function gerarToken(cliente) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET precisa estar configurado.");
  return jwt.sign(
    { id: cliente.id, email: cliente.email, tipo: "cliente" },
    secret,
    { expiresIn: "2h" },
  );
}

router.post("/cadastro", async (request, response, next) => {
  try {
    const nome = String(request.body?.nome ?? "").trim();
    const email = String(request.body?.email ?? "").trim().toLowerCase();
    const telefone = String(request.body?.telefone ?? "").trim();
    const cpf = normalizarCpf(request.body?.cpf);
    const senha = String(request.body?.senha ?? "");

    if (!nome || nome.length > 100 || !/^\S+@\S+\.\S+$/.test(email) || email.length > 100 || !telefone || telefone.length > 40 || !cpfValido(cpf)) {
      return response.status(400).json({ message: "Informe nome, e-mail, telefone e um CPF válido." });
    }
    if (senha.length < 6) {
      return response.status(400).json({ message: "A senha deve ter pelo menos 6 caracteres." });
    }

    const senhaHash = await hashPassword(senha);
    const [resultado] = await pool.execute(
      "INSERT INTO cadastro (nome, email, senha, telefone, cpf) VALUES (?, ?, ?, ?, ?)",
      [nome, email, senhaHash, telefone, cpf],
    );
    return response.status(201).json({
      message: "Cadastro criado. Entre com seu e-mail e senha.",
      cliente: { id: resultado.insertId, nome, email, telefone, cpf },
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return response.status(409).json({ message: "Este e-mail ou CPF já possui uma conta." });
    }
    return next(error);
  }
});

router.post("/recuperar-senha/cpf", async (request, response, next) => {
  try {
    const cpf = normalizarCpf(request.body?.cpf);
    if (!/^\d{11}$/.test(cpf)) {
      return response.status(400).json({ message: "Informe os 11 dígitos do CPF cadastrado." });
    }

    const [[cliente]] = await pool.execute("SELECT id FROM cadastro WHERE cpf = ? LIMIT 1", [cpf]);
    if (!cliente) {
      return response.status(404).json({ message: "Não encontramos uma conta cadastrada com esse CPF." });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET precisa estar configurado.");
    const token = jwt.sign({ id: cliente.id, tipo: "recuperacao-cliente" }, secret, { expiresIn: "10m" });
    return response.json({ token });
  } catch (error) {
    return next(error);
  }
});

router.post("/recuperar-senha/redefinir", async (request, response, next) => {
  try {
    const token = String(request.body?.token ?? "");
    const senha = String(request.body?.senha ?? "");
    if (senha.length < 6 || senha.length > 128) {
      return response.status(400).json({ message: "A senha deve ter entre 6 e 128 caracteres." });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET precisa estar configurado.");
    let dados;
    try {
      dados = jwt.verify(token, secret);
    } catch {
      return response.status(401).json({ message: "A validação do CPF expirou. Informe o CPF novamente." });
    }
    if (dados.tipo !== "recuperacao-cliente" || !Number.isInteger(dados.id)) {
      return response.status(401).json({ message: "Token de recuperação inválido." });
    }

    const senhaHash = await hashPassword(senha);
    const [resultado] = await pool.execute("UPDATE cadastro SET senha = ? WHERE id = ?", [senhaHash, dados.id]);
    if (!resultado.affectedRows) return response.status(404).json({ message: "Conta não encontrada." });
    return response.json({ message: "Senha alterada com sucesso." });
  } catch (error) {
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

export default router;
