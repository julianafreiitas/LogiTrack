import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { Router } from "express";
import jwt from "jsonwebtoken";

import { pool } from "../config/database.js";
import { autenticar } from "../middlewares/authMiddleware.js";

const router = Router();

// CADASTRAR
router.post("/cadastro", async (req, res, next) => {
  try {
    const { nome, email, senha, telefone } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: "Preencha nome, e-mail e senha." });
    }
    if (senha.length < 6) {
      return res.status(400).json({ erro: "A senha deve ter no mínimo 6 caracteres." });
    }

    const [existe] = await pool.query("SELECT id_usuarios FROM usuarios WHERE email = ?", [email]);
    if (existe.length > 0) {
      return res.status(409).json({ erro: "Este e-mail já está cadastrado." });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const [resultado] = await pool.query(
      "INSERT INTO usuarios (nome, email, senha, telefone) VALUES (?, ?, ?, ?)",
      [nome, email, senhaHash, telefone || ""],
    );

    res.status(201).json({ id: resultado.insertId, mensagem: "Usuário cadastrado com sucesso." });
  } catch (err) {
    next(err);
  }
});

// ENTRAR (LOGIN)
router.post("/login", async (req, res, next) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: "Informe e-mail e senha." });
    }

    const [rows] = await pool.query(
      "SELECT id_usuarios, nome, email, senha, tipo FROM usuarios WHERE email = ? AND status = 'ativo'",
      [email],
    );
    const usuario = rows[0];

    // Mesma mensagem para e-mail inexistente ou senha errada
    if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
      return res.status(401).json({ erro: "E-mail ou senha inválidos." });
    }

    const token = jwt.sign(
      { id: usuario.id_usuarios, email: usuario.email, tipo: usuario.tipo },
      process.env.JWT_SECRET,
      { expiresIn: "2h" },
    );

    res.json({
      token,
      usuario: { id: usuario.id_usuarios, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo },
    });
  } catch (err) {
    next(err);
  }
});

// QUEM SOU EU (rota protegida: serve para validar o token)
router.get("/me", autenticar, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT id_usuarios, nome, email, tipo FROM usuarios WHERE id_usuarios = ? AND status = 'ativo'",
      [req.usuario.id],
    );
    if (rows.length === 0) {
      return res.status(401).json({ erro: "Usuário não encontrado." });
    }

    const u = rows[0];
    res.json({ usuario: { id: u.id_usuarios, nome: u.nome, email: u.email, tipo: u.tipo } });
  } catch (err) {
    next(err);
  }
});

// ESQUECEU A SENHA
router.post("/esqueci-senha", async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ erro: "Informe o e-mail." });
    }

    const [rows] = await pool.query(
      "SELECT id_usuarios FROM usuarios WHERE email = ? AND status = 'ativo'",
      [email],
    );

    if (rows.length > 0) {
      const token = crypto.randomBytes(32).toString("hex");
      await pool.query(
        "INSERT INTO recuperacao_senha (usuario_id, token, expira_em) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))",
        [rows[0].id_usuarios, token],
      );
      // Sem envio de e-mail por enquanto: o link aparece no terminal
      console.log(`Link de recuperação: ${process.env.FRONTEND_URL}/redefinir-senha?token=${token}`);
    }

    // Resposta igual exista ou não o e-mail
    res.json({ mensagem: "Se o e-mail existir, enviaremos as instruções de recuperação." });
  } catch (err) {
    next(err);
  }
});

// REDEFINIR SENHA
router.post("/redefinir-senha", async (req, res, next) => {
  try {
    const { token, novaSenha } = req.body;

    if (!token || !novaSenha || novaSenha.length < 6) {
      return res.status(400).json({ erro: "Token e nova senha (mín. 6 caracteres) são obrigatórios." });
    }

    const [rows] = await pool.query(
      "SELECT id, usuario_id FROM recuperacao_senha WHERE token = ? AND usado = FALSE AND expira_em > NOW()",
      [token],
    );
    if (rows.length === 0) {
      return res.status(400).json({ erro: "Token inválido ou expirado." });
    }

    const senhaHash = await bcrypt.hash(novaSenha, 10);
    await pool.query("UPDATE usuarios SET senha = ? WHERE id_usuarios = ?", [senhaHash, rows[0].usuario_id]);
    await pool.query("UPDATE recuperacao_senha SET usado = TRUE WHERE id = ?", [rows[0].id]);

    res.json({ mensagem: "Senha redefinida com sucesso." });
  } catch (err) {
    next(err);
  }
});

export default router;
