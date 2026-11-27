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

    const [[existente]] = await pool.execute(
      "SELECT id FROM cadastro WHERE email = ? OR cpf = ? LIMIT 1",
      [email, cpf],
    );
    if (existente) {
      return response.status(409).json({ message: "Este e-mail ou CPF já possui uma conta." });
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
